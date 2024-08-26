'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mousetrap_1 = __importDefault(require("mousetrap"));
const doThing = (event, combo) => {
    var _a;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return false;
    }
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const modifiedText = document.createTextNode(`@${selectedText.replace(/ /g, '_')}`);
    range.deleteContents();
    range.insertNode(modifiedText);
    range.collapse();
    // range.setStartAfter(modifiedText);
    // range.setEndAfter(modifiedText);
    selection.removeAllRanges();
    selection.addRange(range);
    // setTimeout(() => {
    //     const fakeevent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight', code: 'ArrowRight' });
    //     document.activeElement?.dispatchEvent(fakeevent);
    // }, 100);
    (_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, cancelable: true, data: '' }));
    // document.activeElement?.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'ArrowRight', code: 'ArrowRight' }));
    return false;
};
$('#entry').on('summernote.init', function atHelperInit(event) {
    const form = document.querySelector('form#entity-form');
    if (!form) {
        return;
    }
    const textarea = form.querySelector('[contenteditable]');
    if (!textarea) {
        return;
    }
    (0, mousetrap_1.default)(textarea).bind('@', doThing, 'keydown');
});
