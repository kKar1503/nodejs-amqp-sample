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
  let file, cwd;
  switch (processToRun) {
    case "processorA": {
      file = "node processor-a.js";
      cwd = "./microservices";
      break;
    }
    case "processorB": {
      file = "node processor-b.js";
      cwd = "./microservices";
      break;
    }
    case "logger": {
      file = "node logger.js";
      cwd = "./microservices";
      break;
    }
    case "apiGateway": {
      file = "node server.js";
      cwd = "./api-gateway";
      break;
    }
  }

  // Execute the individual service
  const server = exec(
    file,
    { cwd: cwd },
    (serverError, serverStdout, serverStderr) => {
      if (serverError) {
        console.error(`Error starting server: ${serverError.message}`);
        return;
      }
      if (serverStderr) {
        console.error(`Server Error: ${serverStderr}`);
        return;
      }
    },
  );

  // Prints out the service's stdout
  server.stdout?.on("data", (data) => {
    console.log(data.replace("\n", ""));
  });
});
