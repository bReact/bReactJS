import _ from '../utils';
import * as vDOM from '../vdom';
import { createDomElement } from './create';
import { setDomAttribute, removeDomAttribute } from './attributes';
import * as events from './events';

export function commit(actions)
{
    console.log(actions);

    _.foreach(actions, function(i, action)
    {
        let {callback, args } = action;
        
        callback.apply(null, args);
    });
}

export function replaceText(vnode, text)
{
    vnode.nodeValue = text;

    vDOM.nodeElem(vnode).nodeValue = text;
}

export function replaceNode(left, right)
{
    vDOM.nodeWillUnmount(left);

    removeEvents(left);

    // todo fix path
    let DOMElement = createDomElement(right, vDOM.nodePath(left));

    let lDOMElement = vDOM.nodeElem(left);

    lDOMElement.parentNode.replaceChild(DOMElement, lDOMElement);

    vDOM.patchVnodes(left, right);
}

export function appendChild(parentVnode, vnode)
{
    // todo fix path
    let index = _.size(parentVnode.children);
    let basePath = vDOM.nodePath(parentVnode);

    let DOMElement = createDomElement(vnode, basePath + '.' + index);

    vDOM.nodeElem(parentVnode).appendChild(DOMElement);

    parentVnode.children.push(vnode);
}

export function removeChild(parentVnode, vnode)
{
    vDOM.nodeWillUnmount(vnode);

    removeEvents(vnode);

    _.foreach(parentVnode.children, function(i, child)
    {
        if (child === vnode)
        {            
            parentVnode.children.splice(i, 1);

            return false;
        }
    });

    vDOM.nodeElem(parentVnode).removeChild(vDOM.nodeElem(vnode));
}

function removeEvents(vnode)
{
    if (vDOM.isThunk(vnode) || vDOM.isFragment(vnode))
    {
        if (!vDOM.noChildren(vnode))
        {
            _.foreach(vnode.children, function(i, child)
            {
                removeEvents(child);
            });
        }
    }
    else if (vDOM.isNative(vnode))
    {
        let DOMElement = vDOM.nodeElem(vnode);

        if (DOMElement)
        {
            events.removeEventListener(DOMElement);
        }

        if (!vDOM.noChildren(vnode))
        {
            _.foreach(vnode.children, function(i, child)
            {
                removeEvents(child);
            });
        }
    }
}

export function insertAtIndex(parentVnode, vnode, index)
{
    // Node vdom indexes and DOM indexes may be different because thunks
    // can render multiple children

    let path = vDOM.nodePath(parentVnode) + '.' + index;

    let DOMElement = createDomElement(vnode, path);

    let parentDOMElement = vDOM.nodeElem(parentVnode);

    if (index >= parentDOMElement.children.length)
    {
        parentDOMElement.appendChild(DOMElement);
    }
    else
    {
        parentDOMElement.insertBefore(DOMElement, parentDOMElement.children[index]);
    }

    parentVnode.children.splice(index, 0, vnode);
}

export function moveToIndex(parentVnode, vnode, index)
{
    let DOMElement       = vDOM.nodeElem(vnode);
    let parentDOMElement = DOMElement.parentNode;
    let currIndex        = Array.prototype.slice.call(parentDOMElement.children).indexOf(DOMElement);

    // Nothing to do
    if (currIndex === index || (index === 0 && parentDOMElement.children.length === 0))
    {
        
    }
    else if (index === 0)
    {
        parentDOMElement.insertBefore(DOMElement, parentDOMElement.firstChild);
    }
    // Move to end
    else if (index >= parentDOMElement.children.length)
    { 
        parentDOMElement.removeChild(DOMElement);
        parentDOMElement.appendChild(DOMElement);
    }
    else
    {
        parentDOMElement.insertBefore(DOMElement, parentDOMElement.children[index]);
    }

    // Move vnode
    let vChildren  = parentVnode.children;
    let vCurrIndex = vChildren.indexOf(vnode);

    // Do nothing
    if (vCurrIndex === index || (index === 0 && vChildren.length === 0))
    {
        // Nothing to do
    }
    else
    {
        vChildren.splice(index, 0, vChildren.splice(vCurrIndex, 1)[0]);
    }
}

export function setAttribute(vnode, name, value, previousValue)
{
    setDomAttribute(vDOM.nodeElem(vnode), name, value, previousValue);
}

export function removeAttribute(vnode, name, previousValue)
{
    removeDomAttribute(vDOM.nodeElem(vnode), name, previousValue)
}
