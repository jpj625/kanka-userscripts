
// ==UserScript==
// @name         Kanka @ Helper (dev)
// @namespace    https://greasyfork.org/en/users/1029479-infinitegeek
// @version      0.3.2-7
// @description  Improve the experience of referencing entities.
// @author       InfiniteGeek
// @supportURL   Infinite @ https://discord.gg/rhsyZJ4
// @license      MIT
// @match        https://app.kanka.io/w/*/entities/*
// @icon         https://www.google.com/s2/favicons?domain=kanka.io
// @keywords     kanka,at,mention
// @run-at       document-idle
// @grant        none
// @require      https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

var _a;
var _b;
__webpack_unused_export__ = ({ value: true });
(_a = (_b = $.prototype).blink) !== null && _a !== void 0 ? _a : (_b.blink = function (times, duration) {
    for (let i = 0; i < times; i++) {
        this.animate({ opacity: 0 }, duration)
            .animate({ opacity: 1 }, duration);
    }
    return this;
});
const summernoteIntercept = (event) => {
    var _a, _b;
    if (event.key !== '@') {
        return true;
    }
    const selection = window.getSelection();
    console.log({ selection });
    if (!selection || selection.rangeCount === 0) {
        return true;
    }
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const modifiedText = document.createTextNode(`@${selectedText.replace(/ /g, '_')}`);
    event.preventDefault();
    // event.stopImmediatePropagation();
    // console.log({range, selectedText, modifiedText});
    range.deleteContents();
    range.insertNode(modifiedText);
    range.collapse(false);
    // range.setStartAfter(modifiedText);
    // range.setEndAfter(modifiedText);
    selection.removeAllRanges();
    selection.addRange(range);
    const editor = $(document.activeElement);
    editor.summernote('insertText', modifiedText);
    // setTimeout(() => {
    //     const fakeevent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight', code: 'ArrowRight' });
    //     document.activeElement?.dispatchEvent(fakeevent);
    // }, 100);
    (_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, cancelable: true, data: '' }));
    (_b = document.activeElement) === null || _b === void 0 ? void 0 : _b.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'ArrowRight', code: 'ArrowRight' }));
    return false;
};
const simpleIntercept = (editor, event) => {
    const selection = window.getSelection();
    console.log({ selection });
    if (selection && selection.rangeCount > 0) {
        const modifiedText = '@' + selection.toString().replace(/ /g, '_');
        editor.summernote('insertText', modifiedText);
        // Simulate the right arrow key press to trigger the mentions dropdown
        const e = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            keyCode: 39,
            which: 39,
            bubbles: true
        });
        editor[0].dispatchEvent(e);
    }
};
function addKeydownHandler() {
    try {
        const form = document.querySelector('form.entity-form');
        const editor = $(form).find('#entry.html-editor');
        if (editor.length > 0) {
            if (!!editor.summernote) {
                editor.on('summernote.keydown', function (we, event) {
                    console.log('Keydown event detected:', event);
                    simpleIntercept(editor, event);
                });
                console.log('Keydown handler attached.');
            }
            else {
                console.log('Editor not ready. Retrying...');
                setTimeout(addKeydownHandler, 500); // Retry after some time
            }
        }
        else {
            console.log('Editor not found. Retrying...');
            setTimeout(addKeydownHandler, 500); // Retry after some time
        }
    }
    catch (error) {
        console.log('Broke...', error);
        setTimeout(addKeydownHandler, 1000); // Retry after some time
    }
}
setTimeout(addKeydownHandler, 500); // Adjust the delay as needed

})();

/******/ })()
;