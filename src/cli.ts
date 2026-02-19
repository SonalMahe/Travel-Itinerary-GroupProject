import inquirer from "inquirer";

import { getAllDestinations,} from "./services/destinationservices.js";

//const india = await getIndiaInfo();
//console.log(india.flag, india.countryName, india.currency);

// Or get all 4 at once:
const all = await getAllDestinations();
// all.forEach((country: any) => console.log(country.countryName));
all.forEach((country: any) =>
  console.log(
    "\n",
    country.flag,
    country.countryName,
    country.capital,
    country.currency,
  ),
);
async function main() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What is your name?"
    }
  ]);

  console.log("Hello", answers.name);
}

main();