const path = require("path");
const { mkdir, rm, readdir, copyFile } = require("fs/promises");

const srcDirName = "files";
const destDirName = "files-copy";
const srcDirPath = path.join(__dirname, srcDirName);
const destDirPath = path.join(__dirname, destDirName);

copyFiles();

async function createDir() {
  try {
    const createDir = await mkdir(destDirPath, { recursive: true });

    if (createDir) {
      return ("dir crated");
    } else {
      return("dir exists");
    }
  } catch (err) {
    console.error(err.message);
  }
}

async function copyFiles() {
  if(await createDir() === "dir exists") {
    try {
      await rm(destDirPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Directory is buzy - ${err.message}`);
      return;
    }
    createDir();
  };
  const fileList = await getFilesList();
  if(!fileList) return;
  for (let file of fileList) {
    const srcFilePath = path.join(srcDirPath, file.name); 
    const destFilePath = path.join(destDirPath, file.name); 

    try {
      await copyFile(srcFilePath, destFilePath);
    } catch {
      console.log("The file could not be copied");
    }
  }
  console.log("Files copied");
}

async function getDirEntries() {
  try {
    const files = await readdir(srcDirPath, { withFileTypes: true });
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
