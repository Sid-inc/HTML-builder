const path = require("path");
const fs = require("fs");
const readline = require("readline");
const { stdin, stdout, stderr } = process;

const filePath = path.join(__dirname, "text.txt");
const writableStream = fs.createWriteStream(filePath, "utf-8");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

stdout.write('Input some text\n');
rl.on("line", (input) => {
  if (input === "exit") {
    process.exit();
  };
  writableStream.write(input);
});

process.on("SIGINT", () => {
  process.exit();
});

process.on("exit", code => {
  if (code === 0 || code === 1) {
    rl.close();
    stdout.write("Thanks, goodbye!\n");
  } else {
    stderr.write(`Error. programm stopped with code: ${code}`);
    process.exit();
  }
});