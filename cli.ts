import inquirer from "inquirer";

const mainMenu = async () => {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "what whoud you like to do?",
      choices: ["View Trips", "Add Activity", "View Budget", "Exit"],
    },
  ]);

  // Handle user choices here
};

mainMenu();
