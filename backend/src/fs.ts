import fs from "fs/promises";
import path from "path";

export const createUserDir = async (userName: string) => {
  try {
    const createDir = await fs.mkdir(`./user-files/${userName}`);
    return "success";
  } catch (error: any) {
    return error.code;
  }
};

export const createDir = async (name: string, userName: string) => {
  try {
    const createdDir = await fs.mkdir(`./user-files/${userName}/${name}`);
    return "success";
  } catch (error: any) {
    return error.code;
  }
};

export const copyDir = async (
  fileType: string,
  name: string,
  userName: string
) => {
  // checks if the dir has multiple files and copy the files to the required location
  // fileType: node/python, name: name of the folder in which the base image will be copied to
  try {
    const copyData: any = await readDir(`./base/${fileType}`, true);
    if (copyData && copyData?.length > 1) {
      copyData.map(async (path: any) => {
        await fs.copyFile(
          `./base/${fileType}/${path.file}`,
          `./user-files/${userName}/${name}/${path.file}`
        );
      });
      await readDir(`./user-files/${userName}`);
    } else if (copyData) {
      await fs.copyFile(
        `./base/${fileType}/${copyData[0].file}`,
        `./user-files/${userName}/${name}/${copyData[0].file}`
      );
      await readDir(`./user-files/${userName}`);
    }
  } catch (error: any) {
    console.log(error.message, "copyDir");
  }
};

export const readDir = async (
  path: string,
  isCoping?: boolean
): Promise<string[] | undefined> => {
  // returns all the files/folders in the given location in the
  // form of an array: {file: file name(index.js, main.py etc..), fileType: file/dir}
  try {
    let files = await fs.readdir(path);
    // files = files.filter(file => file != 'Dockerfile')
    const dirContent: any = [];
    await Promise.all(
      files.map(async (file) => {
        if ((isCoping && file == 'Dockerfile') || file != 'Dockerfile') {
          const fileType = (await fs.stat(`${path}/${file}`)).isFile()
            ? "file"
            : "dir";
          dirContent.push({ file, fileType });
        }
      })
    );
    return dirContent;
  } catch (error) {
    console.log(error, "here");
    return undefined;
  }
};

export const readFile = async (file: string) => {
  try {
    const fileContent = await fs.readFile(file, "utf-8");
    const ext = path.extname(file);
    return { fileContent, ext };
  } catch (error) {
    console.log(error);
  }
};

export const updateFile = async (path: string, data: string) => {
  try {
    const writeFile = await fs.writeFile(path, data);
    return readFile(path);
  } catch (error) {
    console.log(error);
  }
};

export const deleteRepl = async (userName: string, repl: string) => {
  try {
    const deleteRepl = await fs.rm(`./user-files/${userName}/${repl}`, {
      recursive: true,
      force: true,
    });
    return "success";
  } catch (error: any) {
    return error.message;
  }
};

export const deleteFile = async (paths: string) => {
  try {
    const deleteFile = await fs.unlink(paths);
    const newDir = await readDir(path.dirname(paths));
    return newDir;
  } catch (error) {
    console.log(error, "in deletfile error");
  }
};
