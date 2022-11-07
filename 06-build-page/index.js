const path = require("path");
const { mkdir, rm, readdir, copyFile, readFile } = require("fs/promises");
const fs = require("fs");

const stylesDirName = "styles";
const destDirName = "project-dist";
const cssBundleFileName = "style.css";
const assetsDirName = "assets";
const htmlTemplateFileName = "template.html";
const htmlComponentsDirName = "components";

const srcStylesDirPath = path.join(__dirname, stylesDirName);
const destDirPath = path.join(__dirname, destDirName);
const cssBundleFilePath = path.join(destDirPath, cssBundleFileName);
const htmlTemplateFilePath = path.join(__dirname, htmlTemplateFileName);
const htmlComponentsDirPath = path.join(__dirname, htmlComponentsDirName);

createBuild();

async function readTemplate() {
  const writableStream = fs.createWriteStream(path.join(destDirPath, "index.html"), "utf-8");
  const readableStream = fs.createReadStream(htmlTemplateFilePath, "utf-8");
  readableStream.on("data", function(chunk) {
    let str = chunk;
    let newChunk = "";
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "{" && str[i + 1] === "{") {
        let moduleName = "";
        for (let j = i + 2; str.length; j++) {
          if (str[j] === "}" && str[j + 1] === "}") { 
            i = j + 1;
            break;
          }
          moduleName += str[j];
        }
        const modulePath = path.join(htmlComponentsDirPath, `${moduleName}.html`);
        const readableModule = fs.createReadStream(modulePath, "utf-8");
        readableModule.on("data", function(chunk) {
          writableStream.write(chunk);
        });
      } else {
        newChunk += str[i];
      }
    }
    writableStream.write(newChunk);
  });
}

async function createDir() {
  try {
    const createDir = await mkdir(destDirPath, { recursive: true });

    if (createDir) {
      await copyAssetsFiles(assetsDirName, path.join(__dirname), destDirPath);
      await createCssBundleFile();
      readTemplate();
      return ("dir crated");
    } else {
      return("dir exists");
    }
  } catch (err) {
    console.error(err.message);
  }
}

async function copyAssetsFiles(dirName, src, dest) {
  const srcPath = path.join(src, dirName);
  const destPath = path.join(dest, dirName);

  try {
    await mkdir(destPath, { recursive: true });
  } catch (err) {
    console.error(err.message);
  }
  
  const dirItemsList = await getDirEntries(srcPath);
  if (dirItemsList) {
    for (let item of dirItemsList) {
      if (item.isDirectory()) {
        await copyAssetsFiles(item.name, srcPath, destPath);
      } else {
        try {
          await copyFile(path.join(srcPath, item.name), path.join(destPath, item.name));
        } catch {
          console.log("The file could not be copied");
        }
      };
    }
  }
  return;
}

async function getDirEntries(dir) {
  try {
    const files = await readdir(dir, { withFileTypes: true });
    return files;
  } catch (err) {
    console.error(err);
  }
}

async function getFilesList() {
  const fileList = await getDirEntries(srcStylesDirPath);
  if (!fileList) return false;

  return fileList.filter((item) => {
    return !item.isDirectory();
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
  const cssFilesList = await getFilesList();
  if (!cssFilesList) return;
  for (let file of cssFilesList) {
    let filePath = path.join(srcStylesDirPath, file.name);
    let readableStream = fs.createReadStream(filePath, "utf-8");
    readableStream.on("data", function(chunk) {
      writableStream.write(chunk);
    });
  }
}

async function createBuild() {
  if(await createDir() === "dir exists") {
    try {
      await rm(destDirPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Directory is buzy - ${err.message}`);
      return;
    }
    createDir();
  };
}

