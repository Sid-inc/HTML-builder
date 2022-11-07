const path = require("path");
const { readdir } = require("fs/promises");
const fs = require("fs");

const stylesDirName = "styles";
const destCssBundleDirName = "project-dist";
const cssBundleFileName = "bundle.css";
const srcStylesDirPath = path.join(__dirname, stylesDirName);
const destCssBundleDirPath = path.join(__dirname, destCssBundleDirName);
const cssBundleFilePath = path.join(destCssBundleDirPath, cssBundleFileName);

createCssBundleFile();

async function getDirEntries() {
  try {
    const files = await readdir(srcStylesDirPath, { withFileTypes: true });
    return files;
  } catch (err) {
    console.error(err);
  }
}

async function getFilesList() {
  const fileList = await getDirEntries();
  if (!fileList) return false;

  return fileList.filter((item) => {
    return !item.isDirectory();
  });
}

async function filterCssFiles() {
  const cssFilesList = await getFilesList();
  if (!cssFilesList) return false;

  return cssFilesList.filter((item) => {
    return path.extname(item.name) === ".css";
  });
}

async function createCssBundleFile() {
  fs.access(cssBundleFilePath, fs.F_OK, (err) => {
    if (!err) {
      fs.unlink(cssBundleFilePath, err => {
        if(err) throw `Bundle file is busy. ${err}`;
        readCssFiles();
      });
    } else {
      readCssFiles();
    }
  });
}

async function readCssFiles() {
  const writableStream = fs.createWriteStream(cssBundleFilePath, "utf-8");
  const cssFilesList = await filterCssFiles();
  if (!cssFilesList) return;
  for (let file of cssFilesList) {
    let filePath = path.join(srcStylesDirPath, file.name);
    let readableStream = fs.createReadStream(filePath, "utf-8");
    readableStream.on("data", function(chunk) {
      writableStream.write(chunk);
    });
  }
}
