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

const summernoteIntercept = (event: JQuery.TriggeredEvent) => {

    if (event.key !== '@') {
        return true;
    }

    const selection = window.getSelection();
    console.log({selection});
    if (!selection || selection.rangeCount === 0) { return true; }
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const modifiedText = document.createTextNode(`@${selectedText.replace(/ /g, '_',)}`);
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
    
    const editor = $(document.activeElement!);
    editor.summernote('insertText', modifiedText);


    // setTimeout(() => {
    //     const fakeevent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight', code: 'ArrowRight' });
    //     document.activeElement?.dispatchEvent(fakeevent);
    // }, 100);
    document.activeElement?.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, cancelable: true, data: '' }));
    document.activeElement?.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'ArrowRight', code: 'ArrowRight' }));
    
    return false;
};

const simpleIntercept = (editor: JQuery<HTMLElement>, event: JQuery.TriggeredEvent) => {
    const selection = window.getSelection();
    console.log({selection});

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
        const editor = $(form!).find('#entry.html-editor');

        if (editor.length > 0) {
            if (!!editor.summernote) {
                editor.on('summernote.keydown', function(we, event) {
                    console.log('Keydown event detected:', event);
                    simpleIntercept(editor, event);
                });

                console.log('Keydown handler attached.');
            } else {
                console.log('Editor not ready. Retrying...');
                setTimeout(addKeydownHandler, 500); // Retry after some time
            }
        } else {
            console.log('Editor not found. Retrying...');
            setTimeout(addKeydownHandler, 500); // Retry after some time
        }
    } catch (error) {
        console.log('Broke...', error);
        setTimeout(addKeydownHandler, 1000); // Retry after some time
    }
}

setTimeout(addKeydownHandler, 500); // Adjust the delay as needed
