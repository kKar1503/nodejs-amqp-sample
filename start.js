const { exec } = require("child_process");

// Get arguments from command line
const args = process.argv.slice(2);

const availableProcesses = ["processorA", "processorB", "logger", "apiGateway"];

const processToRun = args[0];

if (args.length < 1 || processToRun === undefined) {
  console.log("Not enough arguments!");
  process.exit(1);
}

if (!availableProcesses.includes(processToRun)) {
  console.log("Invalid argument!");
  process.exit(1);
}

// Prepare the command to execute the service
const buildCommand = `tsc -p ${processToRun}.tsconfig.json`;

// Execute the build command
exec(buildCommand, (error, _, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    process.exit(1);
  }

  // Execute the service
  let file;
  switch (processToRun) {
    case "processorA": {
      file = "node microservices/processor-a.js";
      break;
    }
    case "processorB": {
      file = "node microservices/processor-b.js";
      break;
    }
    case "logger": {
      file = "node microservices/logger.js";
      break;
    }
    case "apiGateway": {
      file = "node api-gateway/server.js";
      break;
    }
  }

  // Execute the individual service
  const server = exec(file, (serverError, _, serverStderr) => {
    if (serverError) {
      console.error(`Error starting server: ${serverError.message}`);
      return;
    }
    if (serverStderr) {
      console.error(`Server Error: ${serverStderr}`);
      return;
    }
  });

  // Prints out the service's stdout
  server.stdout?.on("data", (data) => {
    console.log(data.replace("\n", ""));
  });
});
