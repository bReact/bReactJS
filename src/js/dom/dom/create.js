import createNativeElement from './factory';
import * as vDOM from '../vdom';
import { setDomAttribute } from './attributes';
import _ from '../utils';

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export function createDomElement(vnode, parentVnode)
{        
    switch (vnode.type)
    {
        case 'text':
            return createTextNode(vnode, vnode.nodeValue);
        
        case 'empty':
            return createTextNode(vnode, '');
        
        case 'thunk':
            return createThunk(vnode, parentVnode);
        
        case 'fragment':
            return createFragment(vnode, parentVnode);
        
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

    _.foreach(children, function(i, child)
    {
        if (!_.is_empty(child))
        {            
            let childDomElement = createDomElement(child, vnode);

            // Returns a fragment
            if (_.is_array(childDomElement))
            {
                mountFragment(DOMElement, childDomElement, i);
            }
            else
            {
                DOMElement.appendChild(childDomElement);
            }
        }
    });

    return DOMElement;
}

/* Handles nested fragments */
function mountFragment(DOMElement, children, index)
{
    if (_.is_array(children))
    {
        _.foreach(children, function(i, child)
        {
            mountFragment(DOMElement, child, index);
        });
    }

    if (_.is_htmlElement(children))
    {
        DOMElement.appendChild(children);

        return;
    }
}

function createThunk(vnode, parentVnode)
{
    // Skip this it's already been rendered if it's coming from a patch
    if (vDOM.isThunkInstantiated(vnode))
    {
        let DOMElement = createDomElement(vnode.children[0], vnode);

        vDOM.nodeElem(vnode, DOMElement);

        return DOMElement;
    }

    let { fn, props } = vnode;

    let component = vDOM.thunkInstantiate(vnode);

    let DOMElement = createDomElement(component.props.children[0], vnode);

    vDOM.pointVnodeThunk(vnode, component, parentVnode);
    
    // returned a fragment or a component that returned a fragment
    if (!_.is_htmlElement(DOMElement))
    {
        vDOM.nodeElem(vnode, DOMElement);
    }

    return DOMElement;
}

function createFragment(vnode, parentVnode)
{    
    let ret = [];

    _.foreach(vnode.children, function(i, node)
    {
        ret.push(createDomElement(node, parentVnode));
    });

    return ret;
}
