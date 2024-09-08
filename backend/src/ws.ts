import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { copyDir, createDir, readDir, readFile, updateFile } from "./fs";
import { Terminal } from "./pty";

const terminalManager = new Terminal();
let currentDir = ''

export const initWs = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket: Socket) => {
    socket.on("create-repl", async (replData) => {
      if (replData) {
        const [name, type] = replData;
        const is_created = await createDir(name);
        if (is_created != "success") {
          socket.emit("dir-exist", is_created);
          return;
        }
        await copyDir(type, name);
        socket.emit("success-repl-creation");
      }
    });

    socket.on("get-dir", async (name, callback) => {
      currentDir = name
      const dir = await readDir(`./user-files/${name}`);
      callback({
        dir,
        status: "ok",
      });
    });

    socket.on("code-editor-change", async ({ replName, file, code }) => {
      await updateFile(`./user-files/${replName}/${file}`, code);
    });

    socket.on('get-selected-dir', async({replName, dir}, callback) => {
      try {
        const dirContent = await readDir(`./user-files/${replName}/${dir}`)
        callback({
          status: 'ok',
          dirContent
        })
      } catch (error) {
        callback({
          status: '404'
        })
      }
    })

    socket.on(
      "get-selected-file-code",
      async ({ replName, file }, callback) => {
        // reading the file content of the selected file from the sidebar
        const fileContent = await readFile(`./user-files/${replName}/${file}`);
        callback({
          status: "ok",
          fileContent,
        });
      }
    );

    socket.on("requestTerminal", async (dir) => {
      terminalManager.createPty("abc", `./user-files/${dir}/`, async (data: any, id: any) => {
        socket.emit('terminal-response', data)
        const dirContent = await readDir(`./user-files/${currentDir}/`)
        socket.emit('dir-change', dirContent)
      });
    });

    socket.on("terminal-exec", async (command: string, replData: string[]) => {
      terminalManager.writePty("abc", command);
    });
  });
};
