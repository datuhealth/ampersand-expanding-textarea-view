var AmpersandInputView = require( 'ampersand-input-view' );

module.exports = AmpersandInputView.extend({
    template: [
        '<label>',
            '<span data-hook="label"></span>',
            '<textarea class="form-input" data-hook="input-primary"></textarea>',
            '<textarea class="form-input" data-hook="input-mirror" tabindex="-1" style="position:absolute;top:-999px;left:0;right:auto;bottom:auto;border:0;word-wrap:break-word;height:0 !important;min-height:0 !important;overflow:hidden;transition:none;-webkit-transition:none;-moz-transition:none;"></textarea>',
            '<div data-hook="message-container" class="message message-below message-error">',
                '<p data-hook="message-text"></p>',
            '</div>',
        '</label>'
    ].join( '' ),
    render: function() {
        this.renderWithTemplate();
        this.input = this.queryByHook( 'input-primary' );
        this.inputMirror = this.queryByHook( 'input-mirror' );
        // switches out input for textarea if that's what we want
        this.handleTypeChange();
        this.initInputBindings();
        // Skip validation on initial setValue
        // if the field is not required
        this.setValue(this.inputValue, !this.required);
        // Set the initial height of the textarea
        // This needs to run after the view has been rendered to the DOM
        // to get the propert scrollHeight
        this.parent.el.addEventListener( 'DOMNodeInserted', function() {
            // Setup the textarea mirror
            this.initTextareaMirror();
            this.resizeTextarea();
        }.bind( this ));
    },
    events: {
        'keyup [data-hook="input-primary"]': 'resizeTextarea',
        'input [data-hook="input-primary"]': 'resizeTextarea'
    },
    initTextareaMirror: function() {
        var typographyStyles = [
                'fontFamily',
                'fontSize',
                'fontWeight',
                'fontStyle',
                'letterSpacing',
                'textTransform',
                'wordSpacing',
                'textIndent',
                'whiteSpace',
                'padding'
            ];

        // test that line-height can be accurately copied.
        this.inputMirror.style.lineHeight = '99px';
        if ( window.getComputedStyle( this.inputMirror ).lineHeight === '99px') {
            typographyStyles.push('lineHeight');
        }
        this.inputMirror.style.lineHeight = '';

        for ( var i = 0; i < typographyStyles.length; i++ ) {
            this.inputMirror.style[ typographyStyles[ i ]] = window.getComputedStyle( this.input )[ typographyStyles[ i ]];
        }
    },
    resizeTextarea: function() {
        var elScrollHeight,
            elComputedStyle = window.getComputedStyle( this.input );

        // Exit early if there's no text
        // This may be an issue if a user does a select-all and delete
        if ( !this.inputValue.length ) {
            return;
        }

        this.inputMirror.value = this.input.value;

        // Scroll top the top for IE8 and lower
        this.inputMirror.scrollTop = 0;
        this.inputMirror.scrollTop = 9e4;

        elScrollHeight = this.inputMirror.scrollTop;

        if ( elComputedStyle.boxSizing === 'border-box' ) {
            elScrollHeight += ( parseInt( elComputedStyle.paddingTop ) + parseInt( elComputedStyle.paddingBottom ));
        }

        this.input.style.height = ( elScrollHeight + 1 ) + 'px';
    }
});
