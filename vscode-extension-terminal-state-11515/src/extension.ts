import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	new TestTerminalExtension(context);
}

export function deactivate() {
    // no-op
 }

export const ShowTerminalState = { id: 'terminalState.show' };

export class TestTerminalExtension {

    constructor(readonly context: vscode.ExtensionContext) {
        this.registerCommands();
    }

    protected registerCommands(): void {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(ShowTerminalState.id, () => {
                const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
                vscode.window.onDidChangeTerminalState(t => {
                    if (t === terminal) {
                        vscode.window.showInformationMessage("Terminal state has changed: " + JSON.stringify(terminal.state, undefined, 4));
                    }
                })
                terminal.show();
                vscode.window.showInformationMessage("Terminal state: " + JSON.stringify(terminal.state, undefined, 4));
            })
        );
    }

}