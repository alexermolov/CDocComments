import * as assert from 'assert';
import {SyntacticAnalysisCSharp} from '../../src/SyntacticAnalysis/SyntacticAnalysisCSharp';

suite('SyntacticAnalysis.SyntacticAnalysisCSharp.IsNamespace Tests', () => {

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsNamespace
        STATE   : -
        IN      : null
        OUT     : false
    `, () => {
            // arrange
            const code: string = null;

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsNamespace(code);

            // assert
            assert.equal(actual, false);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsNamespace
        STATE   : -
        IN      : ''
        OUT     : false
    `, () => {
            // arrange
            const code = '';

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsNamespace(code);

            // assert
            assert.equal(actual, false);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsNamespace
        STATE   : -
        IN      : 'namespacefoo'
        OUT     : false
    `, () => {
            // arrange
            const code = 'namespacefoo';

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsNamespace(code);

            // assert
            assert.equal(actual, false);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsNamespace
        STATE   : -
        IN      : 'namespace'
        OUT     : true
    `, () => {
            // arrange
            const code = 'namespace';

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsNamespace(code);

            // assert
            assert.equal(actual, true);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsNamespace
        STATE   : -
        IN      : ' namespace '
        OUT     : true
    `, () => {
            // arrange
            const code = ' namespace ';

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsNamespace(code);

            // assert
            assert.equal(actual, true);
        });

});



suite('SyntacticAnalysis.SyntacticAnalysisCSharp.IsClass Tests', () => {

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsClass
        STATE   : -
        IN      : null
        OUT     : false
    `, () => {
            // arrange
            const code: string = null;

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsClass(code);

            // assert
            assert.equal(actual, false);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsClass
        STATE   : -
        IN      : ''
        OUT     : false
    `, () => {
            // arrange
            const code = '';

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsClass(code);

            // assert
            assert.equal(actual, false);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsClass
        STATE   : -
        IN      : 'namespacefoo'
        OUT     : false
    `, () => {
            // arrange
            const code = 'namespacefoo';

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsClass(code);

            // assert
            assert.equal(actual, false);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsClass
        STATE   : -
        IN      : 'class'
        OUT     : true
    `, () => {
            // arrange
            const code = 'class';

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsClass(code);

            // assert
            assert.equal(actual, true);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsNamespace
        STATE   : -
        IN      : ' class '
        OUT     : true
    `, () => {
            // arrange
            const code = ' class ';

            // act
            const actual: boolean = SyntacticAnalysisCSharp.IsClass(code);

            // assert
            assert.equal(actual, true);
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : GetMethodParamNameList
        STATE   : -
        IN      : ' public void Save(string data, Action<AchievementSavedResponse> onComplete = null) {'
        OUT     : [0]='data', [1]='onComplete'
    `, () => {
            // arrange
            const code = ' public void Save(string data, Action<AchievementSavedResponse> onComplete = null) {';

            // act
            const actual: Array<string> = SyntacticAnalysisCSharp.GetMethodParamNameList(code, false);

            // assert
            assert.equal(actual[0], 'data');
            assert.equal(actual[1], 'onComplete');
        });

    test(`
        Category: Black-box testing
        Class   : SyntacticAnalysis.SyntacticAnalysisCSharp
        Method  : IsDocComment
    `, () => {
            assert.equal(SyntacticAnalysisCSharp.IsDocComment('///'), true, '///');
            assert.equal(SyntacticAnalysisCSharp.IsDocComment(' ///'), true, ' ///');
            assert.equal(SyntacticAnalysisCSharp.IsDocComment(' /// '), true, ' /// ');
        });
});


suite('SyntacticAnalysis.SyntacticAnalysisCSharp.IsCppCommentStrict Tests', () => {

    test('Detects standard doc comment opener', () => {
        assert.equal(SyntacticAnalysisCSharp.IsCppCommentStrict('/**'), true);
    });

    test('Handles auto-inserted */ from editor helpers', () => {
        assert.equal(SyntacticAnalysisCSharp.IsCppCommentStrict('/**/'), true);
        assert.equal(SyntacticAnalysisCSharp.IsCppCommentStrict('/** */'), true);
        assert.equal(SyntacticAnalysisCSharp.IsCppCommentStrict('/**  */\t'), true);
    });

    test('Rejects comments that already contain content', () => {
        assert.equal(SyntacticAnalysisCSharp.IsCppCommentStrict('/** text */'), false);
        assert.equal(SyntacticAnalysisCSharp.IsCppCommentStrict('/* not a doc */'), false);
    });
});
