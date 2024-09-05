import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { copyDir, createDir, readDir, readFile, updateFile } from "./fs";
import {Terminal} from "./pty";

const terminalManager = new Terminal()

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
          return
        }
        await copyDir(type, name);
        socket.emit('success-repl-creation')
        
      }
    });
    socket.on('get-dir', async(name, callback) => {
        const dir = await readDir(`./user-files/${name}`)
        callback({
            dir,
            status: 'ok'
        })
    })

    socket.on('code-editor-change', async ({replName, file, code}) => {
      await updateFile(`./user-files/${replName}/${file}`, code)
    })
    socket.on('get-selected-file-code', async ({replName, file}, callback) => {
      // reading the file content of the selected file from the sidebar
      const fileContent = await readFile(`./user-files/${replName}/${file}`)
      callback({
        status: 'ok',
        fileContent
      })
    })
  });
};
