
// ==UserScript==
// @name         Kanka.io @ Helper
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Improve the experience of referencing entities.
// @author       Infinite
// @license      MIT
// @match        https://app.kanka.io/w/*/edit*
// @icon         https://www.google.com/s2/favicons?domain=kanka.io
// @run-at       document-idle
// @grant        none
// @require      https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 519:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const mousetrap_1 = __importDefault(__webpack_require__(802));
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


/***/ }),

/***/ 802:
/***/ ((module) => {

module.exports = Mousetrap;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(519);
/******/ 	
/******/ })()
;