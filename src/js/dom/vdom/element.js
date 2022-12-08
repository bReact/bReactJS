import _ from '../utils';

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
        
        normalizedProps[i] = props[i];
    }

    children = typeof children === 'undefined' ? [] : children;

    if (arguments.length > 2)
    {
        children = arguments.length > 3 ? [].slice.call(arguments, 2) : children;
    }

    children = normaliseChildren(children);

    // If a Component VNode, check for and apply defaultProps
    // Note: type may be undefined in development, must never error here.
    if (typeof tag == 'function' && tag.defaultProps != null)
    {
        for (i in tag.defaultProps)
        {
            if (normalizedProps[i] === undefined)
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
            _path: '',
            _prevAttrs: '',
        }
    }
}

/**
 * Cleans up the array of child elements.
 * - Flattens nested arrays
 * - Converts raw strings and numbers into vnodes
 * - Filters out undefined elements
 */

function normaliseChildren(children, offset)
{    
    offset = typeof offset === 'undefined' ? 0 : offset;

    var ret = [];

    if (_.is_array(children))
    {
        _.foreach(children, function(i, vnode)
        {
            let _key = '|' + (offset + i);

            if (_.is_string(vnode) || _.is_number(vnode))
            {
                ret.push(createTextElement(vnode, _key))
            }
            else if (_.is_empty(vnode))
            {
                ret.push(createEmptyElement(_key))
            }
            else if (_.is_array(vnode))
            {                
                vnode = normaliseChildren(vnode, ret.length);
                
                ret = [...ret, ...vnode];
            }
            else
            {
                if (!vnode.key)
                {
                    vnode.key = _key;
                }

                ret.push(vnode);
            }
           
        });
    }
    
    return _.is_empty(ret) ? [createEmptyElement('|0')] : filterChildren(ret);
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
            _domEl: null,
            _path: '',
        }
    }
}

/**
 * Text nodes are stored as objects to keep things simple
 */

function createEmptyElement(key)
{
    return {
        type: 'empty',
        key: key,
        __internals:
        {
            _domEl: null,
            _path: '',
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
            _name : _.callable_name(fn),
            _path: '',
        }
    }
}

/**
 * Lazily-rendered virtual nodes
 */

function createFunctionThunk(fn, props, children, key, ref)
{    
    return {
        type: 'thunkFunc',
        fn,
        children,
        props,
        key,
        __internals:
        {
            _domEl: null,
            _component: null,
            _name : _.callable_name(fn),
            _path: '',
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
    if (!node.children || node.children.length === 0)
    {
        return true;
    }

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

export let prevPath = function(vnode)
{
    let path = nodePath(vnode).split('.');

    path.pop();

    return path.join('.');
}

/**
 * Create a node path, eg. (23,5,2,4) => '23.5.2.4'
 */

export let createPath = (...args) =>
{
    return args.join('.');
}

/**
 * Returns thunk function / class name
 */

export let thunkName = (node) =>
{
    return node.__internals._name;
}

/**
 * Get/set a nodes path
 */

export let nodePath = (node, path) =>
{
    if (!_.is_undefined(path))
    {
        node.__internals._path = path + '';
    }

    return node.__internals._path;
}

/**
 * Get/set a nodes DOM element
 */

export let nodeElem = (node, elem) =>
{
    if (!_.is_undefined(elem))
    {
        node.__internals._domEl = elem;
    }

    return node.__internals._domEl;
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
        // Point .node.__internals._domEl -> component -> first nodeElement
        nodeElem(vnode, findThunkDomEl(vnode));

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

export let nodeWillMount = (vnode) =>
{
    
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


function findThunkDomEl(node)
{
    while (isThunk(node))
    {
        node = node.__internals._component.props.children[0];
    }

    return nodeElem(node);
}

/**
 * Empty node children
 */

export let emptyChildren = (node) =>
{
   
}

export default createElement;