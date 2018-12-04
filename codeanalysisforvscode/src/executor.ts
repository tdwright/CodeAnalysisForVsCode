"use strict";
import { ChildProcess, exec } from "child_process";
import { platform } from "os";
import * as vscode from "vscode";
const fkill = require("fkill");

export class Executor {
  public static runInTerminal(
    command: string,
    cwd?: string,
    addNewLine: boolean = true,
    terminal: string = "CA for VS Code"
  ): void {
    if (this.terminals[terminal] === undefined) {
      this.terminals[terminal] = vscode.window.createTerminal(terminal);
    }
    this.terminals[terminal].show();
    if (cwd) {
      this.terminals[terminal].sendText(`cd "${cwd}"`);
    }
    this.terminals[terminal].sendText(command, addNewLine);
  }

  public static exec(
    command: string,
    callback: any,
    cwd?: string,
    addToProcessList?: boolean
  ) {
    const childProcess = exec(
      this.handleWindowsEncoding(command),
      { encoding: "utf8", maxBuffer: 5120000, cwd },
      callback
    );

    if (addToProcessList) {
      this.processes.push(childProcess);

      childProcess.on("close", (code: number) => {
        const index = this.processes.map(p => p.pid).indexOf(childProcess.pid);
        if (index > -1) {
          this.processes.splice(index, 1);
        }
      });
    }

    return childProcess;
  }

  public static onDidCloseTerminal(closedTerminal: vscode.Terminal): void {
    delete this.terminals[closedTerminal.name];
  }

  public static stop() {
    this.processes.forEach(p => {
      p.killed = true;
      fkill(p.pid, { force: true });
    });

    this.processes = [];
  }

  private static terminals: { [id: string]: vscode.Terminal } = {};

  private static isWindows: boolean = platform() === "win32";

  private static processes: ChildProcess[] = [];

  private static handleWindowsEncoding(command: string): string {
    return this.isWindows ? `chcp 65001 | ${command}` : command;
  }
}
