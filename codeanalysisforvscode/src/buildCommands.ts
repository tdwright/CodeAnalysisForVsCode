"use strict";
import * as vscode from "vscode";
import { Executor } from "./executor";
import { Logger } from "./logger";

export class BuildCommands {
  public build() {
    this.normalBuild().then(() => {
      Logger.Log("Done");
    });
  }

  private normalBuild() {
    return new Promise((resolve, reject) => {
      const command = "dotnet build";
      Logger.Log(`Executing ${command}`);

      return Executor.exec(
        command,
        (err, stdout: string) => {
          if (err && err.killed) {
            Logger.Log("User has probably cancelled the build");
            reject(new Logger.Log("UserAborted"));
          }

          Logger.Log(stdout);

          resolve();
        },
        vscode.workspace.workspaceFolders[0].uri.toString()
      );
    });
  }
}
