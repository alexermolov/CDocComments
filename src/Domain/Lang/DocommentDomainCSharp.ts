import { Position, Selection } from 'vscode';
import { SyntacticAnalysisCSharp } from '../../SyntacticAnalysis/SyntacticAnalysisCSharp';
import { StringUtil } from '../../Utility/StringUtil';
import { DocommentDomain } from '../DocommentDomain';
import { CodeType } from '../IDocommentDomain';

export class DocommentDomainCSharp extends DocommentDomain {
  /*-------------------------------------------------------------------------
   * Field
   *-----------------------------------------------------------------------*/
  private _isEnterKey = false;

  /*-------------------------------------------------------------------------
   * Domain Method
   *-----------------------------------------------------------------------*/

  /* @override */
  public IsTriggerDocomment(language: string): boolean {
    // Check both comment styles regardless of language
    return this.IsTriggerDocommentCssharp() || this.IsTriggerDocommentCpp();
  }

  public IsTriggerNewCommentLine(language: string): boolean {
    // Check both comment styles regardless of language
    return this.IsTriggerEmptyCommentLine('sharp') || this.IsTriggerEmptyCommentLine('cpp');
  }

  /* @override */
  public GetCode(): string {
    const code: string = this._vsCodeApi.ReadNextCodeFromCurrent(
      this._config.eol
    );
    
    if (!code) return null;
    
    // Remove attributes from code
    const removedAttr: string = code
      .split(this._config.eol)
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed && !SyntacticAnalysisCSharp.IsAttribute(trimmed);
      })
      .join(' ');
    
    return removedAttr || null;
  }

  /* @override */
  public GetCodeType(code: string): CodeType {
    /* method */
    if (SyntacticAnalysisCSharp.IsMethod(code)) return CodeType.Method;

    /* empty method */
    if (SyntacticAnalysisCSharp.IsEmptyMethod(code))
      return CodeType.DefaultMethod;

    /* namespace */
    if (SyntacticAnalysisCSharp.IsNamespace(code)) return CodeType.Namespace;

    /* generic class */
    if (SyntacticAnalysisCSharp.IsGenericClass(code))
      return CodeType.GenericClass;

    /* class */
    if (SyntacticAnalysisCSharp.IsClass(code)) return CodeType.Class;

    /* interface */
    if (SyntacticAnalysisCSharp.IsInterface(code)) return CodeType.Interface;

    /* struct */
    if (SyntacticAnalysisCSharp.IsStruct(code)) return CodeType.Struct;

    /* enum */
    if (SyntacticAnalysisCSharp.IsEnum(code)) return CodeType.Enum;

    /* delegate */
    if (SyntacticAnalysisCSharp.IsDelegate(code)) return CodeType.Delegate;

    /* event */
    if (SyntacticAnalysisCSharp.IsEvent(code)) return CodeType.Event;

    /* property */
    if (SyntacticAnalysisCSharp.IsProperty(code)) return CodeType.Property;

    /* field */
    if (SyntacticAnalysisCSharp.IsField(code)) return CodeType.Field;

    if (SyntacticAnalysisCSharp.IsLazyField(code)) return CodeType.Field;

    /* comment */
    if (SyntacticAnalysisCSharp.IsComment(code)) return CodeType.Comment;

    return CodeType.None;
  }

  public GeneEmptyCommentLine(language: string) {
    // Auto-detect comment style from current line
    const nexLine: string = this._vsCodeApi.ReadNextLineFromCurrent();
    
    if (SyntacticAnalysisCSharp.IsCppCommentPart(nexLine)) {
      return '* ';
    }
    
    if (SyntacticAnalysisCSharp.IsSharpCommentPart(nexLine)) {
      return '/// ';
    }
    
    // Default to C# style
    return '/// ';
  }

  /* @override */
  public GeneDocomment(
    code: string,
    codeType: CodeType,
    language: string
  ): string {
    // Auto-detect comment style from current line
    const activeLine: string = this._vsCodeApi.ReadLineAtCurrent();
    const isCppStyle = SyntacticAnalysisCSharp.IsCppCommentStrict(activeLine);
    
    let paramNameList: Array<string> = null;
    let genericNameList: Array<string> = null;
    let hasReturn = false;
    switch (codeType) {
      case CodeType.Namespace:
        break;
      case CodeType.Class:
        break;
      case CodeType.GenericClass:
        genericNameList = SyntacticAnalysisCSharp.GetGenericParamNameList(
          code,
          false
        );
        break;
      case CodeType.Interface:
        break;
      case CodeType.Struct:
        break;
      case CodeType.Enum:
        break;
      case CodeType.Delegate:
        paramNameList = SyntacticAnalysisCSharp.GetMethodParamNameList(
          code,
          false
        );
        hasReturn = SyntacticAnalysisCSharp.HasMethodReturn(code);
        break;
      case CodeType.Event:
        break;
      case CodeType.DefaultMethod:
        paramNameList = SyntacticAnalysisCSharp.GetMethodParamNameList(
          code,
          true
        );
        hasReturn = SyntacticAnalysisCSharp.HasMethodReturn(code);
        break;
      case CodeType.Method:
        paramNameList = SyntacticAnalysisCSharp.GetMethodParamNameList(
          code,
          false
        );
        hasReturn = SyntacticAnalysisCSharp.HasMethodReturn(code);
        break;
      case CodeType.Field:
        break;
      case CodeType.Property:
        hasReturn = SyntacticAnalysisCSharp.HasPropertyReturn(code);
        break;
      case CodeType.Comment:
        // Auto-detect comment style for new line in existing comment
        if (isCppStyle) {
          return '* ';
        }
        return '/// ';
      case CodeType.None:
        return '';
      default:
        return '';
    }

    // Use detected comment style instead of language
    if (isCppStyle) {
      return this.GeneSummaryCpp(code, codeType, paramNameList, hasReturn);
    } else {
      return this.GeneSummary(
        code,
        paramNameList,
        hasReturn,
        genericNameList
      );
    }
  }

  /* @implements */
  public WriteComment(
    code: string,
    codeType: CodeType,
    docomment: string
  ): void {
    if (!docomment) return;
    
    const position: Position = this._vsCodeApi.GetActivePosition();
    const consumeDanglingCloser: boolean = this.shouldConsumeDanglingCppCloser(docomment);

    if (codeType === CodeType.Comment) {
      const indent: string = this.getIndentFromPreviousLine();
      const indentLen: number = StringUtil.GetIndentLen(
        indent,
        this._config.insertSpaces,
        this._config.detectIdentation
      );
      const insertPosition: Position = this._vsCodeApi.GetPosition(
        position.line + 1,
        Math.max(0, indentLen)
      );
      this._vsCodeApi.InsertText(insertPosition, docomment);
    } else {
      const active: Position = this._vsCodeApi.GetActivePosition();
      const anchor: Position = this._vsCodeApi.GetPosition(active.line, 0);
      let end: Position;
      const anchorLineNumber: number = anchor.line; // first line of replacement region

      if (this._isEnterKey) {
        end = this._vsCodeApi.GetPosition(active.line + 1, 0);
      } else {
        end = this._vsCodeApi.GetPosition(active.line, active.character);
      }

      if (consumeDanglingCloser) {
        end = this.extendSelectionToConsumeDanglingCppCloser(end);
      }

      const replaceSelection: Selection = this._vsCodeApi.GetSelectionByPosition(anchor, end);
      this._vsCodeApi.ReplaceText(replaceSelection, docomment).then(() => {
        // After insertion completes, normalize any duplicated closing markers produced by other extensions
        const docLineCount = docomment.split('\n').length;
        // Delay slightly to allow other extensions to append artifacts, then clean both C++ and C# cases
        setTimeout(() => {
          if (consumeDanglingCloser) {
            this.removeDanglingCppCloserAfterInsertion(anchorLineNumber, docLineCount);
          }
          this.removeStraySlashInCSharpDoc(anchorLineNumber, docLineCount, docomment);
        }, 25);
      });
    }
  }

  /* @implements */
  public MoveCursorTo(
    code: string,
    codeType: CodeType,
    docomment: string
  ): void {
    if (!docomment) return;
    
    const curPosition = this._vsCodeApi.GetActivePosition();
    const indent: string = this.getIndentFromActiveLine();
    const indentLen: number = StringUtil.GetIndentLen(
      indent,
      this._config.insertSpaces,
      this._config.detectIdentation
    );
    
    // Move cursor to the summary section
    const targetLine = curPosition.line + 1;
    const targetChar = Math.max(0, indentLen + docomment.indexOf('summary>') + 8);
    
    this._vsCodeApi.MoveSelection(targetLine, targetChar);
  }

  /*-------------------------------------------------------------------------
   * Private Method
   *-----------------------------------------------------------------------*/

  private getIndentFromActiveLine(): string {
    const currentLine: string = this._vsCodeApi.ReadLineAtCurrent();
    const nextLine: string = this._vsCodeApi.ReadNextLineFromCurrent();
    return this.computeIndent(currentLine, nextLine);
  }

  private getIndentFromPreviousLine(): string {
    const previousLine: string = this._vsCodeApi.ReadPreviousLineFromCurrent();
    return this.computeIndent(previousLine, previousLine);
  }

  private computeIndent(preferredLine: string, fallbackLine: string): string {
    return (
      StringUtil.GetIndent(
        preferredLine,
        fallbackLine,
        this._config.insertSpaces,
        this._config.detectIdentation
      ) || ''
    );
  }

  private getEventText() {
    if (!this._event) {
      return null;
    }

    const eventText: string = this._event.text;
    if (eventText == null || eventText === '') {
      return null;
    }

    return eventText;
  }

  private shouldConsumeDanglingCppCloser(docomment: string): boolean {
    if (!docomment) {
      return false;
    }

    const trimmed = docomment.trimStart();
    return trimmed.startsWith('/**');
  }

  private extendSelectionToConsumeDanglingCppCloser(end: Position): Position {
    if (!end) {
      return end;
    }

    // Check the current line where /** was typed for any trailing */
    const currentLine = this._vsCodeApi.ReadLineAtCurrent();
    if (!currentLine) {
      return end;
    }

    // Look for */ anywhere on the current line after the initial /**
    const match = currentLine.match(/\/\*\*\s*(\*\/)/);
    if (!match) {
      return end;
    }

    // Find the position of */ on the line
    const closerIndex = currentLine.indexOf('*/', currentLine.indexOf('/**') + 3);
    if (closerIndex === -1) {
      return end;
    }

    // Extend to include the */ (and the character after it if it's whitespace)
    const newEnd = closerIndex + 2; // position after */
    return this._vsCodeApi.GetPosition(end.line, newEnd);
  }

  private removeDanglingCppCloserAfterInsertion(anchorLine: number, docLineCount: number): void {
    if (anchorLine == null || docLineCount == null) return;

    const lastInsertedLineNumber = anchorLine + docLineCount - 1;
    const lastLine = this._vsCodeApi.ReadLine(lastInsertedLineNumber);
    if (!lastLine) return;

    // We expect exactly one closing marker. If more than one appears consecutively, collapse to single.
    // Pattern examples to fix: ' */**/' ' */  */' ' */ */' (with indentation).
    const indentMatch = lastLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';

    // Extract all closing markers at end of line
    const closersMatch = lastLine.match(/(\*\/)+(\s*)$/);
    if (!closersMatch) return; // nothing to fix

    // If more than one closing marker present, replace tail with a single '*/'
    const closerCount = (lastLine.match(/\*\//g) || []).length;
    if (closerCount <= 1) return;

    // Keep everything before first closing marker
    const beforeFirstCloserIndex = lastLine.indexOf('*/');
    const keepPart = lastLine.substring(0, beforeFirstCloserIndex + 2); // include first */
    const cleaned = keepPart; // no trailing extra spaces; preserve original indent at start

    const lineStart = this._vsCodeApi.GetPosition(lastInsertedLineNumber, 0);
    const lineEnd = this._vsCodeApi.GetPosition(lastInsertedLineNumber, lastLine.length);
    const lineSelection = this._vsCodeApi.GetSelectionByPosition(lineStart, lineEnd);
    this._vsCodeApi.ReplaceText(lineSelection, cleaned);
  }

  private removeStraySlashInCSharpDoc(anchorLine: number, docLineCount: number, docomment: string): void {
    if (!docomment) return;
    // Only apply to C# style doc comments (start with '///')
    // Regex: leading space(s) then triple slash then optional spaces then '<'
    if (!/^\s*\/\/\/\s*</.test(docomment)) return;
    const lastInsertedLineNumber = anchorLine + docLineCount - 1;
    const lastLine = this._vsCodeApi.ReadLine(lastInsertedLineNumber);
    if (!lastLine) return;
    // Pattern: line ends with a single stray '/' not part of '///'
    // Example: '    /// <returns></returns>/'
    if (/\/\s*$/.test(lastLine)) {
      // Ensure it's not just another '///'
      if (!lastLine.trim().endsWith('///')) {
        const cleaned = lastLine.replace(/\/(\s*)$/, '$1');
        const lineStart = this._vsCodeApi.GetPosition(lastInsertedLineNumber, 0);
        const lineEnd = this._vsCodeApi.GetPosition(lastInsertedLineNumber, lastLine.length);
        const sel = this._vsCodeApi.GetSelectionByPosition(lineStart, lineEnd);
        this._vsCodeApi.ReplaceText(sel, cleaned);
      }
    }
  }

  private getActiveChar() {
    const activeChar: string = this._vsCodeApi.ReadCharAtCurrent();
    if (activeChar == null) {
      return null;
    }

    return activeChar;
  }

  private IsTriggerEmptyCommentLine(mode: 'cpp' | 'sharp') {
    const eventText = this.getEventText();
    if (!eventText) {
      return false;
    }

    const activeChar = this.getActiveChar();
    if (activeChar === null) {
      return false;
    }

    const isEnterKey: boolean = SyntacticAnalysisCSharp.IsEnterKey(
      activeChar,
      eventText
    );

    if (!isEnterKey) {
      return false;
    }

    const nexLine: string = this._vsCodeApi.ReadNextLineFromCurrent();
    switch (mode) {
      case 'cpp':
        return SyntacticAnalysisCSharp.IsCppCommentPart(nexLine);

      case 'sharp':
        return SyntacticAnalysisCSharp.IsSharpCommentPart(nexLine);
    }
  }

  private IsTriggerDocommentCssharp(): boolean {
    const eventText = this.getEventText();
    if (!eventText) {
      return false;
    }

    const activeChar = this.getActiveChar();
    if (!activeChar) {
      return false;
    }

    // NG: KeyCode is NOT '/' or Enter
    const isSlashKey: boolean = SyntacticAnalysisCSharp.IsSlashKey(activeChar);
    const isEnterKey: boolean = SyntacticAnalysisCSharp.IsEnterKey(
      activeChar,
      eventText
    );
    if (!isSlashKey && !isEnterKey) {
      return false;
    }
    this._isEnterKey = isEnterKey;

    // NG: Activate on Enter NOT '/'
    if (this._config.activateOnEnter) {
      if (isSlashKey) {
        return false;
      }
    }

    // NG: '////'
    const activeLine: string = this._vsCodeApi.ReadLineAtCurrent();

    if (isSlashKey) {
      // NG: '////'
      if (!SyntacticAnalysisCSharp.IsDocCommentStrict(activeLine)) {
        return false;
      }

      // NG: '/' => Insert => Event => ' /// '
      if (SyntacticAnalysisCSharp.IsDoubleDocComment(activeLine)) {
        return false;
      }
    }
    if (isEnterKey) {
      // NG: '////'
      if (!SyntacticAnalysisCSharp.IsDocComment(activeLine)) {
        return false;
      }
    }

    // OK
    return true;
  }

  private IsTriggerDocommentCpp(): boolean {
    // NG: KeyCode is EMPTY
    const eventText: string = this._event.text;
    if (eventText == null || eventText === '') {
      return false;
    }

    // NG: ActiveChar is NULL
    const activeChar: string = this._vsCodeApi.ReadCharAtCurrent();
    if (activeChar == null) {
      return false;
    }

    // NG: KeyCode is NOT '/' or Enter
    const isSlashStarKey: boolean = SyntacticAnalysisCSharp.IsSlashStarKey(
      activeChar
    );
    const isEnterKey: boolean = SyntacticAnalysisCSharp.IsEnterKey(
      activeChar,
      eventText
    );
    if (!isSlashStarKey && !isEnterKey) {
      return false;
    }
    this._isEnterKey = isEnterKey;

    // NG: Activate on Enter NOT '/ or *'
    if (this._config.activateOnEnter) {
      if (isSlashStarKey) {
        return false;
      }
    }

    // NG: '////'
    const activeLine: string = this._vsCodeApi.ReadLineAtCurrent();
    if (isSlashStarKey) {
      // NG: '////'
      if (!SyntacticAnalysisCSharp.IsCppCommentStrict(activeLine)) {
        return false;
      }
      // OK: /** detected after typing *
      return true;
    }
    if (isEnterKey) {
      // NG: '////'
      if (!SyntacticAnalysisCSharp.IsCppCommentStrict(activeLine)) {
        return false;
      }
      // OK: Enter pressed after /**
      return true;
    }

    // NG: Not slash/star key and not enter key
    return false;
  }

  private GeneSummary(
    code: string,
    paramNameList: Array<string> | null,
    hasReturn: boolean,
    genericParams: Array<string> | null
  ): string {
    const docommentList: string[] = [];

    /* <summary> */
    docommentList.push('<summary>');
    docommentList.push('');
    docommentList.push('</summary>');

    /* <param> */
    if (paramNameList && paramNameList.length > 0) {
      paramNameList.forEach((name) => {
        docommentList.push(`<param name="${name}"></param>`);
      });
    }

    /* generic <typeparam> */
    if (genericParams && genericParams.length > 0) {
      genericParams.forEach((name) => {
        docommentList.push(`<typeparam name="${name}"></typeparam>`);
      });
    }

    /* <returns> */
    if (hasReturn) {
      docommentList.push('<returns></returns>');
    }

    // Format with proper indentation
    const indent: string = this.getIndentFromActiveLine();
    const formattedLines = docommentList.map(line => `${indent}/// ${line}`);
    return formattedLines.join('\n');
  }

  private GeneSummaryCpp(
    code: string,
    codeType: CodeType,
    paramNameList: Array<string> | null,
    hasReturn: boolean
  ): string {
    const docommentList: string[] = [];

    /* C-style documentation comment */
    docommentList.push('/**');
    
    // Determine alignment based on config
    const alignTags = this._config.alignTags;
    const includeNote = this._config.includeNoteTag;
    
    // Add @brief with or without alignment
    if (alignTags) {
      docommentList.push(' * @brief  ');
    } else {
      docommentList.push(' * @brief ');
    }
    
    // Add @note if enabled
    if (includeNote) {
      if (alignTags) {
        docommentList.push(' * @note   ');
      } else {
        docommentList.push(' * @note ');
      }
    }

    /* <param> */
    if (paramNameList && paramNameList.length > 0) {
      paramNameList.forEach((name) => {
        if (alignTags) {
          docommentList.push(` * @param  ${name}: `);
        } else {
          docommentList.push(` * @param ${name}: `);
        }
      });
    }

    /* <returns> - only add for methods, delegates, and properties */
    const isFunction = codeType === CodeType.Method || 
                      codeType === CodeType.DefaultMethod || 
                      codeType === CodeType.Delegate || 
                      codeType === CodeType.Property;
    
    if (isFunction) {
      if (hasReturn) {
        if (alignTags) {
          docommentList.push(' * @retval ');
        } else {
          docommentList.push(' * @retval ');
        }
      } else {
        docommentList.push(' * @retval None');
      }
    }

    docommentList.push(' */');

    // Format with proper indentation
    const indent: string = this.getIndentFromActiveLine();
    const formattedLines = docommentList.map((line) => `${indent}${line}`);
    return formattedLines.join('\n');
  }
}
