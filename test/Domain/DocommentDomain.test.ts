import * as assert from 'assert';
import { TextDocumentContentChangeEvent, Range, Position } from 'vscode';
import { DocommentDomain } from '../../src/Domain/DocommentDomain';

suite('Domain.DocommentDomain Tests', () => {
    
    let domain: DocommentDomain;

    setup(() => {
        domain = new DocommentDomain();
    });

    suite('IsLineMoveOperation', () => {
        
        test('Should return false for simple Enter key press', () => {
            // Simulate Enter key: rangeLength 0, text is just newline
            const event: any = {
                text: '\n',
                rangeLength: 0,
                range: new Range(new Position(0, 0), new Position(0, 0))
            };
            
            const result = (domain as any).IsLineMoveOperation(event);
            assert.strictEqual(result, false, 'Simple Enter key should not be detected as line move');
        });

        test('Should return false for simple Enter key press with CRLF', () => {
            const event: any = {
                text: '\r\n',
                rangeLength: 0,
                range: new Range(new Position(0, 0), new Position(0, 0))
            };
            
            const result = (domain as any).IsLineMoveOperation(event);
            assert.strictEqual(result, false, 'Enter key with CRLF should not be detected as line move');
        });

        test('Should return true for line move operation (text replacement with content)', () => {
            // Simulate line move: replacing text with new text containing newlines and content
            const event: any = {
                text: ' * @param hterminal:\n',
                rangeLength: 20, // Replacing existing text
                range: new Range(new Position(5, 0), new Position(5, 20))
            };
            
            const result = (domain as any).IsLineMoveOperation(event);
            assert.strictEqual(result, true, 'Line move with text replacement should be detected');
        });

        test('Should return true for multi-line paste operation', () => {
            // Simulate paste of multiple lines
            const event: any = {
                text: 'line1\nline2\nline3',
                rangeLength: 0,
                range: new Range(new Position(0, 0), new Position(0, 0))
            };
            
            const result = (domain as any).IsLineMoveOperation(event);
            assert.strictEqual(result, true, 'Multi-line paste should be detected as line move');
        });

        test('Should return true for Alt+Arrow line move with content', () => {
            // Simulate Alt+Arrow move: replacing a line with itself at new position
            const event: any = {
                text: ' * @param *hterminal:\n * @RetVal None\n',
                rangeLength: 35,
                range: new Range(new Position(3, 0), new Position(4, 15))
            };
            
            const result = (domain as any).IsLineMoveOperation(event);
            assert.strictEqual(result, true, 'Alt+Arrow line move should be detected');
        });

        test('Should return false for single character insertion', () => {
            const event: any = {
                text: '/',
                rangeLength: 0,
                range: new Range(new Position(0, 0), new Position(0, 0))
            };
            
            const result = (domain as any).IsLineMoveOperation(event);
            assert.strictEqual(result, false, 'Single character insertion should not be line move');
        });

        test('Should return false for typing slash-slash-slash', () => {
            const event: any = {
                text: '/',
                rangeLength: 0,
                range: new Range(new Position(0, 2), new Position(0, 2))
            };
            
            const result = (domain as any).IsLineMoveOperation(event);
            assert.strictEqual(result, false, 'Typing /// should not be line move');
        });

        test('Should return false for null event', () => {
            const result = (domain as any).IsLineMoveOperation(null);
            assert.strictEqual(result, false, 'Null event should return false');
        });

        test('Should return false for empty text with no range', () => {
            const event: any = {
                text: '',
                rangeLength: 0,
                range: new Range(new Position(0, 0), new Position(0, 0))
            };
            
            const result = (domain as any).IsLineMoveOperation(event);
            assert.strictEqual(result, false, 'Empty text should return false');
        });
    });
});
