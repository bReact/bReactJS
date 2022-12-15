import _ from '../utils/index';

/**
 * This function lets us create virtual nodes using a simple
 * syntax. It is compatible with JSX transforms so you can use
 * JSX to write nodes that will compile to this function.
 *
 * let node = element('div', { id: 'foo' }, [
 *   element('a', { href: 'http://google.com' },
 *     element('span', {}, 'Google'),
 *     element('b', {}, 'Link')
 *   )
 * ])
 */
export function createElement(tag, props, ...children)
{        
    if (arguments.length === 0)
    {
        return createEmptyElement();
    }

    let normalizedProps = {},
        key,
        ref,
        i;

    for (i in props)
    {
        if (i == 'key') 
        {
            key = props[i];
        }
        else if (i == 'ref')
        {
            ref = props[i];
        }
        else
        {
            normalizedProps[i] = props[i];
        }
    }

    children = typeof children === 'undefined' ? [] : children;

    if (arguments.length > 2)
    {
        children = arguments.length > 3 ? [].slice.call(arguments, 2) : children;
    }

    children = normaliseChildren(children);

    // If a Component VNode, check for and apply defaultProps
    // Note: type may be undefined in development, must never error here.
    if (_.is_callable(tag) && _.is_object(tag.defaultProps))
    {
        for (i in tag.defaultProps)
        {
            if (_.is_undefined(normalizedProps[i]))
            {
                normalizedProps[i] = tag.defaultProps[i];
            }
        }
    }

    if (typeof tag === 'function')
    {
        return createThunkElement(tag, normalizedProps, children, key, ref);
    }

    return {
        type: 'native',
        tagName: tag,
        attributes: normalizedProps,
        children,
        ref,
        key,
        __internals:
        {
            _domEl: null,
            _prevAttrs: ''
        }
    }
}

/**
 * Cleans up the array of child elements.
 * - Flattens nested arrays
 * - Flattens nested fragments
 * - Converts raw strings and numbers into vnodes
 * - Filters out undefined elements
 * - Fragments that are nested inside an normal node
 * - are essentially just array containers, so they get flattened here.
 * - if a component returns a fragment however that gets handled
 * - during the commit/patch/create stages.
 */

function normaliseChildren(children, checkKeys)
{    
    checkKeys = _.is_undefined(checkKeys) ? false : checkKeys;

    let fragmentcount = 0;

    var ret = [];

    if (_.is_array(children))
    {
        _.foreach(children, function(i, vnode)
        {
            if (_.is_null(vnode) || _.is_undefined(vnode))
            {
                ret.push(createEmptyElement());
            }
            else if (checkKeys && !vnode.key)
            {
                throw new Error('Each child in a list should have a unique "key" prop.')
            }
            else if (_.is_string(vnode) || _.is_number(vnode))
            {
                ret.push(createTextElement(vnode, null));
            }
            else if (_.is_array(vnode))
            {                
                let _children = normaliseChildren(vnode, true);
                
                _.array_merge(ret, _children);
            }
            else if (isFragment(vnode))
            {       
                squashFragment(vnode, ret, fragmentcount);

                fragmentcount++;
            }
            else
            {
                ret.push(vnode);
            }
        });
    }

    return _.is_empty(ret) ? [createEmptyElement()] : filterChildren(ret);
}

function squashFragment(fragment, ret, fCount)
{
    let basekey = !fragment.key ? `f_${fCount}` : fragment.key;

    let _children = normaliseChildren(fragment.children, false);

    _.foreach(_children, function(i, vnode)
    {
        vnode.key = `${basekey}|${i}`;
    });
    
    _.array_merge(ret, _children);
}

/**
 * If a node comprises of multiple empty children, filter
 * children and return only a single "empty" child
 */
function filterChildren(children)
{
    // Empty
    let ret = [children[0]];

    _.foreach(children, function(i, vnode)
    {
        if (!isEmpty(vnode))
        {
            ret = children;

            return false;
        }
    });

    return ret;
}

/**
 * Text nodes are stored as objects to keep things simple
 */

function createTextElement(text, key)
{    
    text = _.is_string(text) ? text : text + '';

    return {
        type: 'text',
        nodeValue: text + '',
        key : key,
        __internals:
        {
            _domEl: null
        }
    }
}

/**
 * Text nodes are stored as objects to keep things simple
 */

function createEmptyElement()
{
    return {
        type: 'empty',
        key: null,
        __internals:
        {
            _domEl: null
        }
    }
}

/**
 * Lazily-rendered virtual nodes
 */

function createThunkElement(fn, props, children, key, ref)
{
    let _type = _.is_class(fn, 'Fragment') ? 'fragment' : 'thunk';

    return {
        type: _type,
        fn,
        children,
        props,
        key,
        __internals:
        {
            _domEl: null,
            _component: null,
            _name : _.callable_name(fn)
        }
    }
}

/**
 * Patch a left vnode with a right one
 */

export function patchVnode(left, right)
{
    for (let key in left)
    {
        delete left[key];
    }

    for (let key in right)
    {
        left[key] = right[key];
    }
}

/**
 * Functional type checking
 */

export let isMounted = (node) =>
{
    return _.in_dom(nodeElem(node));
}

export let isFragment = (node) =>
{
    return node.type === 'fragment';
}

export let isThunk = (node) =>
{
    return node.type === 'thunk';
}

export let isNative = (node) =>
{
    return node.type === 'native';
}

export let isText = (node) =>
{
    return node.type === 'text';
}

export let isEmpty = (node) =>
{
    return node.type === 'empty';
}

export let noChildren = (node) =>
{
    return node.children.length === 1 && isEmpty(node.children[0]);
}

