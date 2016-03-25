var test = require('tape'),
    suite = require('tape-suite'),
    ViewConventions = require( 'ampersand-view-conventions' ),
    InputView = require('../ampersand-expanding-textarea-view'),
    fieldOptions = {
        name: 'test',
        type: 'text',
        placeholder: 'Test',
        value: ''
    };

ViewConventions.view( suite.tape, InputView, fieldOptions );

if (!Function.prototype.bind) Function.prototype.bind = require('function-bind');

test('textarea grows in height as the text wraps', function (t) {
    var input = new InputView(),
        textarea,
        initialHeight,
        singleLineHeight;

    input.render();

    textarea = input.el.querySelector('textarea');

    initialHeight = textarea.style.height;
    input.setValue('Test');

    window.setTimeout(function () {
        singleLineHeight = textarea.style.height;

        t.equal(initialHeight, '', 'The initial height should not be set');
        t.notEqual(initialHeight, singleLineHeight, 'Input height changes when new text is entered');
        t.end();
    }, 900);
});
