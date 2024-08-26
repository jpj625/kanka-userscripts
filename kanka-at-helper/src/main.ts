'use strict';

import Mousetrap from 'mousetrap';


declare global {
    type MousetrapCallback = (e: Mousetrap.ExtendedKeyboardEvent, combo: string) => void;

    type Maybe<T> = NonNullable<T> | undefined;
    type Dictionary<T> = Record<string, T>;
    interface Window {
        jQuery: JQueryStatic;
        ajaxTooltip: Function;
        showToast: (message: string, messageType: string) => void;
    }
    interface JQuery<TElement = HTMLElement> {
        blink: (times: number, duration: number) => JQuery<TElement>;
    }
}

$.prototype.blink ??= function (times: number, duration: number) {
    for (let i = 0; i < times; i++) {
        this.animate({ opacity: 0 }, duration)
            .animate({ opacity: 1 }, duration);
    }
    return this;
}

const mousetrapIntercept: MousetrapCallback = (event: Mousetrap.ExtendedKeyboardEvent, combo: string) => {
    return summernoteIntercept(event);
};

const summernoteIntercept = (event: KeyboardEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) { return false; }
  
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const modifiedText = document.createTextNode(`@${selectedText.replace(/ /g, '_',)}`);
    
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
    document.activeElement?.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, cancelable: true, data: '' }));
    // document.activeElement?.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'ArrowRight', code: 'ArrowRight' }));
    
    return false;
};

$('#entry').summernote({
    callbacks: {
        onKeydown(event) {
            return summernoteIntercept(event);
        },
    }
});

function mousetrapAttach(key: string, callback: MousetrapCallback) {
    const form = document.querySelector('form#entity-form');
    if (!form) { return; }

    const textarea = form.querySelector('[contenteditable]');
    if (!textarea) { return; }

    Mousetrap(textarea).bind('@', mousetrapIntercept, 'keydown');
}
