const path = require("path");
const fs = require("fs");
const { stat } = require("fs");
const { readdir } = require("fs/promises");
const { resolve } = require("path");
const { stdout } = process;

const targetFolder = "secret-folder";
const currentDir = path.join(__dirname, targetFolder);
const dirFiles = [];

async function getDirEntries() {
  try {
    const files = await readdir(currentDir, { withFileTypes: true });
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

function getFileName(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}

function getFileExt(fileName) {
  return path.extname(fileName).slice(1);
}

function getFileSize(file) {
  stat(path.join(currentDir, `${file.name}.${file.ext}`), (err, stats) => {
    file.size = `${(stats.size / 1024).toFixed(3)}KB`;
    stdout.write(`${file.name} - ${file.ext} - ${file.size}\r\n`);
  });
  
}

async function getDirFiles() {
  const filesList = await getFilesList();
  if (!filesList) return;

  for (let file of filesList) {
    let dirFilesItem = {};
    dirFilesItem.name = getFileName(file.name);
    dirFilesItem.ext = getFileExt(file.name);
    dirFiles.push(dirFilesItem);
  }

  showDirFiles();
}

async function showDirFiles() {
  for (let file of dirFiles) {
    getFileSize(file);
  }
}

getDirFiles();