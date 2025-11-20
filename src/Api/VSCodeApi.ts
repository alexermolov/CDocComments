import { TextEditor, Position, Selection } from 'vscode';
import { StringUtil } from '../Utility/StringUtil';

export class VSCodeApi {

    /*-------------------------------------------------------------------------
     * Field
     *-----------------------------------------------------------------------*/
    private _activeEditor: TextEditor;


    /*-------------------------------------------------------------------------
     * Public Method
     *-----------------------------------------------------------------------*/
    constructor(activeEditor: TextEditor) {
        this._activeEditor = activeEditor;
    }


    /*-------------------------------------------------------------------------
     * VS Code API
     *-----------------------------------------------------------------------*/
    public IsLanguage(languageId: string): boolean {
        const splitted = languageId.split('&');
        const currentLanguage = this._activeEditor.document.languageId;
        return splitted.includes(currentLanguage);
    }

    public GetLanguage(): string {
        return this._activeEditor.document.languageId;
    }

    public GetActivePosition(): Position {
        return this._activeEditor.selection.active;
    }

    public GetActiveLine(): number {
        return this.GetActivePosition().line;
    }

    public GetLineCount(): number {
        return this._activeEditor.document.lineCount;
    }

    public GetActiveCharPosition(): number {
        return this._activeEditor.selection.active.character;
    }

    public GetPosition(line: number, charcter: number): Position {
        return new Position(line, charcter);
    }

    public ShiftPositionLine(position: Position, offset: number): Position {
        return this.GetPosition(position.line + offset, position.character);
    }

    public ShiftPositionChar(position: Position, offset: number): Position {
        return this.GetPosition(position.line, position.character + offset);
    }

    public GetSelection(line: number, charcter: number): Selection {
        return new Selection(line, charcter, line, charcter);
    }

    public GetSelectionByPosition(anchor: Position, active: Position): Selection {
        return new Selection(anchor, active);
    }

    public MoveSelection(line: number, charcter: number): void {
        const move: Selection = this.GetSelection(line, charcter);
        this._activeEditor.selection = move;
    }

    public InsertText(position: Position, text: string) {
        this._activeEditor.edit((editBuilder) => {
            editBuilder.insert(position, text);
        });
    }

    public DeleteText(anchor: Position, position: Position) {
        this._activeEditor.edit((editBuilder) => {
            editBuilder.delete(new Selection(anchor, position));
        });
    }

    public ReplaceText(selection: Selection, text: string) {
        this._activeEditor.edit((editBuilder) => {
            editBuilder.replace(selection, text);
        });
    }

    public ReadLine(line: number): string {
        if (line < 0 || line >= this._activeEditor.document.lineCount) {
            return '';
        }
        return this._activeEditor.document.lineAt(line).text;
    }

    public ReadLineAtCurrent(): string {
        return this.ReadLine(this.GetActiveLine());
    }

    public ReadCharAtCurrent(): string {
        const line = this.ReadLineAtCurrent();
        const charPos = this.GetActiveCharPosition();
        if (charPos < 0 || charPos >= line.length) {
            return '';
        }
        return line.charAt(charPos);
    }

    public ReadNextCodeFromCurrent(eol: string = '\n'): string {
        const lineCount: number = this.GetLineCount();
        const curLine: number = this.GetActiveLine();

        const codeLines: string[] = [];
        
        // Read up to 20 lines or until code block start is found
        for (let i: number = curLine + 1; i < lineCount && i < curLine + 21; i++) {
            const line: string = this.ReadLine(i);

            // Skip empty lines
            if (StringUtil.IsNullOrWhiteSpace(line)) continue;

            codeLines.push(line);

            // Detect end of code signature
            if (StringUtil.IsCodeBlockStart(line)) {
                const code = codeLines.join(eol);
                return StringUtil.RemoveComment(code);
            }
        }

        // Return what we have if no code block start found
        return codeLines.length > 0 ? StringUtil.RemoveComment(codeLines.join(eol)) : null;
    }

    public ReadPreviousCodeFromCurrent(): string {
        const curLine: number = this.GetActiveLine();

        let code = '';
        for (let i: number = curLine; 0 < i; i--) {

            const line: string = this.ReadLine(i - 1);

            // Skip empty line
            if (StringUtil.IsNullOrWhiteSpace(line)) continue;

            code += line;

            // Detect start of code
            if (!StringUtil.IsCodeBlockStart(line)) {
                continue;
            }

            return code;
        }

        return null;
    }

    public ReadPreviousLineFromCurrent(): string {
        const curLine: number = this.GetActiveLine();

        for (let i: number = curLine - 1; i >= 0; i--) {
            const line: string = this.ReadLine(i);
            if (!StringUtil.IsNullOrWhiteSpace(line)) {
                return line;
            }
        }

        return null;
    }

    public ReadNextLineFromCurrent(): string {
        const lineCount: number = this.GetLineCount();
        const curLine: number = this.GetActiveLine();

        for (let i: number = curLine + 1; i < lineCount; i++) {
            const line: string = this.ReadLine(i);
            if (!StringUtil.IsNullOrWhiteSpace(line)) {
                return line;
            }
        }

        return null;
    }

}
