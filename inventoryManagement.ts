import readline from "readline";

type Units = {
  tons: number;
  kilograms: number;
  grams: number;
  milligrams: number;
};

// all units underscore to milligrams conversion factors
// underscore as a separator to avoid confusion with the unit names
// underscore introduced in ECMAScript 2021 (ES2021) to avoid confusion with the unit names
const UNIT_TO_MG = {
  tons: 1_000_000_000,
  kilograms: 1_000_000,
  grams: 1_000,
  milligrams: 1,
};

// Converting various units to total milligrams
function toMilligrams(stock: Units): number {
  return (
    stock.tons * UNIT_TO_MG.tons +
    stock.kilograms * UNIT_TO_MG.kilograms +
    stock.grams * UNIT_TO_MG.grams +
    stock.milligrams
  );
}

// Converting total milligrams back to various units
function fromMilligrams(totalMg: number): Units {
  // Calculate tons from total milligrams
  const tons = Math.floor(totalMg / UNIT_TO_MG.tons);
  totalMg %= UNIT_TO_MG.tons;

  // Remaining milligrams after extracting tons, calculate kilograms
  const kilograms = Math.floor(totalMg / UNIT_TO_MG.kilograms);
  totalMg %= UNIT_TO_MG.kilograms;

  // Remaining milligrams after extracting kilograms, calculate grams
  const grams = Math.floor(totalMg / UNIT_TO_MG.grams);
  totalMg %= UNIT_TO_MG.grams;

  // Remaining milligrams after extracting grams, milligrams
  const milligrams = totalMg;

  return { tons, kilograms, grams, milligrams };
}

// Update stock based on purchase or sell operation
function updateStock(
  initialStock: Units,
  change: Units,
  operation: "purchase" | "sell"
): Units {
  // Convert all units to milligrams for calculation
  const initialMg = toMilligrams(initialStock);
  const changeMg = toMilligrams(change);

  const totalMg =
    operation === "purchase" ? initialMg + changeMg : initialMg - changeMg;

  if (totalMg < 0) {
    throw new Error("Insufficient stock");
  }

  return fromMilligrams(totalMg);
}

// Main inventory management function
const inventoryManagement = async (rl: readline.Interface): Promise<void> => {
  function question(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
  }

  // Prompt a single unit with default value shown, accept empty input to keep default
  async function promptUnit(
    unitName: keyof Units,
    defaultValue: number
  ): Promise<number> {
    const input = await question(
      `${
        unitName.charAt(0).toUpperCase() + unitName.slice(1)
      } (current: ${defaultValue}): `
    );
    if (input.trim() === "") {
      return defaultValue;
    }
    const nInput = Number(input.trim());
    if (isNaN(nInput) || nInput < 0 || !Number.isInteger(nInput)) {
      console.log(
        "Please enter a non-negative integer or leave empty to keep current value."
      );
      return promptUnit(unitName, defaultValue);
    }
    return nInput;
  }

  // Read units prompting each with current default values that allowing user to skip by pressing enter
  async function readUnitsWithDefaults(
    message: string,
    defaults: Units
  ): Promise<Units> {
    console.log(message);
    const tons = await promptUnit("tons", defaults.tons);
    const kilograms = await promptUnit("kilograms", defaults.kilograms);
    const grams = await promptUnit("grams", defaults.grams);
    const milligrams = await promptUnit("milligrams", defaults.milligrams);

    return { tons, kilograms, grams, milligrams };
  }

  try {
    // Start with zero defaults
    let initialStock: Units = {
      tons: 0,
      kilograms: 0,
      grams: 0,
      milligrams: 0,
    };
    let changeStock: Units = { tons: 0, kilograms: 0, grams: 0, milligrams: 0 };

    // Get initial stock, user can press Enter to accept zeros
    initialStock = await readUnitsWithDefaults(
      "👉 Enter initial stock quantities:",
      initialStock
    );

    // Get change stock, user can press Enter to accept zeros
    changeStock = await readUnitsWithDefaults(
      "\n👉 Enter change quantities:",
      changeStock
    );

    // Operation prompt of asking purchase or sell

    let operation = "";
    while (operation !== "purchase" && operation !== "sell") {
      operation = (await question('\n👉 Operation ("purchase" or "sell"): '))
        .trim()
        .toLowerCase();
      if (operation !== "purchase" && operation !== "sell") {
        console.log("\nInvalid operation, please enter 'purchase' or 'sell'.");
      }
    }

    // Calculate updated stock
    const updatedStock = updateStock(
      initialStock,
      changeStock,
      operation as "purchase" | "sell"
    );

    console.log("\n✅ Updated Stock:");
    console.table(updatedStock);
  } catch (err) {
    console.error("\n💔 Error:", (err as Error).message);
  }
};

export default inventoryManagement;
