import { runInThisContext } from "vm";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    new TestSourceControlInputBoxExtension(context);
}

export function deactivate() {
    // no-op
}

export const InputBoxStatusCommand = { id: "sourceControlInputBoxStatus" };
export const InputBoxShowCommand = { id: "sourceControlInputBoxShow" };
export const InputBoxHideCommand = { id: "sourceControlInputBoxHide" };

export class TestSourceControlInputBoxExtension {
    constructor(readonly context: vscode.ExtensionContext) {
        this.registerCommands();
        this.scm.inputBox.placeholder = "Test-SCM: Enter commit message here";
    }

    protected scm = vscode.scm.createSourceControl("scmTest", "scmTest");

    protected inputBoxStatus(): void {
        const msg =
            "sourceControl.InputBox = " +
            JSON.stringify(
                this.scm.inputBox,
                ["placeholder", "value", "visible"],
                4
            );
        console.log(msg);
        vscode.window.showInformationMessage(msg);
    }

    protected registerCommands(): void {
        const inputBoxStatusCommand = vscode.commands.registerCommand(
            InputBoxStatusCommand.id,
            () => {
                this.inputBoxStatus();
            }
        );

        const inputBoxShowCommand = vscode.commands.registerCommand(
            InputBoxShowCommand.id,
            () => {
                this.scm.inputBox.visible = true;
                this.inputBoxStatus();
            }
        );

        const inputBoxHideCommand = vscode.commands.registerCommand(
            InputBoxHideCommand.id,
            () => {
                this.scm.inputBox.visible = false;
                this.inputBoxStatus();
            }
        );

        this.context.subscriptions.push(inputBoxStatusCommand);
        this.context.subscriptions.push(inputBoxShowCommand);
        this.context.subscriptions.push(inputBoxHideCommand);
    }
}
