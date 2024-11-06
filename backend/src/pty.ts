import { IPty } from "node-pty";

export class Terminal {
  private sessions: { [id: string]: { terminal: IPty } };
  constructor() {
    this.sessions = {};
  }

  async createPty(
    id: string,
    path: string,
    userName: string,
    onData: (data: string, id: string) => void
  ) {
    const os = require("os");
    const pty = require("node-pty");

    const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

    const ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      cwd: `./user-files/${userName}/${path}/`,
    });

    let isExecuted = false;

    // ptyProcess.write(
    //   `docker build -t ${userName.toLowerCase()}-${path.toLowerCase()} .\r`
    // );
    // ptyProcess.write(
    //   `docker container create -it --name ${userName.toLowerCase()}-${path.toLowerCase()} -v "$(pwd):/app" ${userName.toLowerCase()}-${path.toLowerCase()} tail -f /dev/null\r`
    // );
    // ptyProcess.write(
    //   `docker start ${userName.toLowerCase()}-${path.toLowerCase()}\r`
    // );
    // ptyProcess.write(
    //   `docker exec -it ${userName.toLowerCase()}-${path.toLowerCase()} sh\r`
    // );

    ptyProcess.on("data", (data: string) => {
      // if (data.includes("/app #")) {
        // isExecuted = true;
      // }
      // if (isExecuted) {
        onData(data, ptyProcess.pid);
      // }
    });

    this.sessions[id] = {
      terminal: ptyProcess,
    };
  }

  writePty(id: string, data: string) {
    const terminal = this.sessions[id].terminal;
    if (data == "exit\r" || data == "ls\r") {
      terminal.write("\r");
      return;
    }
    terminal.write(data);
  }
}
