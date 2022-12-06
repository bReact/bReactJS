import createNativeElement from './factory';
import { createPath, thunkName, isMounted, componentNode, pointVnodeThunk, isThunk, nodeElem, nodePath, instantiateThunk, isThunkInstantiated } from '../vdom';
import {attributes as setAttributes} from './attributes';
import _ from '../utils';

/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

export function createDomElement(vnode, path)
{        
    path = typeof path === 'undefined' ? 'root' : path;

    switch (vnode.type)
    {
        case 'text':
            return createTextNode(vnode, vnode.nodeValue, path);
        
        case 'empty':
            return createTextNode(vnode, '', path);
        
        case 'thunk':
            return createThunk(vnode, path);
        
        case 'fragment':
            return createFragment(vnode, path);
        
        case 'native':
            return createHTMLElement(vnode, path);
    }
}

function createTextNode(vnode, text, path)
{
    let DOMElement = document.createTextNode(text);

    nodePath(vnode, path);

    nodeElem(vnode, DOMElement);

    return DOMElement;
}

function createHTMLElement(vnode, path)
{
    let { tagName, attributes, children } = vnode;

    let DOMElement = createNativeElement(tagName);

    setAttributes(attributes);

    nodeElem(vnode, DOMElement);

    nodePath(vnode, path);

    _.foreach(children, function(i, node)
    {
        if (!_.is_empty(node))
        {            
            let child = createDomElement(node, createPath(path, i));
            
            if (child)
            {
                DOMElement.appendChild(child);
            }
        }
    });

    return DOMElement;
}

function createThunk(vnode, path)
{
    let basePath = createPath(path, thunkName(vnode));

    // Skip this it's already been rendered if it's coming from a patch
    if (isThunkInstantiated(vnode))
    {
        nodePath(vnode, basePath);

        let DOMElement = createDomElement(vnode.children[0], basePath + '.0');

        nodeElem(vnode, DOMElement);

        return DOMElement;
    }

    let { fn, props } = vnode;

    let component = instantiateThunk(vnode);

    nodePath(vnode, basePath);

    pointVnodeThunk(vnode, component);

    let DOMElement = createDomElement(vnode.children[0], basePath + '.0');

    nodeElem(vnode, DOMElement);

    return DOMElement;
}

function createFragment(vnode, path)
{
    /*let { fn, props, key } = vnode;

    let component = _.is_class(fn) ? new fn(props) : fn(props);

    let basePath = createPath(path, key, thunkName(vnode));

    render(component);

    vnode['children'] = component.props.children;

    let children = [];

    _.foreach(component.props.children, function(i, node)
    {
        let childPath = createPath(path, node.key || index);
            
        let child = createDomElement(node, childPath)
        
        DOMElement.appendChild(child);
    });

    return children;*/
}

function findThunkDomEl(vnode)
{
    return nodeElem(vnode);
}
