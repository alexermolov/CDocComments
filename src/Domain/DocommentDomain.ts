import { TextDocumentContentChangeEvent, TextEditor } from 'vscode';
import { VSCodeApi } from '../Api/VSCodeApi';
import { Configuration } from '../Entity/Config/Contributes/Configuration';
import { StringUtil } from '../Utility/StringUtil';
import { CodeType, IDocommentDomain } from './IDocommentDomain';

export class DocommentDomain implements IDocommentDomain {
  /*-------------------------------------------------------------------------
   * Field
   *-----------------------------------------------------------------------*/

  /* @implements */
  public _event: TextDocumentContentChangeEvent;

  /* @implements */
  public _vsCodeApi: VSCodeApi;

  /* @implements */
  public _activeEditor: TextEditor;

  /* @implements */
  public _config: Configuration;

  /*-------------------------------------------------------------------------
   * Entry Method
   *-----------------------------------------------------------------------*/

  /* @implements */
  public Execute(
    activeEditor: TextEditor,
    event: TextDocumentContentChangeEvent,
    languageId: string,
    config: Configuration
  ) {
    this._event = event;
    this._activeEditor = activeEditor;
    this._vsCodeApi = new VSCodeApi(activeEditor);
    this._config = config;

    // Detect Language
    if (!this._vsCodeApi.IsLanguage(languageId)) return;

    const language = this._vsCodeApi.GetLanguage();

    if (this.IsTriggerNewCommentLine(language)) {
      const emptyCommentLine = this.GeneEmptyCommentLine(language);

      if (StringUtil.IsNullOrWhiteSpace(emptyCommentLine)) return;

      const currentCode: string = this.GetCode();
      this.WriteComment(currentCode, CodeType.Comment, emptyCommentLine);
      this.MoveCursorTo(currentCode, CodeType.Comment, emptyCommentLine);
      return;
    }

    // Can Fire Document Comment
    if (!this.IsTriggerDocomment(language)) return;

    // Get Code
    const code: string = this.GetCode();

    // Detect Code Type
    const codeType: CodeType = this.GetCodeType(code);
    if (codeType === null) return;

    // Gene Comment
    const docomment = this.GeneDocomment(code, codeType, language);
    if (StringUtil.IsNullOrWhiteSpace(docomment)) return;

    // Write Comment
    this.WriteComment(code, codeType, docomment);

    // Move Cursor to <Summary>
    this.MoveCursorTo(code, codeType, docomment);
  }

  /*-------------------------------------------------------------------------
   * Domain Method
   *-----------------------------------------------------------------------*/

  /* @implements */
  public IsTriggerDocomment(language: string): boolean {
    return false;
  }

  public IsTriggerNewCommentLine(language: string): boolean {
    return false;
  }

  /* @implements */
  public GetCode(): string {
    return null;
  }

  /* @implements */
  public GetCodeType(code: string): CodeType {
    return CodeType.None;
  }

  /* @implements */
  public GeneDocomment(
    code: string,
    codeType: CodeType,
    language: string
  ): string {
    return null;
  }

  public GeneEmptyCommentLine(language: string): string {
    return null;
  }

  /* @implements */
  public WriteComment(
    code: string,
    codeType: CodeType,
    docommnet: string
  ): void {
    // NOP
  }

  /* @implements */
  public MoveCursorTo(
    code: string,
    codeType: CodeType,
    docomment: string
  ): void {
    // NOP
  }

  /* @implements */
  public dispose() {
    // NOP
  }
}
