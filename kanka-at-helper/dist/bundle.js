
// ==UserScript==
// @name         Kanka @ Helper (dev)
// @namespace    https://greasyfork.org/en/users/1029479-infinitegeek
// @version      0.3.2-9
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

const simpleIntercept = (editor, event) => {
    if (event.key !== '@') {
        return;
    }
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
        return;
    }
    event.preventDefault();
    const selectedText = selection.toString();
    const trimmedText = selectedText.trim();
    // handle prefix and suffix whitespace
    if (trimmedText.length !== selectedText.length) {
        const range = selection.getRangeAt(0);
        const startOffset = range.startOffset + (selectedText.length - selectedText.trimStart().length);
        const endOffset = range.endOffset - (selectedText.length - selectedText.trimEnd().length);
        range.setStart(range.startContainer, startOffset);
        range.setEnd(range.endContainer, endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    const modifiedText = '@' + trimmedText.replace(/ /g, '_');
    editor.summernote('insertText', modifiedText);
    // Simulate a right arrow key press to trigger the mentions dropdown
    editor[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39, which: 39, bubbles: true }));
};
function addKeydownHandler() {
    try {
        if (!$) {
            setTimeout(addKeydownHandler, 100);
            return;
        }
        const form = document.querySelector('form.entity-form');
        const editor = $(form).find('#entry.html-editor');
        if (editor.length > 0) {
            if (!!editor.summernote) {
                editor.on('summernote.keydown', function (jqueryEvent, event) {
                    // console.log('Keydown event detected:', event);
                    simpleIntercept(editor, event);
                });
                console.log('Keydown handler attached.');
            }
            else {
                console.log('Editor not ready. Retrying...');
                setTimeout(addKeydownHandler, 200);
            }
        }
        else {
            console.log('Editor not found. Retrying...');
            setTimeout(addKeydownHandler, 200);
        }
    }
    catch (error) {
        console.log('@-Helper Broke...', error);
    }
}
setTimeout(addKeydownHandler, 100);

/******/ })()
;