export class StringUtil {

    /*-------------------------------------------------------------------------
     * Public Method
     *-----------------------------------------------------------------------*/
    public static IsNullOrWhiteSpace(line: string): boolean {
        return (line === null || line.trim() === '');
    }

    public static IsCodeBlockStart(line: string): boolean {
        if (line === null) return false;

        const isAttribute: boolean = line.trim().startsWith('['); // SKIP Attribute: [foo="bar"]
        if (isAttribute) return false;

        const isCodeBlockStart: boolean = (line.indexOf('{') !== -1);
        if (isCodeBlockStart) return true;

        const isInterface: boolean = (line.indexOf(';') !== -1);
        if (isInterface) return true;

        const isEndMethod: boolean = (line.trim().endsWith(')'));
        if (isEndMethod) return true;

        const isXml: boolean = (line.indexOf('</') !== -1);
        if (isXml) return true;

        return isCodeBlockStart;
    }

    public static RemoveComment(line: string): string {
        if (!line) return '';
        // Remove single-line comments (// ...)
        // Remove multi-line comments (/* ... */)
        return line
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .trim();
    }

    public static GetIndent(line: string, indentBaseLine: string, insertSpaces: boolean, detectIdentation: boolean): string {
        if (!line && !indentBaseLine) return '';
        
        // Use indentBaseLine if line is not provided or is empty
        const sourceString = line || indentBaseLine;
        const match = sourceString.match(/^([ \t]*)/);
        const indent: string = match ? match[1] : '';
        
        if (!indent) return '';

        if (detectIdentation) {
            // Detect if indentation uses spaces or tabs
            const isSpaceIdentation: boolean = indent.includes(' ');
            insertSpaces = isSpaceIdentation;
        }

        if (insertSpaces) {
            // Convert tabs to spaces (assuming tab = 4 spaces)
            return indent.replace(/\t/g, '    ');
        } else {
            // Convert spaces to tabs (4 spaces = 1 tab)
            return indent.replace(/    /g, '\t');
        }
    }

    public static GetIndentLen(indent: string, insertSpaces: boolean, detectIdentation: boolean): number {
        if (!indent) return 0;

        if (detectIdentation) {
            const isSpaceIdentation: boolean = indent.includes(' ');
            insertSpaces = isSpaceIdentation;
        }

        if (insertSpaces) {
            // Count spaces (tabs count as 4 spaces)
            return indent.replace(/\t/g, '    ').length;
        } else {
            // Count tabs (4 spaces = 1 tab)
            return indent.replace(/    /g, '\t').length;
        }
    }

}
