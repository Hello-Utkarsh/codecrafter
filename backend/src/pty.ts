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
      cwd: `./user-files/${path}/`,
    });

    let isExecuted = false;

    ptyProcess.write(`docker build -t ${path} .\r`);
    ptyProcess.write(
      `docker container create -it --name ${path} ${path} tail -f /dev/null\r`
    );
    ptyProcess.write(`docker start ${path}\r`);
    ptyProcess.write(`docker exec -it ${path} sh\r`);

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
