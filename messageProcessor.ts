import readline from "readline";
import amqp from "amqplib";
import { MongoClient, ObjectId } from "mongodb";

const DEFAULT_MONGO_URL = "mongodb://localhost:27017/msgproject";
const DEFAULT_RABBIT_URL = "amqp://admin:admin@localhost:5672";

const collectionName = "messages";

const retryDelays = [2, 5, 10, 20, 30, 60]; // minutes

function getRetryDelay(attempt: number): number {
  return retryDelays[Math.min(attempt - 1, retryDelays.length - 1)];
}

function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

function netfeeCustomerRecharge(message: any) {
  console.log(`💰 Customer recharged for trxId ${message.trxId}`);
}

// Test MongoDB connection
async function testMongoConnection(url: string) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
  } finally {
    await client.close();
  }
}

// Test RabbitMQ connection
async function testRabbitConnection(url: string) {
  const conn = await amqp.connect(url);
  await conn.close();
}

async function promptConnections(rl: readline.Interface) {
  let mongoUrl = DEFAULT_MONGO_URL;
  let rabbitUrl = DEFAULT_RABBIT_URL;

  // Retry MongoDB until success
  while (true) {
    try {
      console.log(`Trying MongoDB at: ${mongoUrl}`);
      await testMongoConnection(mongoUrl);
      console.log("✅ MongoDB connection successful.");
      break; // MongoDB ok — exit mongo retry loop
    } catch {
      console.log("❌ MongoDB connection failed.");
      const input = await question(
        rl,
        "Enter MongoDB URL or Enter to retry default: "
      );
      if (input.trim()) mongoUrl = input.trim();
      // else retry same mongoUrl
    }
  }

  // Retry RabbitMQ until success
  while (true) {
    try {
      console.log(`Trying RabbitMQ at: ${rabbitUrl}`);
      await testRabbitConnection(rabbitUrl);
      console.log("✅ RabbitMQ connection successful.");
      break; // RabbitMQ ok — exit rabbit retry loop
    } catch {
      console.log("❌ RabbitMQ connection failed.");
      const input = await question(
        rl,
        "Enter RabbitMQ URL or Enter to retry default: "
      );
      if (input.trim()) rabbitUrl = input.trim();
      // else retry same rabbitUrl
    }
  }

  return { mongoUrl, rabbitUrl };
}

// Setup RabbitMQ queues
async function setupQueues(channel: amqp.Channel) {
  await channel.assertQueue("processing_queue", { durable: true });
  await channel.assertQueue("retry_queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": "processing_queue",
    },
  });
}

// Insert a new transaction into MongoDB and send to RabbitMQ
async function insertTransaction(collection: any, channel: amqp.Channel) {
  const trxId = Math.floor(Math.random() * 1000);
  const amount = Math.floor(Math.random() * 990) + 10;
  const now = new Date();

  const doc = {
    trxId,
    amount,
    status: "pending",
    attemptCount: 0,
    nextAttemptAt: now,
    createdAt: now,
  };

  const { insertedId } = await collection.insertOne(doc);
  console.log(`➕ Inserted trxId=${trxId} amount=${amount} _id=${insertedId}`);

  const msgBuffer = Buffer.from(
    JSON.stringify({ _id: insertedId.toString(), trxId, amount })
  );
  channel.sendToQueue("processing_queue", msgBuffer, { persistent: true });
}

// Process a message from RabbitMQ
async function processMessage(
  collection: any,
  msg: amqp.ConsumeMessage,
  channel: amqp.Channel
) {
  const data = JSON.parse(msg.content.toString());
  const message = await collection.findOne({ _id: new ObjectId(data._id) });
  if (!message) {
    console.warn(`Message _id=${data._id} not found, acking.`);
    channel.ack(msg);
    return;
  }

  const randomId = Math.floor(Math.random() * 1000);
  console.log(
    `Processing _id=${message._id} trxId=${message.trxId} random=${randomId}`
  );

  if (randomId === message.trxId) {
    await collection.updateOne(
      { _id: message._id },
      { $set: { status: "success" } }
    );
    netfeeCustomerRecharge(message);
    console.log(`✅ Processed _id=${message._id} successfully.`);
    channel.ack(msg);
  } else {
    const attempts = message.attemptCount + 1;
    const delayMins = getRetryDelay(attempts);
    const nextAttempt = new Date(Date.now() + delayMins * 60 * 1000);

    await collection.updateOne(
      { _id: message._id },
      {
        $set: { status: "rejected", nextAttemptAt: nextAttempt },
        $inc: { attemptCount: 1 },
      }
    );

    const retryMsg = Buffer.from(msg.content);
    await channel.sendToQueue("retry_queue", retryMsg, {
      expiration: delayMins * 60 * 1000,
      persistent: true,
    });

    console.log(
      `❌ Failed _id=${message._id}, retry after ${delayMins} minutes.`
    );
    channel.ack(msg);
  }
}

const messageProcessor = async (rl: readline.Interface): Promise<void> => {
  try {
    const { mongoUrl, rabbitUrl } = await promptConnections(rl);

    const mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    const db = mongoClient.db();
    const collection = db.collection(collectionName);

    const conn = await amqp.connect(rabbitUrl);
    const channel = await conn.createChannel();

    await setupQueues(channel);

    console.log("Message Processor started.\n");

    const countInput = await question(
      rl,
      "How many random transactions to generate?"
    );
    const count = parseInt(countInput.trim()) || 0;

    for (let i = 0; i < count; i++) {
      await insertTransaction(collection, channel);
    }

    channel.consume(
      "processing_queue",
      async (msg) => {
        if (msg) {
          try {
            await processMessage(collection, msg, channel);
          } catch (err) {
            console.error("Processing error:", err);
            // message not acked => will be redelivered
          }
        }
      },
      { noAck: false }
    );

    let running = true;
    while (running) {
      const answer = await question(
        rl,
        "Type 'exit' to quit or Enter to continue: "
      );
      if (answer.trim().toLowerCase() === "exit") running = false;
    }

    console.log("💔 Stopping processor...");
    await channel.close();
    await conn.close();
    await mongoClient.close();
  } catch (err) {
    console.error("💔 Fatal error:", err);
  }
};

export default messageProcessor;
