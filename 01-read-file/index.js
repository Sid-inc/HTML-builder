const path = require("path");
const fs = require("fs");
const { stdout } = process;

const filePath = path.join(__dirname, "text.txt");
const readableStream = fs.createReadStream(filePath, "utf-8");
readableStream.on("data", function(chunk) {
  stdout.write(chunk);
});