export let singleChild = (node) =>
{
    return node.children.length === 1 && !isEmpty(node.children[0]);
}

export let isSameThunk = (left, right) =>
{
    return isThunk(left) && isThunk(right) && left.fn === right.fn;
}

export let isThunkInstantiated = (vnode) =>
{
    return nodeComponent(vnode) !== null;
}

export let isSameFragment = (left, right) =>
{
    return isFragment(left) && isFragment(right) && left.fn === right.fn;
}

/**
 * Checks if thunk is nesting only a fragment.
 */

export let isNestingFragment = (node) =>
{
    if (isThunk(node) && isThunkInstantiated(node))
    {
        while (node.children && isThunk(node))
        {
            node = node.children[0];
        }

        return isFragment(node);
    }

    return false;
}

/**
 * Returns thunk function / class name
 */

export let thunkName = (node) =>
{
    return node.__internals._name;
}

/**
 * Get/set a nodes DOM element
 */

export let nodeElem = (node, elem) =>
{
    if (!_.is_undefined(elem))
    {
        node.__internals._domEl = elem;

        return elem;
    }

    if (isThunk(node) || isFragment(node))
    {
        return findThunkDomEl(node);
    }

    return node.__internals._domEl;
}

/**
 * Returns the actual parent DOMElement of a parent node.
 * 
 */

export let nodeElemParent = (parent) =>
{
    if (isFragment(parent) || isThunk(parent))
    {
        let child = nodeElem(parent);

        return _.is_array(child) ? child[0].parentNode : child.parentNode;
    }

    return nodeElem(parent);
}

/**
 * Returns the parent DOMElement of a given vnNode
 * 
 */

export let parentElem = (node) =>
{
    // Native node
    if (isNative(node) || isText(node) || isEmpty(node))
    {
        return nodeElem(node).parentNode;
    }
    
    // Thunks / fragments with a direct child
    let child = vnode.children[0];

    if (isNative(child) || isText(child) || isEmpty(child))
    {
        return nodeElem(child).parentNode;
    }

    // Recursively traverse down tree until either a DOM node is found
    // or a fragment is found and return it's parent

    while (isThunk(child) || isFragment(child))
    {
        vnode = child;
        child = child.children[0];
    }

    return isFragment(vnode) ? nodeElem(vnode.children[0]).parentNode : nodeElem(vnode).parentNode;
}

/**
 * Returns the parent DOMElement of a given vnNode
 * 
 */

export let childDomIndex = (parent, index) =>
{
    if (parent.children.length <= 1)
    {
        return 0;
    }

    let buffer = 0;

    _.foreach(parent.children, function(i, child)
    {
        if (vnode === child)
        {
            return false;
        }
        else if (isThunk(child))
        {
            let els = nodeElem(child);

            if (_.is_array(els))
            {
                buffer += els.length;
            }
        }
    });

    return buffer + index;
}

/**
 * Get/set a nodes DOM element
 */

export let nodeAttributes = (node, attrs) =>
{
    if (!_.is_undefined(attrs))
    {
        node.__internals._prevAttrs = node.attributes;

        node.attributes = attrs;
    }

    return node.attributes;
}

/**
 * Get/set a nodes component
 */

export let nodeComponent = (node, component) =>
{
    if (!_.is_undefined(component))
    {
        node.__internals._component = component;
    }

    return node.__internals._component;
}

// Recursively traverse down tree until either a DOM node is found
// or a fragment is found and return it's children

function findThunkDomEl(vnode)
{
    if (isNative(vnode) || isText(vnode) || isEmpty(vnode))
    {
        return nodeElem(vnode);
    }

    let child = vnode.children[0];

    while (isThunk(child) || isFragment(child))
    {
        vnode = child;
        child = child.children[0];
    }

    return isFragment(vnode) ? 
        _.map(vnode.children, function(i, child)
        { 
            return nodeElem(child); 
        }) 
        : nodeElem(vnode);
}

// Recursively traverse down tree until either a DOM node is found
// or a fragment is found and return it's children

function findThunkParentDomEl(vnode)
{
    let child = vnode.children[0];

    if (isNative(child) || isText(child) || isEmpty(child))
    {
        return nodeElem(child).parentNode;
    }

    while (isThunk(child) || isFragment(child))
    {
        vnode = child;
        child = child.children[0];
    }

    return isFragment(vnode) ? nodeElem(vnode.children[0]).parentNode : nodeElem(vnode).parentNode;
}

/**
 * Points vnode -> component and component -> vndode
 */

export let pointVnodeThunk = (vnode, component) =>
{
    // point vnode -> component
    vnode.__internals._component = component;

    // point component -> vnode
    component.__internals.vnode = vnode;

    // Point vnode.children -> component.props.children
    if (component.props && component.props.children)
    {
        vnode.children = component.props.children;
    }
}

export function patchVnodes(left, right)
{
    _.foreach(left, function(key, val)
    {
        let rval = right[key];

        if (_.is_undefined(rval))
        {
            delete left[key];
        }
        else
        {
            left[key] = rval;
        }
    });
}

/**
 * Recursively calls unmount on nested components
 * in a sub tree
 */

export let nodeWillUnmount = (vnode) =>
{
    if (isThunk(vnode) || isFragment(vnode))
    {
        let component = nodeComponent(vnode);

        if (component && _.is_callable(component.componentWillUnmount))
        {
            component.componentWillUnmount();
        }

        if (!noChildren(vnode))
        {
            _.foreach(vnode.children, function(i, child)
            {
                nodeWillUnmount(child);
            });
        }
    }
    else if (isNative(vnode) && !noChildren(vnode))
    {
        _.foreach(vnode.children, function(i, child)
        {
            nodeWillUnmount(child);
        });
    }
}



export default createElement;