import { IPty } from "node-pty";

export class Terminal {
  private sessions: { [id: string]: { terminal: IPty } };
  constructor() {
    this.sessions = {};
  }

  createPty(id: string, path: string) {
    const pty = require("pty.js");

    const term = pty.spawn("bash", [], {
      name: "xterm-color",
      cols: 80,
      cwd: path,
    });

    this.sessions[id] = {
      terminal: term,
    };
  }

  writePty(id: string, data: string) {
    this.sessions[id].terminal.write(data);
  }
}
