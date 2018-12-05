"use strict";
import * as vscode from "vscode";
import { Executor } from "./executor";
import { Logger } from "./logger";

export class BuildCommands {
  public build() {
    const filename = "buildoutput.txt";
    this.normalBuild(filename).then(() => {
      Logger.Log("Done!");
    });
  }

  private normalBuild(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const curDir = vscode.workspace.workspaceFolders[0].uri.toString();
      const command = `dotnet build > ${curDir}/${filename}`;
      Logger.Log(`Executing ${command}`);

      Executor.exec(
        command,
        (err, stdout: string) => {
          if (err && err.killed) {
            Logger.Log("User has probably cancelled the build");
            reject(new Logger.Log("UserAborted"));
          }

          resolve();
        },
        curDir
      );
    });
  }

  private handler(output: string) {}
}
