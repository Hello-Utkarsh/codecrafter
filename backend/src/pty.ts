import { IPty } from "node-pty";

export class Terminal {
  private sessions: { [id: string]: { terminal: IPty } };
  constructor() {
    this.sessions = {};
  }

  async createPty(
    id: string,
    path: string,
    onData: (data: string, id: string) => void
  ) {
    const os = require("os");
    const pty = require("node-pty");

    const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

    const ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      cwd:  `./user-files/${path}/`,
    });
    await ptyProcess.write(`docker build -t ${path} .\r`)
    await ptyProcess.write(`docker run -d -v .:/app --name ${path} ${path} tail -f /dev/null\r`)
    await ptyProcess.write(`docker exec -it ${path} /bin/sh\r`)

    ptyProcess.on("data", (data: string) => onData(data, ptyProcess.pid));


    this.sessions[id] = {
      terminal: ptyProcess,
    };
  }

  writePty(id: string, data: string) {
    const terminal = this.sessions[id].terminal;
    terminal.write(data);
  }
}
