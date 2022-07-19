import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    const provider = new SimpleImportFoldingRangeProvider();
    const msg = 'onDidChangeFoldingRanges() fired - FoldingRanges have changed!';
    if (provider.onDidChangeFoldingRanges) {
        provider.onDidChangeFoldingRanges(() => {console.log(msg); vscode.window.showInformationMessage(msg)});
    }

    context.subscriptions.push(vscode.languages.registerFoldingRangeProvider( {language: "java", pattern: "**/*.java"}, provider));
}

export function deactivate() {
    // no-op
}

export class SimpleImportFoldingRangeProvider implements vscode.FoldingRangeProvider {
    constructor() {
        console.log("SimpleImportFoldingProvider loaded.");
    }

    private _onDidChangeFoldingRanges: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    private ranges: vscode.FoldingRange[] = [];

    onDidChangeFoldingRanges: vscode.Event<void> | undefined = this._onDidChangeFoldingRanges.event;

    provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
        const newRanges = [];
        let start = -1;
        let isImportChunk = false;
        let isChange = false;

        for (let i = 0; i < document.lineCount; i++) {
            if (document.lineAt(i).text.startsWith('import ')) {
                if (!isImportChunk) {
                    start = i;
                    isImportChunk = true;
                    isChange ||= (this.ranges.length <= newRanges.length);
                }
            } else {
                if (isImportChunk) {
                    newRanges.push(new vscode.FoldingRange(start, i - 1));
                    isImportChunk = false;
                    isChange ||= !(this.equalRanges(this.ranges[newRanges.length-1], newRanges[newRanges.length-1]));
                }
            }
        }

        if (isImportChunk) {
            newRanges.push(new vscode.FoldingRange(start, document.lineCount - 1));
            isChange ||= !(this.equalRanges(this.ranges[newRanges.length-1], newRanges[newRanges.length-1]));
        }
        isChange ||= this.ranges.length != newRanges.length;

        if (isChange) {
            this._onDidChangeFoldingRanges.fire();
            this.ranges = newRanges;
            for (const r of this.ranges) {
                console.log(`r.start = ${r.start} ; r.end = ${r.end}`);
            }
        }

        return this.ranges;
    }

    private equalRanges(a: vscode.FoldingRange, b: vscode.FoldingRange): boolean {
        return a.start === b.start && a.end === b.end;
    }
}