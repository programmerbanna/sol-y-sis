import readline from "readline";
import mojoMutkiExchange from "./mojoMutkiExchange";
import inventoryManagement from "./inventoryManagement";
import messageProcessor from "./messageProcessor";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// List of project names
const projectNames = [
  "Mojo Mutki Exchange",
  "Inventory Management",
  "Message Processor",
];

// Wrap rl.question in a Promise for async/await
function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Placeholder functions for other projects
async function selectAndRunProject() {
  console.log("Choose a project to run:");
  projectNames.forEach((name, index) => {
    console.log(`${index + 1} - ${name}`);
  });

  const projectsNumb = projectNames.map((_, i) => i + 1).join("/");
  const answer = await question(
    `\nEnter the number of the project to run (eg ${projectsNumb}): `
  );
  console.log(`\n`);
  const choice = parseInt(answer.trim());

  if (isNaN(choice) || choice <= 0 || choice > projectNames.length) {
    console.log(
      `Please enter a number between 1 and ${projectNames.length}.\n`
    );
    return false; // invalid choice, stop or repeat in main
  }

  console.log(`\n🚀 Selected: ${projectNames[choice - 1]}\n`);

  switch (choice) {
    case 1:
      await mojoMutkiExchange(rl);
      break;
    case 2:
      await inventoryManagement(rl);
      break;
    case 3:
      await messageProcessor(rl);
      break;
    default:
      console.log("Invalid choice\n");
  }
  console.log(
    `\n❤️ Finished! Thank you for running the ${
      projectNames[choice - 1]
    } project!\n`
  );

  return true; // project ran successfully
}

//Main function to run the project selection loop
async function main() {
  while (true) {
    const ran = await selectAndRunProject();
    if (!ran) break;

    const again = await question(
      "\n⚠️ Do you want to run another project? (Y/n): "
    );
    // Default to 'y' if user just presses Enter (empty input)
    const normalized = again.trim().toLowerCase();
    if (normalized !== "y" && normalized !== "") {
      console.log("👋 Goodbye!");
      break;
    }
    console.log("\n"); // spacing before next menu
  }
  rl.close();
}

main();
