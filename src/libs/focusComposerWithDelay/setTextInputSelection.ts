import type {TextInput} from 'react-native';
import shouldSetSelectionRange from '@libs/shouldSetSelectionRange';
import CONST from '@src/CONST';
import type {InputType, Selection} from './types';

const setSelectionRange = shouldSetSelectionRange();

/** Resolve the live-markdown composer DOM node. On web it renders a contenteditable, so it exposes neither `setSelectionRange` nor RN's `setSelection`. */
function resolveComposerElement(textInput: InputType): HTMLElement | null {
    if (typeof HTMLElement !== 'undefined' && textInput instanceof HTMLElement) {
        return textInput;
    }

    const ownerDocument = globalThis.document;
    const focusedElement = ownerDocument?.activeElement;
    if (typeof HTMLElement !== 'undefined' && focusedElement instanceof HTMLElement && focusedElement.id === CONST.COMPOSER.NATIVE_ID) {
        return focusedElement;
    }

    return ownerDocument?.getElementById(CONST.COMPOSER.NATIVE_ID) ?? null;
}

/** Translate a plain-text caret offset into the (text node, offset) pair a DOM Range needs, walking the contenteditable in document order. */
function findCaretAnchor(root: HTMLElement, caretOffset: number): {node: Node; offset: number} {
    const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let scanned = 0;
    let textNode = walker.nextNode();
    let tailNode: Node | null = null;
    let tailLength = 0;

    while (textNode) {
        const length = textNode.textContent?.length ?? 0;
        if (caretOffset <= scanned + length) {
            return {node: textNode, offset: caretOffset - scanned};
        }
        scanned += length;
        tailNode = textNode;
        tailLength = length;
        textNode = walker.nextNode();
    }

    // Offset is past the end (or the input has no text nodes) – clamp to the end of the last node we saw.
    return tailNode ? {node: tailNode, offset: tailLength} : {node: root, offset: 0};
}

const setTextInputSelection = (textInput: InputType, forcedSelectionRange: Selection) => {
    if (setSelectionRange && typeof (textInput as HTMLTextAreaElement).setSelectionRange === 'function') {
        (textInput as HTMLTextAreaElement).setSelectionRange(forcedSelectionRange.start, forcedSelectionRange.end);
        return;
    }

    if (typeof (textInput as TextInput).setSelection === 'function') {
        (textInput as TextInput).setSelection(forcedSelectionRange.start, forcedSelectionRange.end);
        return;
    }

    // Web contenteditable composer: neither API above is available, so position the caret with a DOM Range.
    const element = resolveComposerElement(textInput);
    const view = element?.ownerDocument.defaultView;
    const domSelection = view?.getSelection();
    if (!element || !domSelection) {
        return;
    }

    const textLength = element.textContent?.length ?? 0;
    const anchor = findCaretAnchor(element, Math.min(forcedSelectionRange.start, textLength));
    const focusPoint = findCaretAnchor(element, Math.min(forcedSelectionRange.end, textLength));

    const range = element.ownerDocument.createRange();
    range.setStart(anchor.node, anchor.offset);
    range.setEnd(focusPoint.node, focusPoint.offset);
    domSelection.removeAllRanges();
    domSelection.addRange(range);
};

export default setTextInputSelection;
