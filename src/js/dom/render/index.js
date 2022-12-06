import { createDomElement } from '../dom';
import { createElement } from '../vdom';

export function render(component, parent)
{        
    let vnode = createElement(component);

    let DOMElement = createDomElement(vnode);

    parent.appendChild(DOMElement);
}