import fs from "fs/promises";
import path from "path";

export const createDir = async (name: string) => {
  try {
    const createdDir = await fs.mkdir(`./user-files/${name}`);
    return ['success', readDir(`./user-files/${name}`)]
  } catch (error: any) {
    return error.code
  }
};

export const copyDir = async (fileType: string, name: string) => {
    try {
        const copyData: string[] | undefined = await readDir(`./base/${fileType}`)
        if (copyData && copyData?.length > 1) {
            copyData.map(async (path) => {
                await fs.copyFile(`./base/${fileType}/${path}`, `./user-files/${name}/${path}`)
            })
            await readDir('./user-files')
        } else {
            await fs.copyFile(`./base/${fileType}/${copyData}`, `./user-files/${name}/${copyData}`)
            await readDir('./user-files')
        }
    } catch (error: any) {
        console.log(error.message)
    }
}

export const readDir = async (path: string): Promise<string[] | undefined> => {
  try {
    console.log(path);
    const dirContent = await fs.readdir(path);
    return dirContent;
  } catch (error) {
    console.log(error, "in dir");
    return undefined
  }
};

export const readFile = async (path: string) => {
  try {
    const fileContent = await fs.readFile(path, "utf-8");
    return fileContent;
  } catch (error) {
    console.log(error);
  }
};

export const updateFile = async (path: string, data: string) => {
  try {
    const writeFile = await fs.writeFile(path, data);
    readFile(path);
  } catch (error) {
    console.log(error);
  }
};

export const deleteFile = async (paths: string) => {
  try {
    const deleteFile = await fs.unlink(paths);
    console.log(path.dirname(paths), "in deletefile");
    const newDir = await readDir(path.dirname(paths));
    return newDir;
  } catch (error) {
    console.log(error, "in deletfile error");
  }
};
