import createNativeElement from './factory';
import * as vDOM from '../vdom';
import { setDomAttribute } from './attributes';
import _ from '../utils';

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export function createDomElement(vnode, parentDOMElement)
{        
    switch (vnode.type)
    {
        case 'text':
            return createTextNode(vnode, vnode.nodeValue);
        
        case 'empty':
            return createTextNode(vnode, '');
        
        case 'thunk':
            return createThunk(vnode, parentDOMElement);
        
        case 'fragment':
            return createFragment(vnode, parentDOMElement);
        
        case 'native':
            return createHTMLElement(vnode);
    }
}

function createTextNode(vnode, text)
{
    let DOMElement = document.createTextNode(text);

    vDOM.nodeElem(vnode, DOMElement);

    return DOMElement;
}

function createHTMLElement(vnode)
{
    let { tagName, attributes, children } = vnode;

    let DOMElement = createNativeElement(tagName);

    _.foreach(attributes, function(prop, value)
    {
        setDomAttribute(DOMElement, prop, value);
    });

    vDOM.nodeElem(vnode, DOMElement);

    _.foreach(children, function(i, node)
    {
        if (!_.is_empty(node))
        {            
            let child = createDomElement(node, DOMElement);

            if (_.is_array(child))
            {
                mountFragment(DOMElement, child);
            }
            else
            {
                DOMElement.appendChild(child);
            }
        }
    });

    return DOMElement;
}

/* Handles nested fragments */
function mountFragment(DOMElement, children)
{
    if (_.is_htmlElement(children))
    {
        DOMElement.appendChild(children);

        return;
    }

    if (_.is_array(children))
    {
        _.foreach(children, function(i, child)
        {
            mountFragment(DOMElement, child);
        });
    }
}

function createThunk(vnode, parentDOMElement)
{
    // Skip this it's already been rendered if it's coming from a patch
    if (vDOM.isThunkInstantiated(vnode))
    {
        let DOMElement = createDomElement(vnode.children[0], parentDOMElement);

        vDOM.nodeElem(vnode, DOMElement);

        return DOMElement;
    }

    let { fn, props } = vnode;

    let component = vDOM.thunkInstantiate(vnode);

    vDOM.pointVnodeThunk(vnode, component);

    let DOMElement = createDomElement(vnode.children[0], parentDOMElement);

    vDOM.nodeElem(vnode, DOMElement);

    return DOMElement;
}

function createFragment(vnode, parentDOMElement)
{    
    vDOM.nodeElem(vnode, parentDOMElement);

    let ret = [];

    _.foreach(vnode.children, function(i, node)
    {
        ret.push(createDomElement(node, parentDOMElement));
    });

    return ret;
}
