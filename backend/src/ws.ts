import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { copyDir, createDir, readFile } from "./fs";

export const initWs = (server: HttpServer) => {
  console.log("object");
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
        if (is_created[0] != "success") {
          socket.emit("dir-exist", is_created);
        }
        await copyDir(type, name);
        socket.emit('success-repl-creation')
      }
    });
  });
};

const initHndlr = (socket: Socket, replid: string) => {
  socket.on("fetchDir", async (dir: any) => {
    const dirData = await readFile(dir);
    socket.emit("fetchedDir", dirData);
  });
};
