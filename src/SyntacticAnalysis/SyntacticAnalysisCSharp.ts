export class SyntacticAnalysisCSharp {
  /*-------------------------------------------------------------------------
   * Field
   *-----------------------------------------------------------------------*/
  private static RESERVED_WORDS: RegExp = /(void|event|delegate|internal|public|protected|private|static|const|new|sealed|abstract|virtual|override|extern|unsafe|readonly|volatile|implicit|explicit|operator)/;

  /*-------------------------------------------------------------------------
   * Public Method: Comment Type
   *-----------------------------------------------------------------------*/
  public static IsEnterKey(activeChar: string, text: string): boolean {
    const startsWith = text.startsWith('\n') || text.startsWith('\r\n');
    const result: boolean = activeChar === '' && startsWith;
    return result;
  }

  public static IsSlashKey(activeChar: string): boolean {
    return activeChar === '/';
  }

  public static IsSlashStarKey(activeChar: string): boolean {
    return activeChar === '*' || activeChar === '/';
  }

  public static IsDocCommentStrict(activeLine: string): boolean {
    // Check for exactly three slashes followed by optional whitespace at the end
    // or three slashes at start not followed by fourth slash
    const trimmed = activeLine.trim();
    return trimmed.match(/^\/\/\/(?!\/)(\s*)$/) !== null;
  }

  public static IsCppCommentStrict(activeLine: string): boolean {
    // Check for /** at the end with optional whitespace
    return activeLine.trim().match(/\/\*\*\s*$/) !== null;
  }

  public static IsDocComment(activeLine: string): boolean {
    // Check for three slashes followed by optional whitespace at the end
    return activeLine.trim().match(/^\/\/\/\s*$/) !== null;
  }

  public static IsDoubleDocComment(activeLine: string): boolean {
    // Check for exactly '/// ' (three slashes followed by a space at the end)
    return activeLine.trim().match(/^\/\/\/\s$/) !== null;
  }

  public static IsSharpCommentPart(activeLine: string): boolean {
    // Check if line starts with three slashes (C# comment part)
    return activeLine.trim().startsWith('///');
  }
  public static IsCppCommentPart(activeLine: string): boolean {
    // Check if line is part of C-style comment (* or */)
    const trimmed = activeLine.trim();
    return trimmed.startsWith('* ') || trimmed.startsWith('*/');
  }

  /*-------------------------------------------------------------------------
   * Public Method: Code
   *-----------------------------------------------------------------------*/
  public static IsAttribute(code: string): boolean {
    if (code === null) return false;
    return code.match(/^\[.+\]$/) !== null;
  }

  /*-------------------------------------------------------------------------
   * Public Method: Code Type
   *-----------------------------------------------------------------------*/
  public static IsNamespace(code: string): boolean {
    if (code === null) return false;
    return code.match(/\bnamespace\b/) !== null;
  }

  public static IsGenericClass(code: string): boolean {
    if (code === null) return false;
    // Check for class with generic type parameters: class Name<T>
    return code.match(/\bclass\b\s+\w+\s*<[^>]+>/) !== null;
  }

  public static IsClass(code: string): boolean {
    if (code === null) return false;
    return code.match(/\bclass\b/) !== null;
  }

  public static IsInterface(code: string): boolean {
    if (code === null) return false;
    return code.match(/\binterface\b/) !== null;
  }

  public static IsStruct(code: string): boolean {
    if (code === null) return false;
    return code.match(/\bstruct\b/) !== null;
  }

  public static IsEnum(code: string): boolean {
    if (code === null) return false;
    return code.match(/\benum\b/) !== null;
  }

  public static IsDelegate(code: string): boolean {
    if (code === null) return false;
    return code.match(/\bdelegate\b/) !== null;
  }

  public static IsEvent(code: string): boolean {
    if (code === null) return false;
    return code.match(/\bevent\b/) !== null;
  }

  public static IsProperty(code: string): boolean {
    if (code === null) return false;
    return code.match(/[\w\S]+[^)]?\b\s*{/) !== null;
  }

  public static IsField(code: string): boolean {
    if (code === null) return false;
    return code.match(/[^()]+;[ \t]*$/) !== null;
  }

  public static IsLazyField(code: string): boolean {
    if (code === null) return false;
    return code.match(/[^()]+(;|=|{|({.}))[ \t]*$/) !== null;
  }

  public static IsMethod(code: string): boolean {
    if (code === null) return false;
    return code.match(/[\w\S]\s+[\w\S]+\s*\(.*\)/) !== null;
  }

  public static IsEmptyMethod(code: string): boolean {
    if (code === null) return false;
    return code.match(/[\w\S]+\(.*\)/) !== null;
  }

  public static IsComment(code: string): boolean {
    if (code === null) return false;
    if (code === '') return true;
    return code.match(/[ \t]+/) !== null;
  }

  public static GetGenericParamNameList(
    code: string,
    isDefault: boolean
  ): Array<string> | null {
    if (!code) return null;
    
    // Remove attributes
    const removedAttrCode: string = code.replace(/^\s*\[.+?\]/g, '');

    // Match generic parameters between < and >
    const params: RegExpMatchArray = removedAttrCode.match(/<([^>]+)>/);
    if (!params || params.length < 2) return null;

    // Split by comma and extract parameter names
    const splittedParams: string[] = params[1]
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    if (splittedParams.length === 0) return null;

    const paramNames: string[] = [];
    for (const param of splittedParams) {
      // Extract parameter name (handle constraints like "T where T : class")
      const match = param.match(/^(\w+)/);
      if (match) {
        paramNames.push(match[1]);
      }
    }

    return paramNames.length > 0 ? paramNames : null;
  }

  public static GetMethodParamNameList(
    code: string,
    isDefault: boolean
  ): Array<string> | null {
    if (!code) return null;
    
    // Remove attributes
    const removedAttrCode: string = code.replace(/^\s*\[.+?\]/g, '');

    let params: RegExpMatchArray;

    if (isDefault) {
      // Constructor or method without return type: Name(...)
      params = removedAttrCode.match(/[\w\S]+\(([^)]*)\)/);
    } else {
      // Method with return type: Type Name(...)
      params = removedAttrCode.match(/[\w\S]\s+[\w\S]+\s*\(([^)]*)\)/);
    }

    if (!params || params.length !== 2 || !params[1].trim()) return null;

    const paramNames: string[] = [];
    const paramList = params[1].split(',');
    
    for (const param of paramList) {
      const trimmedParam = param.trim();
      if (!trimmedParam) continue;

      // Handle different parameter formats:
      // - Type name
      // - Type name = defaultValue
      // - ref/out/in Type name
      // - params Type[] name
      const match = trimmedParam.match(/(?:ref\s+|out\s+|in\s+|params\s+)?(?:[\w<>\[\]]+)\s+(\w+)(?:\s*=.*)?$/);
      
      if (match && match[1]) {
        paramNames.push(match[1]);
      }
    }

    return paramNames.length > 0 ? paramNames : null;
  }

  public static HasMethodReturn(code: string): boolean {
    if (code === null) return false;
    const returns: RegExpMatchArray = code.match(
      /([\w\S]+)\s+[\w\S]+\s*\(.*\)/
    );

    const isMatched = returns === null || returns.length !== 2;
    if (isMatched) return false;

    return returns[1].match(this.RESERVED_WORDS) === null ? true : false;
  }

  public static HasPropertyReturn(code: string): boolean {
    if (code === null) return false;
    const returns: RegExpMatchArray = code.match(/([\w\S]+)\s+[\w\S]+\s*\{/);

    const isMatched = returns === null || returns.length !== 2;
    if (isMatched) return false;

    return returns[1].match(this.RESERVED_WORDS) === null ? true : false;
  }
}
