# ampersand-expanding-textarea-view

A view module for rendering a textarea that expands in height to fit the text within it. Works well with [ampersand-form-view](https://github.com/AmpersandJS/ampersand-form-view).

It does the following:

- Automatically shows/hides error messages based on tests
- Will not show error messages pre-submit or if it's never had a valid value. This lets people tab-through a form without triggering a bunch of error messages.
- Live-validates to always report if in valid state, but only shows messages when sane to do so.
- Only shows first failed message, then as user goes to correct, updates and validates against all tests, showing appripriate message until all tests pass.
- Expands the height of a textarea to fit the text inside it

It's built on [ampersand-view](https://github.com/AmpersandJS/ampersand-view) so it can be extended with `extend` as you might expect.


## install

```
npm install ampersand-expanding-textarea-view
```

## example

```javascript
var FormView = require('ampersand-form-view');
var ExpandingTextAreaView = require('ampersand-expanding-textarea-view');


module.exports = FormView.extend({
    fields: function () {
        return [
            new ExpandingTextAreaView({
                label: 'Address',
                name: 'address',
                value: this.model.address || '',
                required: false,
                placeholder: '2000 Avenue of the Stars, Los Angeles CA',
                parent: this
            })
        ];
    }
});

```

## API Reference

### extend `AmpersandInputView.extend({ })`

Since this view is based on [ampersand-state](http://ampersandjs.com/docs#ampersand-state) it can be extended in the same way.

To create an **InputView** class of your own, you extend **AmpersandInputView** and provide instance properties and options for your class. Typically here you will pass any properties (`props`, `session` and `derived`) of your state class, and any instance methods to be attached to instances of your class.

If you're wanting to add an **initialize** function for your subclass of InputView, note that you're actually overwriting `initialize` which means you'll want to call its parent class's `initialize` manually like so:


```javascript
var AmpersandInputView = require('ampersand-input-view');

var MyCustomInput = AmpersandInputView.extend({
    initialize: function () {
        // call its parent's initialize manually
        AmpersandInputView.prototype.initialize.call(apply, arguments);

        // do whatever else you need to do on init here
    }
});
```


### constructor/initialize `new AmpersandInputView([opts])`

When creating an instance of an input view, you can pass in the initial values of the **attributes** which will be [set](http://ampersandjs.com/docs#ampersand-state-set) on the state. Unless [extraProperties](#amperand-state-extra-properties) is set to `allow`, you will need to have defined these attributes in `props` or `session`.


#### opts

- name (required): name to use for input tag name and name used when reporting to parent form.
- value: initial value to set it to.
- template: a custom template to use (see 'template' section below for more).
- placeholder: optional value used as placeholder in input.
- el: optional element if you want to render it into a specific exisiting element pass it on initialization.
- required (default: `false`): whether this field is required or not.
- requiredMessage (default: `'This field is required'`): message to use if required and empty.
- tests (default: `[]`): test function to run on input (more below).
- validClass (defalt: `'input-valid'`): class to apply to input if valid.
- invalidClass (defalt: `'input-invalid'`): class to apply to input if invalid.
- parent: a view instance to use as the parent for this input. If used in a form view, the form sets this for you.


### render `inputView.render()`

Renders the input view. This gets handled for you if used within a parent [ampersand-form-view](https://github.com/ampersandjs/ampersand-form-view).

### template `inputView.template`

This can either be customized by using `extend` or by passing in a `template` property as part of your constructor arguments.

It can be a function returning an HTML string or DOM or it can be just an HTML string.

But the resulting HTML should contain the following hooks:

- an element with a `data-hook="input-primary"` attribute (the textarea visible to users)
- an element with a `data-hook-"input-mirror"` attribute (the textarea used to calculate the height)
- an element with a `data-hook="label"` attribute
- an element with a `data-hook="message-container"` attribute (this we'll show/hide)
- an elememt with a `data-hook="message-text"` attribute (where message text goes for error)

Creating a new class:

```javascript
// creating a custom input that has an alternate template
var CustomInput = AmpersandInput.extend({
    template: [
        '<label>',
            '<textarea data-hook="input-primary"></textarea>',
	    '<textarea data-hook="input-mirror"></textarea>',
            '<span data-hook="label"></span>',
            '<div data-hook="message-container" class="message message-below message-error">',
                '<p data-hook="message-text"></p>',
            '</div>',
        '</label>'
    ].join('');
});

// Then any instances of that would have it
var myCustomInput = new CustomInput();
```

Setting the template when instantiating it:

```
// Or you can also pass it in when creating the instance
var myInput = new AmpersandInput({
    template: myCustomTemplateStringOrFunction
});
```

### value `new AmpersandInput({ value: 'something' })`

If passed when creating the original input it will be set in the input element and also be tracked as `startingValue`.

This is also the value that will be reverted to if we call `.reset()` on the input.

```javascript
var myInput = new AmpersandInput({
    name: 'company name',
    value: '&yet'
});
myInput.render();
console.log(myInput.input.value); //=> '&yet'

myInput.setValue('something else');
console.log(myInput.input.value); //=> 'something else'
myInput.setValue('something else');
myInput.reset();
console.log(myInput.input.value); //=> '&yet'
```

#### Custom calculated output `value`

If you need to decouple what the user enters into the form from what the resulting value is that gets passed by the form you can do that by overwriting the `value` derived property.

Say you're making a validated address input. You may have a single text input for address that you do an API call to attempt to match to a real known address. So you have a single input, but you want the `value` of this input view to actually be an object of the resulting address fields from that API.

Do it by overwriting the `value` derived property as follows:

```javascript
var VerifiedAddressInput = AmpersandInput.extend({
    initialize: function () {
        // call parent constructor
        AmpersandExpandingTextareaView.prototype.initialize.call(apply, arguments);

        // listen for changes to input value
        this.on('change:inputValue', this.validateAddress, this);
    },
    props: {
        verifiedAddress: {
            type: 'object'
        }
    },
    derived: {
        value: {
            // in you want it re-calculated
            // when the user changes input
            // make it dependent on `inputValue`
            deps: ['verifiedAddress'],
            fn: function () {
                // calculate your value here
                return this.verifiedAddress;
            }
        },
        // you may also want to change what
        // deterines if this field should be
        // considerd valid. In this case, whether
        // it has a validated address
        valid: {
            deps: ['value'],
            fn: function () {
                if (this.verifiedAddress) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    },
    // run our address verification
    validateAddress: function () {
        // validate it against your API (up to you how)
        validateIt(this.inputValue, function (result) {
            this.verifiedAddress = result;
        });
    }
});
```

### tests `InputView.extend({ tests: [test functions] });` or `new InputView({ tests: [] })`

Tests can be extended onto a new constructor for the input or can be passed in on init.

This should be an array of test functions. The test functions you supply will be called with the context of the input view and with the input value as the argument.

The tests should return an error message if invalid and a falsy value otherwise (or just not return at all).

```javascript
var myInput = new ExpandingTextareaView({
    name: 'tweet',
    label: 'Your Tweet',
    tests: [
        function (value) {
            if (value.length > 140) {
                return "A tweet can be no more than 140 characters";
            }
        }
    ]
});
```

*note:* you can still do `required: true` and pass tests. If you do it will check if it's not empty first and show the `requiredMessage` error if empty. Note that the input will only show one error per field at a time. This is to minimize annoyance. We don't want to show "this field is required" and every other error if they just left it empty. We just show the first one that fails, then when they go to correct it, it will change as they type to the other error or the error will disappear once valid.


### setValue `expandingTextareaView.setValue([value], [skipValidation|bool])`

Setter for value that will fire all appropriate handlers/tests. Can also be done by user input or setting value of `input` manually.

Passing `true` as second argument will skip validation. This is mainly for internal use.


### reset `expandingTextareaView.reset()`

Set value to back original value. If you passed a `value` when creating the view it will reset to that, otherwise to `''`.


### clear `expandingTextareaView.clear()`

Sets value to `''` no matter what previous values were.


## changelog

- 0.2.1 - Pre-release. Fixes a bug where this.input was undefined.
- 0.2.0 - Pre-release. Works as intended, but tests are failing (haven't been written)
- 0.1.0 - Pre-release. Still some bugs, but mainly works.

## credits

Created by [@beardfury](http://twitter.com/beardfury).

## license

MIT
