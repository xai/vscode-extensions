import { assert } from 'console';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	new TestTerminalExtension(context);
}

export function deactivate() {
    // no-op
 }

export const OpenTerminalInEditor = { id: 'openTerminal.inEditor' };
export const OpenTerminalInPanel = { id: 'openTerminal.inPanel' };
export const OpenTerminalSplitLocation = { id: 'openTerminal.splitLocation' };
export const OpenTerminalEditorLocation = { id: 'openTerminal.editorLocation' };

export class TestTerminalExtension {

    constructor(readonly context: vscode.ExtensionContext) {
        this.registerCommands();
    }

    protected openTerminal(location: vscode.TerminalLocation|vscode.TerminalSplitLocationOptions|vscode.TerminalEditorLocationOptions): vscode.Terminal {
        const options: vscode.TerminalOptions = {
            'location': location
        };
        const terminal = vscode.window.createTerminal(options);
        terminal.show();
        return terminal;
    }

    protected getMostRecentTerminal(): vscode.Terminal | undefined {
        const terminals = vscode.window.terminals;
        if (terminals.length === 0) {
            return undefined;
        }
        return terminals[terminals.length - 1];
    }

    protected registerCommands(): void {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(OpenTerminalInEditor.id, () => {
                const terminal = this.openTerminal(vscode.TerminalLocation.Editor);
                assert(terminal);
            })
        );
        this.context.subscriptions.push(
            vscode.commands.registerCommand(OpenTerminalInPanel.id, () => {
                const terminal = this.openTerminal(vscode.TerminalLocation.Panel);
                assert(terminal);
            })
        );
        this.context.subscriptions.push(
            vscode.commands.registerCommand(OpenTerminalSplitLocation.id, () => {
                const lastTerminal = this.getMostRecentTerminal();
                if (!lastTerminal) {
                    console.log("No existing terminal found.");
                    return;
                }
                const splitLocation: vscode.TerminalSplitLocationOptions = {
                    'parentTerminal': lastTerminal
                }
                console.log('parentTerminal', JSON.stringify(lastTerminal));
                this.openTerminal(splitLocation)
            })
        );
        this.context.subscriptions.push(
            vscode.commands.registerCommand(OpenTerminalEditorLocation.id, async () => {

                const viewColumnOptions: vscode.QuickPickOptions = {
                    placeHolder: "Select view column to open terminal:"
                };
                const viewColumnPick  = await vscode.window.showQuickPick(Object.keys(vscode.ViewColumn).filter(v => isNaN(Number(v))), viewColumnOptions);

                if (!viewColumnPick) {
                    return;
                }

                const preserveFocusOptions: vscode.QuickPickOptions = {
                    placeHolder: "Preserve focus?"
                };
                const preserveFocus: boolean = await vscode.window.showQuickPick(['true', 'false'], preserveFocusOptions) === 'true';

                const editorLocation: vscode.TerminalEditorLocationOptions = {
                    preserveFocus: preserveFocus,
                    viewColumn: vscode.ViewColumn[viewColumnPick as keyof typeof vscode.ViewColumn]
                }

                this.openTerminal(editorLocation)
            })
        );
    }

}
