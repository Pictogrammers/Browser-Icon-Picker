/**
 * MaterialDesignIcons-Picker
 *
 * jQuery-inspired functions
 */

const computeOffset = (elem) => {
    const rect = elem.getBoundingClientRect(),
        bodyElt = document.body;

    return {
        top: rect.top + bodyElt .scrollTop,
        left: rect.left + bodyElt .scrollLeft
    };
};

const outerHeight = (elem, includeMargin) => {
    let height = elem.offsetHeight;

    if (!includeMargin) {
        return height;
    }

    const style = getComputedStyle(elem);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
};

export { computeOffset, outerHeight };
