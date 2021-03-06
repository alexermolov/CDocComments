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
    switch (language) {
      case 'csharp':
        return this.IsTriggerDocommentCssharp();

      case 'cpp':
      case 'c':
        return this.IsTriggerDocommentCpp();

      default:
        return this.IsTriggerDocommentCssharp();
    }
  }

  public IsTriggerNewCommentLine(language: string): boolean {
    switch (language) {
      case 'csharp':
        return this.IsTriggerEmptyCommentLine('sharp');

      case 'cpp':
      case 'c':
        return this.IsTriggerEmptyCommentLine('cpp');

      default:
        return this.IsTriggerEmptyCommentLine('sharp');
    }
  }

  /* @override */
  public GetCode(): string {
    const code: string = this._vsCodeApi.ReadNextCodeFromCurrent(
      this._config.eol
    );
    const removedAttr: string = code
      .split(this._config.eol)
      .filter((line) => !SyntacticAnalysisCSharp.IsAttribute(line.trim()))
      .join('');
    return removedAttr;
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
    switch (language) {
      case 'csharp':
        return '/// ';

      case 'cpp':
      case 'c':
        return '* ';
    }
  }

  /* @override */
  public GeneDocomment(
    code: string,
    codeType: CodeType,
    language: string
  ): string {
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
        return '/// ';
      case CodeType.None:
        return '';
      default:
        return '';
    }

    switch (language) {
      case 'csharp':
        return this.GeneSummary(
          code,
          paramNameList,
          hasReturn,
          genericNameList
        );

      case 'cpp':
      case 'c':
        return this.GeneSummaryCpp(code, paramNameList, hasReturn);

      default:
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
    const position: Position = this._vsCodeApi.GetActivePosition();

    if (codeType === CodeType.Comment) {
      const indentBaseLine: string = this._vsCodeApi.ReadPreviousLineFromCurrent();
      const indent: string = StringUtil.GetIndent(
        code,
        indentBaseLine,
        this._config.insertSpaces,
        this._config.detectIdentation
      );
      const indentLen: number = StringUtil.GetIndentLen(
        indent,
        this._config.insertSpaces,
        this._config.detectIdentation
      );
      const insertPosition: Position = this._vsCodeApi.GetPosition(
        position.line + 1,
        indentLen - 1
      );
      this._vsCodeApi.InsertText(insertPosition, docomment);
    } else {
      const active: Position = this._vsCodeApi.GetActivePosition();
      const anchor: Position = this._vsCodeApi.GetPosition(active.line, 0);
      const start: Position = this._vsCodeApi.GetPosition(active.line, 0);
      let replaceSelection: Selection;

      if (this._isEnterKey) {
        const end: Position = this._vsCodeApi.GetPosition(
          active.line + 1,
          active.character
        );
        replaceSelection = this._vsCodeApi.GetSelectionByPosition(anchor, end);
      } else {
        const end: Position = this._vsCodeApi.GetPosition(
          active.line,
          active.character + 1
        );
        replaceSelection = this._vsCodeApi.GetSelectionByPosition(start, end);
      }

      this._vsCodeApi.ReplaceText(replaceSelection, docomment);
    }
  }

  /* @implements */
  public MoveCursorTo(
    code: string,
    codeType: CodeType,
    docomment: string
  ): void {
    const curPosition = this._vsCodeApi.GetActivePosition();
    const indentBaseLine: string = this._vsCodeApi.ReadLineAtCurrent();
    const indent: string = StringUtil.GetIndent(
      code,
      indentBaseLine,
      this._config.insertSpaces,
      this._config.detectIdentation
    );
    const indentLen: number = StringUtil.GetIndentLen(
      indent,
      this._config.insertSpaces,
      this._config.detectIdentation
    );
    this._vsCodeApi.MoveSelection(
      curPosition.line + 1,
      indentLen - 1 + docomment.length
    );
  }

  /*-------------------------------------------------------------------------
   * Private Method
   *-----------------------------------------------------------------------*/

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
    }
    if (isEnterKey) {
      // NG: '////'
      if (!SyntacticAnalysisCSharp.IsCppCommentStrict(activeLine)) {
        return false;
      }
    } else {
      return false;
    }

    // OK
    return true;
  }

  private GeneSummary(
    code: string,
    paramNameList: Array<string>,
    hasReturn: boolean,
    genericParams: Array<string>
  ): string {
    let docommentList: Array<string> = new Array<string>();

    /* <summary> */
    docommentList.push('<summary>');
    docommentList.push('');
    docommentList.push('</summary>');

    /* <param> */
    if (paramNameList !== null) {
      paramNameList.forEach((name) => {
        docommentList.push('<param name="' + name + '"></param>');
      });
    }

    /* generic <typeparam> */
    if (genericParams) {
      genericParams.forEach((name) => {
        docommentList.push('<typeparam name="' + name + '"></typeparam>');
      });
    }

    /* <returns> */
    if (hasReturn) {
      docommentList.push('<returns></returns>');
    }

    // Format
    let indentBaseLine: string = this._vsCodeApi.ReadLineAtCurrent();

    const indent: string = StringUtil.GetIndent(
      code,
      indentBaseLine,
      this._config.insertSpaces,
      this._config.detectIdentation
    );
    let docomment = indent + '///' + ' ' + docommentList[0] + '\n';
    for (let i = 1; i < docommentList.length; i++) {
      docomment += indent + '/// ' + docommentList[i];
      if (i !== docommentList.length - 1) {
        docomment += '\n';
      }
    }

    return docomment;
  }

  private GeneSummaryCpp(
    code: string,
    paramNameList: Array<string>,
    hasReturn: boolean
  ): string {
    let docommentList: Array<string> = new Array<string>();

    /* <summary> */
    docommentList.push('\n');
    docommentList.push(' * @brief  ');
    docommentList.push(' * @note   ');

    /* <param> */
    if (paramNameList !== null) {
      paramNameList.forEach((name) => {
        docommentList.push(' * @param  ' + name + ': ');
      });
    }

    /* <returns> */
    if (hasReturn) {
      docommentList.push(' * @retval ');
    } else {
      docommentList.push(' * @retval None');
    }

    docommentList.push(' */');

    // Format
    const indentBaseLine: string = this._vsCodeApi.ReadLineAtCurrent();
    if (code.charAt(0) === '*') {
      code = code.substr(1);
    }

    const indent: string = StringUtil.GetIndent(
      code.substr(1),
      indentBaseLine,
      this._config.insertSpaces,
      this._config.detectIdentation
    );
    let docomment = indent + '/**' + docommentList[0];
    for (let i = 1; i < docommentList.length; i++) {
      docomment += indent + docommentList[i];
      if (i !== docommentList.length - 1) {
        docomment += '\n';
      }
    }

    return docomment;
  }
}
