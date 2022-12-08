import { createDomElement } from '../dom';
import { createElement, nodeElem } from '../vdom';
import _ from '../utils';

export function render(component, parent)
{        
    let vnode = createElement(component);

    let DOMElement = createDomElement(vnode, parent);

    mount(DOMElement, parent);

    console.log(vnode);
}

export function mount(DOMElement, parent)
{        
    console.log(DOMElement);

    // Edge case where root renders a fragment
    if (_.is_array(DOMElement))
    {
        _.foreach(DOMElement, function(i, childDomElement)
        {
            if (_.is_array(childDomElement))
            {
                mount(childDomElement, parent);
            }
            else
            {
                parent.appendChild(childDomElement);
            }
        });

        return;
    }

    if (_.is_htmlElement(DOMElement))
    {
        parent.appendChild(DOMElement);
    }
}