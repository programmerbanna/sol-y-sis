import readline from "readline";

const mojoMutkiExchange = async (rl: readline.Interface): Promise<number> => {
  function question(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
  }

  let initialMojos: number | null = null;

  // Retry loop for input validation
  while (initialMojos === null) {
    const input = await question("Enter initial number of Mojos: ");
    const parsed = parseInt(input.trim());

    if (isNaN(parsed) || parsed <= 0) {
      console.log("Invalid number. Please enter a positive number.");
    } else {
      initialMojos = parsed;
    }
  }

  let mojos = initialMojos;
  let mutkis = 0;
  let totalEaten = 0;
  let step = 1;

  while (mojos > 0) {
    console.log(`\n`);
    console.log(`👉 Eating ${mojos} Mojos...`);
    totalEaten += mojos;
    mutkis += mojos;
    console.log(`Got ${mojos} Mutkis after ${mojos} Mojos eating.`);
    mojos = 0;

    const exchangedMojos = Math.floor(mutkis / 3);
    const leftoverMutkis = mutkis % 3;
    if (exchangedMojos > 0) {
      console.log(
        `Exchanging ${exchangedMojos * 3} Mutkis for ${exchangedMojos} Mojos.`
      );
    } else {
      console.log(`Not enough Mutkis to exchange.`);
    }

    mutkis = leftoverMutkis;
    mojos += exchangedMojos;

    console.log(`🚩 Mutkis left after exchange: ${mutkis}`);

    step++;
  }
  console.log(`\n✅ Total Mojos eaten: ${totalEaten}`);

  return totalEaten;
};

export default mojoMutkiExchange;
