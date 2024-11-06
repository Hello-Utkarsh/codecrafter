import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import {
  copyDir,
  createDir,
  createUserDir,
  deleteRepl,
  readDir,
  readFile,
  updateFile,
} from "./fs";
import { Terminal } from "./pty";
import fs from "fs/promises";

const terminalManager = new Terminal();

export const initWs = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket: Socket) => {
    socket.on("createUserDir", async (userName: string) => {
      if (userName) {
        const createDir = await createUserDir(userName);
        const userDir = await readDir(`./user-files/${userName}`);
        const updatedArray = await Promise.all(
          (userDir ?? []).map(async (x: any, _) => {
            const docContent = await readFile(
              `./user-files/${userName}/${x.file}/Dockerfile`
            );
            const docType = docContent?.fileContent
              .split("\n")[0]
              .split(" ")[1]
              .split(":")[0];
            return { ...x, docType: docType };
          })
        );
        if (createDir != "success") {
          socket.emit("createUserDirErr", createDir, updatedArray);
        }
      }
    });

    socket.on(
      "delete-repl",
      async (userName: string, repl: string, callback: any) => {
        const del = await deleteRepl(userName, repl);
        if (del == "success") {
          callback(del, null);
        } else {
          callback(null, del);
        }
      }
    );

    socket.on("create-repl", async (replData) => {
      if (replData) {
        const [name, type, userName] = replData;
        const is_created = await createDir(name, userName);
        if (is_created != "success") {
          socket.emit("dir-exist", is_created);
          return;
        }
        await copyDir(type, name, userName);
        socket.emit("success-repl-creation");
      }
    });

    socket.on("get-dir", async (name, userName) => {
      const path = `./user-files/${userName}/${name}`;
      if (path) {
        const content = await readDir(path);
        socket.emit("get-dir-change", { content, type: "dir" });
        return;
      }
      const dir = await readDir(`./user-files/${userName}/${name}`);
      socket.emit("get-dir-change", {
        dir,
        status: "ok",
      });
    });

    socket.on(
      "code-editor-change",
      async ({ replName, file, code, userName }) => {
        await updateFile(`./user-files/${userName}/${replName}/${file}`, code);
      }
    );

    socket.on(
      "get-selected-dir",
      async ({ replName, dir, userName }, callback) => {
        try {
          const dirContent = await readDir(
            `./user-files/${userName}/${replName}/${dir}`
          );
          callback({
            status: "ok",
            dirContent,
          });
        } catch (error) {
          callback({
            status: "404",
          });
        }
      }
    );

    socket.on(
      "searchDir",
      async (path: string, replName, userName: string, callback) => {
        const dirContent = `./user-files/${userName}/${replName}/${path}`;
        try {
          const isDir = (await fs.stat(dirContent)).isDirectory();
          if (isDir) {
            const content = await readDir(dirContent);
            callback({ content, type: "dir" });
            return;
          }
          const content = await readFile(dirContent);
          callback({ content, type: "file" });
        } catch (error: any) {
          callback({ err: error.message });
        }
      }
    );

    socket.on(
      "get-selected-file-code",
      async ({ replName, file, userName }, callback) => {
        // reading the file content of the selected file from the sidebar
        const fileContent = await readFile(
          `./user-files/${userName}/${replName}/${file}`
        );
        callback({
          status: "ok",
          fileContent,
        });
      }
    );

    socket.on("requestTerminal", async (dir, userName) => {
      terminalManager.createPty(
        `${userName}-${dir}`,
        dir,
        userName,
        async (data: any, id: any) => {
          socket.emit("terminal-response", data);
          const dirContent = await readDir(`./user-files/${userName}/${dir}`);
          socket.emit("dir-change", dirContent);
        }
      );
    });

    // execute the command in the terminal
    socket.on(
      "terminal-exec",
      async (command: string, replData: string[], userName: string) => {
        terminalManager.writePty(`${userName}-${replData[0]}`, command);
      }
    );
    // socket.on("disconnect", () => {
    // });
  });
};
