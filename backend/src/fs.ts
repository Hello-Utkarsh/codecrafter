import fs from "fs/promises";
import path from "path";

export const createDir = async (name: string) => {
  try {
    const createdDir = await fs.mkdir(`./user-files/${name}`);
    return 'success'
  } catch (error: any) {
    return error.code
  }
};

export const copyDir = async (fileType: string, name: string) => {
  // checks if the dir has multiple files and copy the files to the required location
  // fileType: node/python, name: name of the folder in which the base image will be copied to
    try {
        const copyData: {file: string, fileType: string}[] | undefined = await readDir(`./base/${fileType}`)
        if (copyData && copyData?.length > 1) {
            copyData.map(async (path) => {
                await fs.copyFile(`./base/${fileType}/${path.file}`, `./user-files/${name}/${path.file}`)
            })
            await readDir('./user-files')
        } else if (copyData) {
            await fs.copyFile(`./base/${fileType}/${copyData[0].file}`, `./user-files/${name}/${copyData[0].file}`)
            await readDir('./user-files')
        }
    } catch (error: any) {
        console.log(error.message)
    }
}

export const readDir = async (path: string): Promise<{file: string, fileType: string}[] | undefined> => {
  // returns all the files/folders in the given location in the
  // form of an array: {file: file name(index.js, main.py etc..), fileType: file/dir}
  try {
    const files = await fs.readdir(path);
    const dirContent: {file: string, fileType: string}[] = []
    await Promise.all(files.map(async (file) => {
        const fileType = (await fs.stat(`${path}/${file}`)).isFile() ? 'file' : 'dir'
        dirContent.push({file, fileType})
    }))
    return dirContent;
  } catch (error) {
    console.log(error);
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
    return readFile(path);
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
