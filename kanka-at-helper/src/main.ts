'use strict';
type MousetrapCallback = (e: Mousetrap.ExtendedKeyboardEvent, combo: string) => void;

import Mousetrap from 'mousetrap';

const doThing: MousetrapCallback = (event: Mousetrap.ExtendedKeyboardEvent, combo: string) => {
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

$('#entry').on('summernote.init', function atHelperInit(event) {
    const form = document.querySelector('form#entity-form');
    if (!form) { return; }

    const textarea = form.querySelector('[contenteditable]');
    if (!textarea) { return; }

    Mousetrap(textarea).bind('@', doThing, 'keydown');
});
