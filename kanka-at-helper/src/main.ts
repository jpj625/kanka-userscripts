'use strict';


const simpleIntercept = (editor: JQuery<HTMLElement>, event: KeyboardEvent) => {
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
        if (!$) { setTimeout(addKeydownHandler, 100); return; }
        const form = document.querySelector('form.entity-form');
        const editor = $(form!).find('#entry.html-editor');

        if (editor.length > 0) {
            if (!!editor.summernote) {
                editor.on('summernote.keydown', function (jqueryEvent, event: KeyboardEvent) {
                    // console.log('Keydown event detected:', event);
                    simpleIntercept(editor, event);
                });

                console.log('Keydown handler attached.');
            } else {
                console.log('Editor not ready. Retrying...');
                setTimeout(addKeydownHandler, 200);
            }
        } else {
            console.log('Editor not found. Retrying...');
            setTimeout(addKeydownHandler, 200);
        }
    } catch (error) {
        console.log('@-Helper Broke...', error);
    }
}

setTimeout(addKeydownHandler, 100);
