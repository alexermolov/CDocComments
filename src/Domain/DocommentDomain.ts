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
    // Validate inputs
    if (!activeEditor || !event || !languageId || !config) {
      return;
    }

    try {
      this._event = event;
      this._activeEditor = activeEditor;
      this._vsCodeApi = new VSCodeApi(activeEditor);
      this._config = config;

      // Skip processing if this is a line move operation
      if (this.IsLineMoveOperation(event)) {
        return;
      }

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
      if (!code) return;

      // Detect Code Type
      const codeType: CodeType = this.GetCodeType(code);
      if (codeType === null || codeType === CodeType.None) return;

      // Gene Comment
      const docomment = this.GeneDocomment(code, codeType, language);
      if (StringUtil.IsNullOrWhiteSpace(docomment)) return;

      // Write Comment
      this.WriteComment(code, codeType, docomment);

      // Move Cursor to <Summary>
      this.MoveCursorTo(code, codeType, docomment);
    } catch (error) {
      // Silently fail to avoid disrupting user experience
      console.error('Error in DocommentDomain.Execute:', error);
    }
  }

  /*-------------------------------------------------------------------------
   * Domain Method
   *-----------------------------------------------------------------------*/

  /**
   * Detects if the text change event is from a line move operation (Alt+Arrow)
   * or other bulk text operations that should not trigger comment generation.
   * 
   * Line moves have these characteristics:
   * - Replace a range of text (rangeLength > 0) with new text containing newlines
   * - The text being inserted is not just a newline (which would be Enter key)
   * - The text contains actual content beyond just whitespace and newlines
   */
  protected IsLineMoveOperation(event: TextDocumentContentChangeEvent): boolean {
    if (!event) return false;

    const text = event.text;
    const rangeLength = event.rangeLength;

    // Simple Enter key: rangeLength is 0 or 1, text is just newline(s)
    const isSimpleEnterKey = (rangeLength <= 1) && 
                             text && 
                             (text === '\n' || text === '\r\n' || text.match(/^[\r\n]+$/));

    if (isSimpleEnterKey) {
      return false;
    }

    // Line move operations typically:
    // 1. Replace a range of text (rangeLength > 0)
    // 2. Insert text with newlines and content
    // 3. The content is more than just whitespace
    if (rangeLength > 0 && text) {
      // Check if text has newlines and non-whitespace content
      const hasNewlines = text.includes('\n') || text.includes('\r\n');
      const hasContent = text.trim().length > 0;
      
      if (hasNewlines && hasContent) {
        return true;
      }
    }

    // Also detect multi-line paste or insertion operations
    // Text with multiple lines of content (not just single Enter press)
    if (text && rangeLength === 0) {
      const lines = text.split(/\r?\n/);
      // If inserting multiple lines with content, it's likely copy/paste or line move
      if (lines.length > 2) {
        return true;
      }
    }

    return false;
  }

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
