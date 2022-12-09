/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/dom/dom/factory.js
const SVG_ELEMENTS = 'animate circle clipPath defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan use'.split(' ');

const SVG_MAP = SVG_ELEMENTS.reduce(function (acc, name)
{
    acc[name] = true;
    
    return acc;

}, {});

function has(prop, obj)
{
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

function isSvg(name)
{
    return has(name, SVG_MAP)
}

function createNativeElement(tag)
{
    return isSvg(tag) ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
}
;// CONCATENATED MODULE: ./src/js/dom/utils/index.js
/**
 * Returns var if set
 *
 * @param  node   el   Target element
 * @param  string type Valid event name
 */
function isset(mixed_var, keys)
{
    if (!mixed_var)
    {
        return;
    }
    
    keys = keys.split('.');

    let len = keys.length;

    for (var i = 0; i < len; i++)
    {
        mixed_var = mixed_var[keys[i]];

        if (!mixed_var)
        {
            return;
        }
    }

    return mixed_var;
}

/**
 * Triggers a native event on an element
 *
 * @param  node   el   Target element
 * @param  string type Valid event name
 */
function triggerEvent(el, type)
{
    if ('createEvent' in document)
    {
        var evt = document.createEvent("HTMLEvents");

        evt.initEvent(type, false, true);

        el.dispatchEvent(evt);
    }
    else
    {
        el.fireEvent(type);
    }
}

function foreach(obj, callback, args)
{
    var value, i = 0,
        length = obj.length,
        isArray = Object.prototype.toString.call(obj) === '[object Array]';

    var thisArg = typeof args !== 'undefined' && Object.prototype.toString.call(args) !== '[object Array]' ? args : obj;

    if (Object.prototype.toString.call(args) === '[object Array]')
    {
        if (isArray)
        {
            for (; i < length; i++)
            {
                var _currArgs = [i, obj[i]];

                value = callback.apply(thisArg, array_merge([i, obj[i]], args));

                if (value === false)
                {
                    break;
                }
            }
        }
        else
        {
            for (i in obj)
            {
                var _currArgs = [i, obj[i]];

                value = callback.apply(thisArg, array_merge([i, obj[i]], args));

                if (value === false)
                {
                    break;
                }
            }
        }

        // A special, fast, case for the most common use of each
    }
    else
    {
        if (isArray)
        {
            for (; i < length; i++)
            {
                value = callback.call(thisArg, i, obj[i]);

                if (value === false)
                {
                    break;
                }
            }
        }
        else
        {
            for (i in obj)
            {
                value = callback.call(thisArg, i, obj[i]);

                if (value === false)
                {
                    break;
                }
            }
        }
    }

    return obj;
}

 /**
 * Set a key using dot/bracket notation on an object or array
 *
 * @param  string       path   Path to set
 * @param  mixed        value  Value to set
 * @param  object|array object Object to set into
 * @return object|array
 */
function array_set(path, value, object)
{
    _arraySetRecursive(_arrayKeySegment(path), value, object);

    return object;
}

/**
 * Gets an from an array/object using dot/bracket notation
 *
 * @param  string       path   Path to get
 * @param  object|array object Object to get from
 * @return mixed
 */
function utils_array_get(path, object)
{
    return _arrayGetRecursive(_arrayKeySegment(path), object);
}

/**
 * Checks if array/object contains path using dot/bracket notation
 *
 * @param  string       path   Path to check
 * @param  object|array object Object to check on
 * @return bool
 */
function array_has(path, object)
{
    return typeof utils_array_get(path, object) !== 'undefined';
}

/**
 * Deletes from an array/object using dot/bracket notation
 *
 * @param  string       path   Path to delete
 * @param  object|array object Object to delete from
 * @return object|array
 */
function array_delete(path, object)
{
    _arrayDeleteRecursive(_arrayKeySegment(path), object);

    return object;
}

/**
 * Filters empty array entries and returns new array
 *
 * @param  object|array object Object to delete from
 * @return object|array
 */
function array_filter(arr)
{
    let isArr = is_array(arr);
    let ret   = isArr ? [] : {};

    foreach(arr, function(i, val)
    {
        if (!is_empty(val))
        {
            isArr ? ret.push(val) : ret[i] = val;
        }
    });

    return ret;
}

/**
 * Merges multiple objects or arrays into the original
 *
 * @param  object|array object Object to delete from
 * @return object|array
 */
function array_merge()
{
    let args = Array.prototype.slice.call(arguments);

    if (args.length === 0)
    {
        throw new Error('Nothing to merge.');
    }
    else if (args.length === 1)
    {
        return args[1];
    }

    let first = args.shift();
    let fType = is_array(first) ? 'array' : 'obj';

    foreach(args, function(i, arg)
    {
        if (!is_array(arg) && !is_object(arg))
        {
            throw new Error('Arguments must be an array or object.');
        }

        foreach(arg, function(i, val)
        {
            fType === 'array' ? first.push(val) : first[i] = val;
        });
    });

    return first;
}

/**
 * Recursively delete from array/object
 *
 * @access private
 * @param  array        keys   Keys in search order
 * @param  object|array object Object to get from
 * @return mixed
 */
function _arrayDeleteRecursive(keys, object)
{
    var key = keys.shift();

    var islast = keys.length === 0;

    if (islast)
    {
        if (Object.prototype.toString.call(object) === '[object Array]')
        {
            object.splice(key, 1);
        }
        else
        {
            delete object[key];
        }
    }

    if (!object[key])
    {
        return false;
    }

    return _arrayDeleteRecursive(keys, object[key]);
}

/**
 * Recursively search array/object
 *
 * @access private
 * @param  array        keys   Keys in search order
 * @param  object|array object Object to get from
 * @return mixed
 */
function _arrayGetRecursive(keys, object)
{
    var key = keys.shift();
    var islast = keys.length === 0;

    if (islast)
    {
        return object[key];
    }

    if (!object[key])
    {
        return undefined;
    }

    return _arrayGetRecursive(keys, object[key]);
}

/**
 * Recursively set array/object
 *
 * @access private
 * @param  array        keys   Keys in search order
 * @param  mixed        value  Value to set
 * @param  parent       object|array or null
 * @param  object|array object Object to set on
 */
function _arraySetRecursive(keys, value, object, nextKey)
{
    var key     = keys.shift();
    var islast  = keys.length === 0;
    var lastObj = object;
    object = !nextKey ? object : object[nextKey];

    // Trying to set a value on nested array that doesn't exist
    if (!['object', 'function'].includes(typeof object))
    {
        throw new Error('Invalid dot notation. Cannot set key "' + key + '" on "' + JSON.stringify(lastObj) + '[' + nextKey + ']"');
    }

    if (!object[key])
    {
        // Trying to put object key into an array
        if (Object.prototype.toString.call(object) === '[object Array]' && typeof key === 'string')
        {
            var converted = Object.assign({}, object);

            lastObj[nextKey] = converted;

            object = converted;
        }

        if (keys[0] && typeof keys[0] === 'string')
        {
            object[key] = {};
        }
        else
        {
            object[key] = [];
        }
    }

    if (islast)
    {
        object[key] = value;

        return;
    }

    _arraySetRecursive(keys, value, object, key);
}

/**
 * Segments an array/object path using dot notation
 *
 * @access private
 * @param  string  path Path to parse
 * @return array
 */
function _arrayKeySegment(path)
{
    var result = [];
    var segments = path.split('.');

    for (var i = 0; i < segments.length; i++)
    {
        var segment = segments[i];

        if (!segment.includes('['))
        {
            result.push(segment);

            continue;
        }

        var subSegments = segment.split('[');

        for (var j = 0; j < subSegments.length; j++)
        {
            if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(subSegments[j][0]))
            {
                result.push(parseInt(subSegments[j].replace(']')));
            }
            else if (subSegments[j] !== '')
            {
                result.push(subSegments[j])
            }
        }
    }

    return result;
}

/**
 * Creates a new object in 'dot.notation'
 * 
 * @param  {Object} obj Object
 * @return {Object} 
 */
function dotify(obj)
{
    var res = {};

    function recurse(obj, current)
    {
        for (var key in obj)
        {
            var value = obj[key];
            var newKey = (current ? current + '.' + key : key); // joined key with dot
            
            if (value && typeof value === 'object' && !(value instanceof Date))
            {
                recurse(value, newKey); // it's a nested object, so do it again
            }
            else
            {
                res[newKey] = value; // it's not an object, so set the property
            }
        }
    }

    recurse(obj);

    return res;
}

/**
 * Checks if HtmlElement is in current DOM
 *
 * @param  mixed  mixed_var Variable to evaluate
 * @return bool
 */
function in_dom(element)
{
    if (!is_htmlElement(element))
    {
        return false;
    }

    if (element === document.body || element === document.documentElement)
    {
        return true;
    }

    while(element)
    {
        if (element === document.documentElement)
        {
            return true;
        }

        element = element.parentNode;
    }

    return false;
}

/**
 * Checks if variable is node.
 *
 * @param  mixed  mixed_var Variable to evaluate
 * @return bool
 */
function is_htmlElement(mixed_var)
{
    return !!(mixed_var && mixed_var.nodeType === 1);
}

/**
 * Is callable ?
 *
 * @param  mixed  mixed_var Variable to check
 * @return bool
 */
function is_callable(mixed_var)
{
    return Object.prototype.toString.call(mixed_var) === '[object Function]';
}

/**
 * Checks if variable is a class declaration.
 *
 * @param  mixed  mixed_var Variable to evaluate
 * @return bool
 */
function is_class(mixed_var, classname)
{
    if (classname)
    {
        if (typeof mixed_var === 'function')
        {
            let re = new RegExp('^\\s*class\\s+(' + classname + '(\\s+|\\{)|\\w+\\s+extends\\s+' + classname + ')', 'i');

            return re.test(mixed_var.toString());
        }

        return false;
    }

    return typeof mixed_var === 'function' && /^\s*class\s+/.test(mixed_var.toString());
}

/**
 * Checks if variable is a class declaration.
 *
 * @param  mixed  mixed_var Variable to evaluate
 * @return bool
 */
function callable_name(mixed_var)
{
    if (is_class(mixed_var))
    {
        return mixed_var.toString().match(/^\s*class\s+\w+/)[0].replace('class', '').trim();
    }
    else if (is_callable(mixed_var))
    {
        return mixed_var.name;
    }
    else if (is_object(mixed_var))
    {
        return mixed_var.constructor.name;
    }
}

/**
 * Gets variable size 
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function size(mixed_var)
{
    if (is_string(mixed_var) || is_array(mixed_var))
    {
        return mixed_var.length;
    }
    else if (is_number(mixed_var))
    {
        return mixed_var;
    }
     else if (is_bool(mixed_var))
    {
        return mixed_var === true ? 1 : 0;
    }
    else (is_object(mixed_var))
    {
        return Object.keys(mixed_var).length;
    }

    return 1;
}

/**
 * Check if two vars are equal
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function bool(mixed_var)
{
    mixed_var = (typeof mixed_var === 'undefined' ? false : mixed_var);

    if (typeof mixed_var === 'boolean')
    {
        return mixed_var;
    }

    if (typeof mixed_var === 'number')
    {
        return mixed_var > 0;
    }

    if (typeof mixed_var === 'string')
    {
        mixed_var = mixed_var.toLowerCase().trim();

        if (mixed_var === 'false') return false;
        if (mixed_var === 'true') return true;
        if (mixed_var === 'on') return true;
        if (mixed_var === 'off') return false;
        if (mixed_var === 'undefined') return false;
        if (is_numeric(mixed_var)) return Number(mixed_var) > 0;
        if (mixed_var === '') return false;
    }

    return false;
}

/**
 * Checks if variable is an object
 *
 * @param  mixed  mixed_var Variable to evaluate
 * @return bool
 */
function is_object(mixed_var)
{
    if (Object.prototype.toString.call(mixed_var) === '[object Array]')
    {
        return false;
    }

    return mixed_var !== null && typeof mixed_var === 'object';
}

/**
 * Is array
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_array(mixed_var)
{
    return typeof mixed_var !== 'undefined' && (Object.prototype.toString.call(mixed_var) === '[object Array]' || Object.prototype.toString.call(mixed_var) === '[object NodeList]');
}

/**
 * Is string
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_string(mixed_var)
{
    return typeof mixed_var === 'string' || mixed_var instanceof String;
}

/**
 * Is number
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_number(mixed_var)
{
    return typeof mixed_var === 'number' && !isNaN(mixed_var);
}

/**
 * Is string
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_numeric(mixed_var)
{
    if (is_number(mixed_var))
    {
        return true;
    }
    else if (is_string(mixed_var))
    {
        return /^-?\d+$/.test(mixed_var.trim());
    }

    return false;
}

/**
 * Is undefined
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_undefined(mixed_var)
{
    return typeof mixed_var === 'undefined';
}

/**
 * Is null
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_null(mixed_var)
{
    return mixed_var === null;
}

/**
 * Is bool
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_bool(mixed_var)
{
    return mixed_var === false || mixed_var === true;
}

/**
 * Is empty
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_empty(mixed_var)
{
    if (is_string(mixed_var))
    {
        return mixed_var.trim() === '';
    }
    else if (is_number(mixed_var))
    {
        return mixed_var === 0 || isNaN(mixed_var);
    }
    else if (is_array(mixed_var))
    {
        return mixed_var.length === null || mixed_var.length <= 0;
    }
    else if (is_object(mixed_var))
    {
        return Object.keys(mixed_var).length === 0;
    }
    else if (mixed_var === false || mixed_var === null || (typeof mixed_var === 'undefined'))
    {
        return true;
    }

    return false;
}

function equalTraverseable(a, b)
{   
    if (size(a) !== size(b))
    {
        return false;
    }

    let ret = true;

    foreach(a, function(i, val)
    {
        if (!is_equal(val, b[i]))
        {
            ret = false;

            return false;
        }
    });

    return ret;
}

/**
 * Check if two vars are equal
 * 
 * @param  mixed mixed_var Variable to test
 * @return bool
 */
function is_equal(a, b)
{
    if ((typeof a) !== (typeof b))
    {
        return false;
    }
    else if (is_string(a) || is_number(a) || is_bool(a) || is_null(a))
    {
        return a === b;
    }
    else if (is_array(a) || is_object(b))
    {
        if (a === b)
        {
            return true;
        }
        else if (is_array(a) && !is_array(b))
        {
            return false;
        }

        return equalTraverseable(a, b);
    }

    return true;
}

function cloneObj(obj)
{
    // Handle date objects
    if (obj instanceof Date)
    {
        let r = new Date();

        r.setTime(obj.getTime());
        
        return r;
    }

    // Handle empty 
    if (is_empty(obj))
    {
        return {};
    }

    // Loop

    // Handle classes or functions/objects (functions that return this)
    let ret      = constructorClone(obj);
    let excludes = ['constructor', '__proto__', '__defineGetter__', '__defineSetter__', 'hasOwnProperty', '__lookupGetter__', '__lookupSetter__', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'valueOf', '__proto__'];
    let funcs    = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));
    let props    = Object.keys(obj);
    let keys     = [...funcs, ...props];

    foreach(keys, function(i, key)
    {
        if (!excludes.includes(key) && obj.hasOwnProperty(key))
        {
            ret[key] = cloneDeep(obj[key], ret);
        }        
    });
    
    return ret;
}

function constructorClone(obj)
{
    let name = callable_name(obj);

    if (name === 'Object')
    {
        return {};
    }

    let ret = {};

    ret.constructor = obj.constructor;

    return ret;
}

function cloneFunc(func, context)
{
    context = typeof context === 'undefined' ? func : window;

    return func.bind(context);
}

function cloneArray(arr)
{
    let ret = [];
   
    foreach(arr, function(i, val)
    {
        ret[i] = cloneDeep(val);
    });

    return ret;
}

function cloneDeep(mixed_var, context)
{
    /*
    const argsTag    = '[object Arguments]'
    const arrayTag   = '[object Array]'
    const boolTag    = '[object Boolean]'
    const dateTag    = '[object Date]'
    const errorTag   = '[object Error]'
    const mapTag     = '[object Map]'
    const numberTag  = '[object Number]'
    const objectTag  = '[object Object]'
    const regexpTag  = '[object RegExp]'
    const setTag     = '[object Set]'
    const stringTag  = '[object String]'
    const symbolTag  = '[object Symbol]'
    const weakMapTag = '[object WeakMap]'*/

    if (is_object(mixed_var))
    {
        return cloneObj(mixed_var);
    }
    else if (is_array(mixed_var))
    {
        return cloneArray(mixed_var);
    }
    else if (is_string(mixed_var))
    {
        return mixed_var.slice();
    }
    else if (is_number(mixed_var))
    {
        let r = mixed_var;

        return r;
    }
    else if (is_null(mixed_var))
    {
        return null;
    }
    else if (is_undefined(mixed_var))
    {
        return;
    }
    else if (is_bool(mixed_var))
    {
        return mixed_var === true ? true : false;
    }
    else if (is_callable(mixed_var))
    {
        return cloneFunc(mixed_var, context);
    }

    let r = mixed_var;

    return r;
}

/**
 * Deep merge two objects.
 * 
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources)
{
    if (!sources.length) return target;
    
    const source = sources.shift();

    if (is_object(target) && is_object(source))
    {
        for (const key in source)
        {
            if (is_object(source[key]))
            {
                if (!target[key]) Object.assign(target,
                {
                    [key]:
                    {}
                });

                mergeDeep(target[key], source[key]);
            }
            else
            {
                Object.assign(target,
                {
                    [key]: source[key]
                });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

/**
 * Map with break
 * 
 * return undefined to break loop, true to keep, false to reject
 * 
 * @param [{Array}|{Objet}] arrayOrObj Object or array
 * @param {Function}        callback   Callback
 * @param {context}         context    callback context (optional)
 * 
 * // callback(value, keyOrIndex) this = context 
 */
function map(arrayOrObj, callback, context)
{
    context = typeof context === 'undefined' ? arrayOrObj : context;

    if (is_array(arrayOrObj))
    {
        var ret = [];

        for (var i = 0; i < arrayOrObj.length; i++)
        {
            var value = callback.call(context, arrayOrObj[i], i);

            if (value === false)
            {
                continue;
            }
            else if (typeof value === 'undefined')
            {
                break;
            }
            else if (value)
            {
                ret.push(value);
            }
        }

        return ret;
    }
    else
    {
        var ret = {};

        for (var key in arrayOrObj)
        {
            if (arrayOrObj.hasOwnProperty(key))
            {
                var value = callback.call(context, arrayOrObj[key], key);

                if (value === false)
                {
                    continue;
                }
                else if (typeof value === 'undefined')
                {
                    break;
                }
                else if (value)
                {
                    ret[key] = value;
                }
            }
        }
    }
}


const utils_ = {
    isset,
    triggerEvent,
    foreach,
    array_set,
    array_get: utils_array_get,
    array_has,
    array_delete,
    array_merge,
    dotify,
    size,
    bool,
    cloneDeep,
    in_dom,
    is_equal,
    is_htmlElement,
    is_callable,
    is_class,
    callable_name,
    is_null,
    is_undefined,
    is_empty,
    is_object,
    is_array,
    is_number,
    is_string,
    mergeDeep,
    map,
};

/* harmony default export */ const utils = (utils_);
;// CONCATENATED MODULE: ./src/js/dom/vdom/element.js


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
function createElement(tag, props, ...children)
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
 * - Flattens nested fragments
 * - Converts raw strings and numbers into vnodes
 * - Filters out undefined elements
 */

function normaliseChildren(children, offset, checkKeys)
{    
    offset = typeof offset === 'undefined' ? 0 : offset;

    checkKeys = typeof offset === 'undefined' ? false : checkKeys;

    var ret = [];

    if (utils.is_array(children))
    {
        utils.foreach(children, function(i, vnode)
        {
            if (checkKeys && !vnode.key)
            {
                throw new Error('Each child in a list should have a unique "key" prop.')
            }
            
            let _key = '|' + (offset + i);

            if (utils.is_string(vnode) || utils.is_number(vnode))
            {
                ret.push(createTextElement(vnode, _key))
            }
            else if (utils.is_empty(vnode))
            {
                ret.push(createEmptyElement(_key))
            }
            else if (utils.is_array(vnode))
            {                
                vnode = normaliseChildren(vnode, ret.length, true);
                
                utils.array_merge(ret, vnode);
            }
            else if (isFragment(vnode))
            {       
                vnode = normaliseChildren(vnode.children, ret.length);

                utils.array_merge(ret, vnode);
            }
            else
            {
                ret.push(vnode);
            }
           
        });
    }
    
    return utils.is_empty(ret) ? [createEmptyElement('|0')] : filterChildren(ret);
}

/**
 * If a node comprises of multiple empty children, filter
 * children and return only a single "empty" child
 */
function filterChildren(children)
{
    // Empty
    let ret = [children[0]];

    utils.foreach(children, function(i, vnode)
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
    text = utils.is_string(text) ? text : text + '';

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
    let _type = utils.is_class(fn, 'Fragment') ? 'fragment' : 'thunk';

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
            _name : utils.callable_name(fn),
            _path  : '',
        }
    }
}

/**
 * Patch a left vnode with a right one
 */

function patchVnode(left, right)
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

let isMounted = (node) =>
{
    return _.in_dom(nodeElem(node));
}

let isFragment = (node) =>
{
    return node.type === 'fragment';
}

let isThunk = (node) =>
{
    return node.type === 'thunk';
}

let isNative = (node) =>
{
    return node.type === 'native';
}

let isText = (node) =>
{
    return node.type === 'text';
}

let isEmpty = (node) =>
{
    return node.type === 'empty';
}

let noChildren = (node) =>
{
    if (!node.children || node.children.length === 0)
    {
        return true;
    }

    return node.children.length === 1 && isEmpty(node.children[0]);
}

let singleChild = (node) =>
{
    return node.children.length === 1 && !isEmpty(node.children[0]);
}

let isSameThunk = (left, right) =>
{
    return isThunk(left) && isThunk(right) && left.fn === right.fn;
}

let isThunkInstantiated = (vnode) =>
{
    return nodeComponent(vnode) !== null;
}

let isSameFragment = (left, right) =>
{
    return isFragment(left) && isFragment(right) && left.fn === right.fn;
}

/**
 * Checks if thunk is nesting only a fragment.
 */

let isNestingFragment = (node) =>
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

let prevPath = function(vnode)
{
    let path = nodePath(vnode).split('.');

    path.pop();

    return path.join('.');
}

/**
 * Create a node path, eg. (23,5,2,4) => '23.5.2.4'
 */

let createPath = (...args) =>
{
    return args.join('.');
}

/**
 * Returns thunk function / class name
 */

let thunkName = (node) =>
{
    return node.__internals._name;
}

/**
 * Get/set a nodes path
 */

let nodePath = (node, path) =>
{
    if (!utils.is_undefined(path))
    {
        node.__internals._path = path + '';
    }

    return node.__internals._path;
}

/**
 * Get/set a nodes DOM element
 */

let nodeElem = (node, elem) =>
{
    if (!utils.is_undefined(elem))
    {
        node.__internals._domEl = elem;
    }

    return node.__internals._domEl;
}

/**
 * Get/set a nodes DOM element
 */

let nodeAttributes = (node, attrs) =>
{
    if (!utils.is_undefined(attrs))
    {
        node.__internals._prevAttrs = node.attributes;

        node.attributes = attrs;
    }

    return node.attributes;
}

/**
 * Get/set a nodes component
 */

let nodeComponent = (node, component) =>
{
    if (!utils.is_undefined(component))
    {
        node.__internals._component = component;
    }

    return node.__internals._component;
}

/**
 * Points vnode -> component and component -> vndode
 */

let pointVnodeThunk = (vnode, component, parentVnode) =>
{
    // point vnode -> component
    vnode.__internals._component = component;

    // point component -> vnode
    component.__internals.vnode = vnode;

    // Point vnode.children -> component.props.children
    if (component.props && component.props.children)
    {
        vnode.children = component.props.children;

        if (isNestingFragment(vnode))
        {
            pointNestedFragment(vnode, parentVnode);
        }
        else
        {
            // Point .node.__internals._domEl -> component -> first nodeElement
            nodeElem(vnode, findThunkDomEl(vnode));
        }
    }
}

function pointNestedFragment(vnode, parentVnode)
{
    let DOMElement = nodeElem(parentVnode);

    nodeElem(vnode, DOMElement);

    while (!isFragment(vnode))
    {
        vnode = vnode.children[0];

        nodeElem(vnode, DOMElement);
    }
}

function patchVnodes(left, right)
{
    utils.foreach(left, function(key, val)
    {
        let rval = right[key];

        if (utils.is_undefined(rval))
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

let nodeWillMount = (vnode) =>
{
    
}


/**
 * Recursively calls unmount on nested components
 * in a sub tree
 */

let nodeWillUnmount = (vnode) =>
{
    if (isThunk(vnode) || isFragment(vnode))
    {
        let component = nodeComponent(vnode);

        if (component && utils.is_callable(component.componentWillUnmount))
        {
            component.componentWillUnmount();
        }

        if (!noChildren(vnode))
        {
            utils.foreach(vnode.children, function(i, child)
            {
                nodeWillUnmount(child);
            });
        }
    }
    else if (isNative(vnode) && !noChildren(vnode))
    {
        utils.foreach(vnode.children, function(i, child)
        {
            nodeWillUnmount(child);
        });
    }
}

function findThunkDomEl(node)
{
    while (node && isThunk(node))
    {
        if (isThunkInstantiated(node))
        {
            node = node.__internals._component.props.children[0];
        }
        else
        {
            return null;
        }
    }

    return nodeElem(node);
}

/**
 * Empty node children
 */

let emptyChildren = (node) =>
{
   
}

/* harmony default export */ const vdom_element = ((/* unused pure expression or super */ null && (createElement)));
;// CONCATENATED MODULE: ./src/js/dom/jsx/Parser.js
function oneObject(str) {
    var obj = {}
    str.split(",").forEach(_ => obj[_] = true)
    return obj
}
var voidTag = oneObject("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr")
var specalTag = oneObject('xmp,style,script,noscript,textarea,template,#comment')

var hiddenTag = oneObject('style,script,noscript,template')

const Parser = function(a, f)
{
    if (!(this instanceof Parser)) {
        return parse(a, f)
    }
    this.input = a
    this.getOne = f
}

Parser.prototype = {
    parse: function() {
        return parse(this.input, this.getOne)
    }
}
var rsp = /\s/
    /**
     * 
     * 
     * @param {any} string 
     * @param {any} getOne 只返回一个节点
     * @returns 
     */
function parse(string, getOne) {
    getOne = (getOne === void 666 || getOne === true)
    var ret = lexer(string, getOne)
    if (getOne) {
        return typeof ret[0] === 'string' ? ret[1] : ret[0]
    }
    return ret
}

function lexer(string, getOne) {
    var tokens = []
    var breakIndex = 120
    var stack = []
    var origString = string
    var origLength = string.length

    stack.last = function() {
        return stack[stack.length - 1]
    }
    var ret = []

    function addNode(node) {
        var p = stack.last()
        if (p && p.children) {
            p.children.push(node)
        } else {
            ret.push(node)
        }
    }

    var lastNode
    do {
        if (--breakIndex === 0) {
            break
        }
        var arr = getCloseTag(string)

        if (arr) { //处理关闭标签
            string = string.replace(arr[0], '')
            const node = stack.pop()
                //处理下面两种特殊情况：
                //1. option会自动移除元素节点，将它们的nodeValue组成新的文本节点
                //2. table会将没有被thead, tbody, tfoot包起来的tr或文本节点，收集到一个新的tbody元素中
            if (node.type === 'option') {
                node.children = [{
                    type: '#text',
                    nodeValue: getText(node)
                }]
            } else if (node.type === 'table') {
                insertTbody(node.children)
            }
            lastNode = null
            if (getOne && ret.length === 1 && !stack.length) {
                return [origString.slice(0, origLength - string.length), ret[0]]
            }
            continue
        }

        var arr = getOpenTag(string)
        if (arr) {
            string = string.replace(arr[0], '')
            var node = arr[1]
            addNode(node)
            var selfClose = !!(node.isVoidTag || specalTag[node.type])
            if (!selfClose) { //放到这里可以添加孩子
                stack.push(node)
            }
            if (getOne && selfClose && !stack.length) {
                return [origString.slice(0, origLength - string.length), node]
            }
            lastNode = node
            continue
        }

        var text = ''
        do {
            //处理<div><<<<<<div>的情况
            const index = string.indexOf('<')
            if (index === 0) {
                text += string.slice(0, 1)
                string = string.slice(1)

            } else {
                break
            }
        } while (string.length);
        //处理<div>{aaa}</div>,<div>xxx{aaa}xxx</div>,<div>xxx</div>{aaa}sss的情况
        const index = string.indexOf('<') //判定它后面是否存在标签
        const bindex = string.indexOf('{') //判定它后面是否存在jsx
        const aindex = string.indexOf('}')

        let hasJSX = (bindex < aindex) && (index === -1 || bindex < index)
        if (hasJSX) {
            if (bindex !== 0) { // 收集jsx之前的文本节点
                text += string.slice(0, bindex)
                string = string.slice(bindex)
            }
            addText(lastNode, text, addNode)
            string = string.slice(1) //去掉前面{
            var arr = parseCode(string)
            addNode(makeJSX(arr[1]))
            lastNode = false
            string = string.slice(arr[0].length + 1) //去掉后面的}
        } else {
            if (index === -1) {
                text = string
                string = ''
            } else {
                text += string.slice(0, index)
                string = string.slice(index)
            }
            addText(lastNode, text, addNode)
        }

    } while (string.length);
    return ret
}


function addText(lastNode, text, addNode) {
    if (/\S/.test(text)) {
        if (lastNode && lastNode.type === '#text') {
            lastNode.text += text
        } else {
            lastNode = {
                type: '#text',
                nodeValue: text
            }
            addNode(lastNode)
        }
    }
}

//它用于解析{}中的内容，如果遇到不匹配的}则返回, 根据标签切割里面的内容 
function parseCode(string) { // <div id={ function(){<div/>} }>
    var word = '', //用于匹配前面的单词
        braceIndex = 1,
        codeIndex = 0,
        nodes = [],
        quote,
        escape = false,
        state = 'code'
    for (var i = 0, n = string.length; i < n; i++) {
        var c = string.charAt(i),
            next = string.charAt(i + 1)
        switch (state) {
            case 'code':
                if (c === '"' || c === "'") {
                    state = 'string'
                    quote = c
                } else if (c === '{') {
                    braceIndex++
                } else if (c === '}') {
                    braceIndex--
                    if (braceIndex === 0) {
                        collectJSX(string, codeIndex, i, nodes)
                        return [string.slice(0, i), nodes]
                    }
                } else if (c === '<') {
                    var word = '',
                        empty = true ,
                        index = i - 1
                    do {
                        c = string.charAt(index)
                        if (empty && rsp.test(c)) {
                            continue
                        }
                        if (rsp.test(c)) {
                            break
                        }
                        empty = false
                        word = c + word
                        if (word.length > 7) { //性能优化
                            break
                        }
                    } while (--index >= 0);
                    var chunkString = string.slice(i)
                    if (word === '' || /(=>|return|\{|\(|\[|\,)$/.test(word) && /\<\w/.test(chunkString)) {
                        collectJSX(string, codeIndex, i, nodes)
                        var chunk = lexer(chunkString, true)
                        nodes.push(chunk[1])
                        i += (chunk[0].length - 1) //因为已经包含了<, 需要减1
                        codeIndex = i + 1
                    }

                }
                break
            case 'string':
                if (c == '\\' && (next === '"' || next === "'")) {
                    escape = !escape
                } else if (c === quote && !escape) {
                    state = 'code'
                }
                break
        }

    }
}

function collectJSX(string, codeIndex, i, nodes) {
    var nodeValue = string.slice(codeIndex, i)
    if (/\S/.test(nodeValue)) { //将{前面的东西放进去
        nodes.push({
            type: '#jsx',
            nodeValue: nodeValue
        })
    }
}

var rtbody = /^(tbody|thead|tfoot)$/

function insertTbody(nodes) {
    var tbody = false
    for (var i = 0, n = nodes.length; i < n; i++) {
        var node = nodes[i]
        if (rtbody.test(node.nodeName)) {
            tbody = false
            continue
        }

        if (node.nodeName === 'tr') {
            if (tbody) {
                nodes.splice(i, 1)
                tbody.children.push(node)
                n--
                i--
            } else {
                tbody = {
                    nodeName: 'tbody',
                    props: {},
                    children: [node]
                }
                nodes.splice(i, 1, tbody)
            }
        } else {
            if (tbody) {
                nodes.splice(i, 1)
                tbody.children.push(node)
                n--
                i--
            }
        }
    }
}


function getCloseTag(string) {
    if (string.indexOf("</") === 0) {
        var match = string.match(/\<\/(\w+)>/)
        if (match) {
            var tag = match[1]
            string = string.slice(3 + tag.length)
            return [match[0], {
                type: tag
            }]
        }
    }
    return null
}

function getOpenTag(string) {
    if (string.indexOf("<") === 0) {
        var i = string.indexOf('<!--') //处理注释节点
        if (i === 0) {
            var l = string.indexOf('-->')
            if (l === -1) {
                thow('注释节点没有闭合 ' + string.slice(0, 100))
            }
            var node = {
                type: '#comment',
                nodeValue: string.slice(4, l)
            }

            return [string.slice(0, l + 3), node]
        }
        var match = string.match(/\<(\w[^\s\/\>]*)/) //处理元素节点
        if (match) {
            var leftContent = match[0],
                tag = match[1]
            var node = {
                type: tag,
                props: {},
                children: []
            }

            string = string.replace(leftContent, '') //去掉标签名(rightContent)
            var arr = getAttrs(string) //处理属性
            if (arr) {
                node.props = arr[1]
                string = string.replace(arr[0], '')
                leftContent += arr[0]
            }

            if (string[0] === '>') { //处理开标签的边界符
                leftContent += '>'
                string = string.slice(1)
                if (voidTag[node.type]) {
                    node.isVoidTag = true
                }
            } else if (string.slice(0, 2) === '/>') { //处理开标签的边界符
                leftContent += '/>'
                string = string.slice(2)
                node.isVoidTag = true
            } 

            if (!node.isVoidTag && specalTag[tag]) { //如果是script, style, xmp等元素
                var closeTag = '</' + tag + '>'
                var j = string.indexOf(closeTag)
                var nodeValue = string.slice(0, j)
                leftContent += nodeValue + closeTag
                node.children.push({
                    type: '#text',
                    nodeValue: nodeValue
                })
            }

            return [leftContent, node]
        }
    }
}

function getText(node) {
    var ret = ''
    node.children.forEach(function(el) {
        if (el.type === '#text') {
            ret += el.nodeValue
        } else if (el.children && !hiddenTag[el.type]) {
            ret += getText(el)
        }
    })
    return ret
}

function getAttrs(string) {
    var state = 'AttrNameOrJSX',
        attrName = '',
        attrValue = '',
        quote,
        escape,
        props = {}

    for (var i = 0, n = string.length; i < n; i++) {
        var c = string[i]
        switch (state) {
            case 'AttrNameOrJSX':
                if (c === '/' || c === '>') {
                    return [string.slice(0, i), props]
                }
                if (rsp.test(c)) {
                    if (attrName) {
                        state = 'AttrEqual'
                    }
                } else if (c === '=') {
                    if (!attrName) {
                        throw '必须指定属性名'
                    }
                    state = 'AttrQuoteOrJSX'
                } else if (c === '{') {
                    state = 'SpreadJSX'
                } else {
                    attrName += c
                }
                break
            case 'AttrEqual':
                if (c === '=') {
                    state = 'AttrQuoteOrJSX'
                }
                break
            case 'AttrQuoteOrJSX':
                if (c === '"' || c === "'") {
                    quote = c
                    state = 'AttrValue'
                    escape = false
                } else if (c === '{') {
                    state = 'JSX'
                }
                break
            case 'AttrValue':
                if (c === '\\') {
                    escape = !escape
                }
                if (c !== quote) {
                    attrValue += c
                } else if (c === quote && !escape) {
                    props[attrName] = attrValue
                    attrName = attrValue = ''
                    state = 'AttrNameOrJSX'
                }
                break
            case 'SpreadJSX':
                i += 3
            case 'JSX':

                var arr = parseCode(string.slice(i))
                i += arr[0].length

                props[state === 'SpreadJSX' ? 'spreadAttribute' : attrName] = makeJSX(arr[1])
                attrName = attrValue = ''
                state = 'AttrNameOrJSX'
                break
        }
    }
    throw '必须关闭标签'
}

function makeJSX(JSXNode)
{
    return JSXNode.length === 1 && JSXNode[0].type === '#jsx' ? JSXNode[0] : { type: '#jsx', nodeValue: JSXNode }
}

/* harmony default export */ const jsx_Parser = (Parser);
;// CONCATENATED MODULE: ./src/js/dom/jsx/evaluate.js



const R_COMPONENT = /^(this|[A-Z])/;
const CACHE_FNS   = {};
const CACHE_STR   = {};

window.__scope = {};

__scope.createElement = createElement;

function evaluate(str, obj, config)
{
    var jsx = new innerClass(str, config);

    var output = jsx.init();
    
    if (!obj)
    {
        obj = {};
    }
    
    if (typeof __scope === 'function')
    {
        obj.__scope = __scope;
    }
    
    var args = 'var args0 = arguments[0];'
    
    for (var i in obj)
    {
        if (i !== 'this')
        {
            args += 'var ' + i + ' = args0["' + i + '"];';
        }
    }

    args += 'return ' + output;
    try
    {
        var fn
        if (CACHE_FNS[args])
        {
            fn = CACHE_FNS[args]
        }
        else
        {
            fn = CACHE_FNS[args] = Function(args)
        }
        
        var a = fn.call(obj.this, obj)
        
        return a;
    }
    catch (e)
    {
        console.log(fn);
        console.log(CACHE_FNS);
        console.log(e)
    }
}

function innerClass(str, config)
{
    config      = config || {};
    config.ns   = '__scope';
    this.input  = str;
    this.ns     = config.ns
    this.type   = config.type
}

innerClass.prototype =
{
    init: function()
    {
        if (typeof jsx_Parser === 'function')
        {
            var useCache = this.input.length < 720
            if (useCache && CACHE_STR[this.input])
            {
                return CACHE_STR[this.input]
            }
            var array = (new jsx_Parser(this.input)).parse();

            var evalString = this.genChildren([array])
            if (useCache)
            {
                return CACHE_STR[this.input] = evalString
            }
            return evalString
        }
        else
        {
            throw 'need Parser https://github.com/RubyLouvre/jsx-parser'
        }
    },
    genTag: function(el)
    {
        var children = this.genChildren(el.children, el);
        var ns       = this.ns;
        var type     = R_COMPONENT.test(el.type) ? el.type : JSON.stringify(el.type);
        
        return ns + '.createElement(' + type +
            ',' + this.genProps(el.props, el) +
            ',' + children + ')'
    },
    genProps: function(props, el)
    {
        if (!props && !el.spreadAttribute)
        {
            return 'null';
        }

        var ret = '{';

        for (var i in props)
        {
            ret += JSON.stringify(i) + ':' + this.genPropValue(props[i]) + ',\n';
        }

        ret = ret.replace(/\,\n$/, '') + '}';
        
        if (el.spreadAttribute)
        {
            return 'Object.assign({},' + el.spreadAttribute + ',' + ret + ')';
        }

        return ret;
    },
    genPropValue: function(val)
    {
        if (typeof val === 'string')
        {
            return JSON.stringify(val)
        }
        if (val)
        {
            if (Array.isArray(val.nodeValue))
            {
                return this.genChildren(val.nodeValue)
            }
            if (val)
            {
                return val.nodeValue
            }
        }
    },
    genChildren: function(children, obj, join)
    {
        if (obj)
        {

            if (obj.isVoidTag || !obj.children.length)
            {
                return 'null'
            }
        }

        var ret = [];
        
        for (var i = 0, el; el = children[i++];)
        {
            if (el.type === '#jsx')
            {
                if (Array.isArray(el.nodeValue))
                {
                    ret[ret.length] = this.genChildren(el.nodeValue, null, ' ')
                }
                else
                {
                    ret[ret.length] = el.nodeValue
                }
            }
            else if (el.type === '#text')
            {
                ret[ret.length] = JSON.stringify(el.nodeValue)
            }
            else if (el)
            {
                ret[ret.length] = this.genTag(el)
            }
        }

        return ret.join(join || ',')
    }
};

;// CONCATENATED MODULE: ./src/js/dom/jsx/index.js


function jsx_parseJSX(jsx, obj, config)
{
	return evaluate(jsx, obj, config);
}
;// CONCATENATED MODULE: ./src/js/dom/vdom/actions.js


const ACTION_MAP =
{
	replaceNode: commit_replaceNode,
	appendChild: appendChild,
	removeChild: removeChild,
	insertAtIndex: insertAtIndex,
	moveToIndex: moveToIndex,
	replaceText: replaceText,
	setAttribute: setAttribute,
	removeAttribute: removeAttribute
};

function action(name, args)
{ 	
	let callback = ACTION_MAP[name];

	return {
		callback,
		args
	};
}
;// CONCATENATED MODULE: ./src/js/dom/vdom/patch.js





/**
 * Patch left to right
 * 
*/
function patch(prevNode, nextNode, actions)
{       
    // Same nothing to do
    if (prevNode === nextNode)
    {
        // nothing to do
    }
    // Replace empty -> empty, empty -> something (excludes thunks which need to be rendered)
    else if (((!isEmpty(prevNode) && isEmpty(nextNode) || isEmpty(prevNode) && !isEmpty(nextNode))) && nextNode.type !== 'thunk')
    {
        replaceNode(prevNode, nextNode, actions);
    }
    else if (prevNode.type !== nextNode.type)
    {
        replaceNode(prevNode, nextNode, actions);
    }
    else if (isNative(nextNode))
    {
        patchNative(prevNode, nextNode, actions);
    }
    else if (isText(nextNode))
    {
        patchText(prevNode, nextNode, actions);
    }
    else if (isThunk(nextNode))
    {
        patchThunk(prevNode, nextNode, actions);
    }
    else if (isFragment(nextNode))
    {
        patchFragment(prevNode, nextNode, actions);
    }
    else if (isEmpty(nextNode))
    {
        // nothing to do
    }
}

function patchText(left, right, actions)
{ 
    if (right.nodeValue !== left.nodeValue)
    {
        let text = right.nodeValue.slice();

        actions.push(action('replaceText', [left, text]));
    }
}

// Replacing one node with another
function replaceNode(left, right, actions)
{        
    if (isThunk(right))
    {
        if (isThunkInstantiated(right))
        {
            throw new Error('Thunk should not be instantiated.');
        }
        else
        {
            thunkInstantiate(right);
        }
    }

    actions.push(action('replaceNode', [left, right]));
}

function patchNative(left, right, actions)
{
    if (left.tagName !== right.tagName)
    {
        actions.push(action('replaceNode', [left, right]));
    }
    else
    {
        diffAttributes(left, right, actions);

        patchChildren(left, right, actions);
    }
}

function patchThunkProps(vnode, newProps)
{    
    let component = nodeComponent(vnode);

    component.__internals.prevProps = utils.cloneDeep(vnode.props);

    component.props = newProps;

    vnode.props = newProps;
}

function diffThunk(left, right, actions)
{    
    let component  = nodeComponent(left);
    let leftChild  = left.children[0];
    let rightchild = thunkRender(component);
    right.children = [rightchild];

    patchChildren(left, right, actions);
}

function patchThunk(left, right, actions)
{        
    // Same component 
    if (isSameThunk(left, right))
    {        
        patchThunkProps(left, right.props);

        diffThunk(left, right, actions);
    }
    // Different components
    else
    {
        thunkInstantiate(right);

        actions.push(action('replaceNode', [left, right]));
    }
}

function patchFragment(prevNode, nextNode, parentDOMElement)
{
    
}

function groupByKey(children)
{
    let ret = {};

    utils.foreach(children, function(i, child)
    {
        let { key } = child;

        key = !key ? ('|' + i) : key;

        ret[key] =
        {
            index: i,
            child,
        };
    });

    return ret;
}

/**
 * Less expensive patch before diff if possible
 * 
*/
function patchChildren(left, right, actions)
{
    let lChildren = left.children;
    let rChildren = right.children;

    // Quick check
    if (noChildren(left) && noChildren(right))
    {
        return;
    }

    // We're only adding new children
    if (noChildren(left))
    {
        // Clear the children now
        left.children = [];

        // Only need to add a single child
        if (singleChild(right))
        {
            actions.push(action('appendChild', [left, rChildren[0]]));
        }

        // We're adding multiple new children
        else if (!noChildren(right))
        {
            utils.foreach(rChildren, function(i, child)
            {
                actions.push(action('appendChild', [left, child]));
            });
        }
    }
    // There's only a single child in previous tree
    else if (singleChild(left))
    {        
        // Both have a single node
        if (singleChild(right))
        {                    
            // left and right could be the same / different type, so we need to patch them
            patch(lChildren[0], rChildren[0], actions);
        }
        // We're only removing the left node, nothing to insert
        else if (noChildren(right))
        {
            // Replace empty with empty
            actions.push(action('replaceNode', [lChildren[0], rChildren[0]]));
        }
        // There's a single child getting replaced with multiple
        else
        {
            // Keys and positions haven't changed
            if (lChildren[0].key === rChildren[0].key) 
            {
                patch(lChildren[0], rChildren[0], actions);

                utils.foreach(rChildren, function(i, child)
                {
                    if (i > 0)
                    {
                        actions.push(action('appendChild', [left, child]));
                    }
                });
            }
            else
            {
                patchSingleToMultiChildren(left, right, lChildren[0], rChildren, actions);
            }
        }
    }
    // Previous tree has multiple children
    else
    {
        // Removing all children except one
        if (singleChild(right))
        {
            let matchedKey = false;

            utils.foreach(lChildren, function(i, lChild)
            {
                if (lChild.key === rChildren[0].key)
                {
                    patch(lChild, rChildren[0], actions);

                    matchedKey = true;
                }
                else
                {
                    actions.push(action('removeChild', [left, lChild]));
                }
            });

            if (!matchedKey)
            {
                actions.push(action('appendChild', [left, rChildren[0]]));
            }
        }
        // We're only removing children
        else if (noChildren(right))
        {
            // When there are no child nodes in the new children
            utils.foreach(left.children, function(i, child)
            {
                actions.push(action('removeChild', [left, child]));
            });

            // Append empty child
            actions.push(action('appendChild', [left, right.children[0]]));

        }
        // Both have multiple children, patch the difference
        else
        {
            diffChildren(left, right, actions);
        }
    }
}

function patchSingleToMultiChildren(left, right, lChild, rChildren, actions)
{        
    // We need to compare keys and check if one
    let lKey      = lChild.key;
    let rChild    = null;
    let newIndex  = 0;

    // Append remaining children
    utils.foreach(rChildren, function(i, child)
    {
        // If a key was matched but the child has moved index we need to move
        // and patch after appending all the new children
        if (child.key === lKey)
        {
            // If the child has moved index, we should move and patch it after
            if (i !== 0)
            {
                rChild = child;
                newIndex  = i;
            }
            // Otherwise we just patch it now
            else
            {
                patch(lChild, child, actions);
            }
        }
        else
        {
            actions.push(action('appendChild', [left, child]));
        }
    });

    // The old key doesn't exist
    if (rChild)
    {
        actions.push(action('moveToIndex', [left, lChild, newIndex]));

        patch(lChild, rChild, actions);
    }
}

function diffChildren(left, right, actions)
{
    let lGroup = groupByKey(left.children);
    let rGroup = groupByKey(right.children);
    let actionsStartIndex = actions.length > 0 ? actions.length : 0;
    let subActions = [];

    // Note we should still patch indivdual children etc.. but check keys

    // Special case if keys are exactly the same we can just patch each child
    let lKeys = Object.keys(lGroup).sort();
    let rKeys = Object.keys(rGroup).sort();

    if (utils.is_equal(lKeys, rKeys))
    {
        utils.foreach(right.children, function(i, rChild)
        {
            patch(left.children[i], rChild, actions);
        });

        return;
    }

    let inserted = 0;

    // Loop right children
    // Note insertAtIndex & removeChild to be executed before moveToIndex
    // otherwise moveToIndex will be incorrect

    // Also when moving multiple indexes, if a move has moves that run after it
    // that are being moved from before it to after it, that index will be incorrect
    // as the prior nodes have not been moved yet
    utils.foreach(rGroup, function(_key, entry)
    {
        let rIndex = entry.index;
        let rChild = entry.child;
        let lEntry = lGroup[_key];
        
        // New node either by key or > index
        if (utils.is_undefined(lEntry))
        {
            let _insert = action('insertAtIndex', [left, rChild, rIndex]);

            if (!inserted)
            {
                subActions.unshift(_insert);
            }
            else
            {
                subActions.splice(inserted, 0, _insert);
            }
            
            inserted++;
        }
        // Same key, check index
        else
        {
            delete lGroup[_key];

            let lChild = lEntry.child;

            // Different indexes
            // move then patch
            if (lEntry.index !== rIndex)
            {    
                subActions.push(action('moveToIndex', [left, lChild, rIndex]));

                patch(lChild, rChild, actions);
            }
            // Unmoved / patch
            else
            {
                patch(lChild, rChild, actions);
            }
        }
    });

    // We need to remove children last so moving to index works
    if (!utils.is_empty(lGroup))
    {
        utils.foreach(lGroup, function(i, entry)
        {
            subActions.unshift(action('removeChild', [left, entry.child]));
        });
    }

    if (!utils.is_empty(subActions))
    {
        utils.foreach(subActions, function(i, action)
        {
            actions.splice(actionsStartIndex, 0, action);

            actionsStartIndex++;
        });
    }
}

function diffAttributes(left, right, actions)
{
    let pAttrs = left.attributes;
    let nAttrs = right.attributes;

    // No changes
    if (utils.is_empty(pAttrs) && utils.is_empty(nAttrs))
    {
        return;
    }
    
    utils.foreach(nAttrs, function(prop, value)
    {
        if (!utils.is_equal(value, pAttrs[prop]))
        {
            actions.push(action('setAttribute', [left, prop, value, pAttrs[prop]]));
        }
    });

    utils.foreach(pAttrs, function(prop, value)
    {
        if (!(prop in nAttrs))
        {
            actions.push(action('removeAttribute', [left, prop, pAttrs[prop]]));
        }
    });

    // Patch in new attributes
    nodeAttributes(left, nAttrs);
}

;// CONCATENATED MODULE: ./src/js/dom/vdom/thunk.js






function thunkInstantiate(vnode)
{
    let component = nodeComponent(vnode);

    if (!component)
    {
        let { fn, props } = vnode;

        props = utils.cloneDeep(props);

        component = utils.is_class(fn) ? new fn(props) : fn(props);
    }

    component.props.children = [jsxFactory(component)];

    return component;
}

function thunkUpdate(vnode)
{
    let component = vnode.__internals._component;
    let left      = vnode.children[0];
    let right     = jsxFactory(component);
    let actions   = tree(left, right);

    if (!utils.is_empty(actions.current))
    {
        commit(actions.current);
    }
}

function thunkRender(component)
{
    return jsxFactory(component);
}

function tree(left, right)
{ 
    let actions = 
    {
        current : []
    };

    patch(left, right, actions.current);

    return actions;
}

function jsxFactory(component)
{    
    const jsx = component.render();

    if (jsx.trim() === '')
    {
        return createElement();
    }

    const context = thunk_renderContext(component);

    const result = jsx_parseJSX(jsx, {...context, this: component });

    if (utils.is_array(result))
    {
        throw new Error('SyntaxError: Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>?');
    }

    return result;
}

function thunk_renderContext(component)
{
    const exclude = ['constructor', 'render'];
    const funcs   = Object.getOwnPropertyNames(Object.getPrototypeOf(component));
    const props   = Object.keys(component);
    const keys    = [...funcs, ...props];
    let   ret     = {};

    utils.foreach(keys, function(i, key)
    {
        if (!exclude.includes(key))
        {
            ret[key] = component[key];
        }
    });

    return ret;
}

;// CONCATENATED MODULE: ./src/js/dom/vdom/index.js



;// CONCATENATED MODULE: ./src/js/dom/dom/events.js


const _events = {};

/**
 * Add an event listener
 *
 * @access public
 * @param  node    element    The target DOM node
 * @param  string  eventName  Event type
 * @param  closure handler    Callback event
 * @param  bool    useCapture Use capture (optional) (defaul false)
 */
function addEventListener(element, eventName, handler, useCapture)
{
    // Boolean use capture defaults to false
    useCapture = typeof useCapture === 'undefined' ? false : Boolean(useCapture);

    // Class event storage
    var events = _events;

    // Make sure events are set
    if (!events)
    {
        _events = events = {};
    }

    // Make sure an array for the event type exists
    if (!events[eventName])
    {
        events[eventName] = [];
    }

    // Arrays
    if (Array.isArray(element))
    {
        for (var i = 0; i < element.length; i++)
        {
            addEventListener(element[i], eventName, handler, useCapture);
        }
    }
    else
    {
        // Push the details to the events object
        events[eventName].push(
        {
            element: element,
            handler: handler,
            useCapture: useCapture,
        });

        _addListener(element, eventName, handler, useCapture);
    }
}

/**
 * Removes event listeners on a DOM node
 *
 * If no event name is given, all attached event listeners are removed.
 * If no callback is given, all callbacks for the event type will be removed.
 * This function can still remove "annonymous" functions that are given a name as they are declared.
 * 
 * @access public
 * @param  node    element    The target DOM node
 * @param  string  eventName  Event type
 * @param  closure handler    Callback event
 * @param  bool    useCapture Use capture (optional) (defaul false)
 */
function removeEventListener(element, eventName, handler, useCapture)
{
    if (Array.isArray(element))
    {
        for (var j = 0; j < element.length; j++)
        {
            removeEventListener(element[j], eventName, handler, useCapture);
        }
    }
    else
    {
        // If the eventName name was not provided - remove all event handlers on element
        if (!eventName)
        {
            return _removeElementListeners(element);
        }

        // If the callback was not provided - remove all events of the type on the element
        if (!handler)
        {
            return _removeElementTypeListeners(element, eventName);
        }

        // Default use capture
        useCapture = typeof useCapture === 'undefined' ? false : Boolean(useCapture);

        var eventObj = _events[eventName];

        if (typeof eventObj === 'undefined')
        {
            return;
        }

        // Loop stored events and match node, event name, handler, use capture
        for (var i = 0, len = eventObj.length; i < len; i++)
        {
            if (eventObj[i]['handler'] === handler && eventObj[i]['useCapture'] === useCapture && eventObj[i]['element'] === element)
            {
                _removeListener(element, eventName, handler, useCapture);

                _events[eventName].splice(i, 1);

                break;
            }
        }
    }
}

/**
 * Removes all event listeners registered by the library
 *
 * @access public
 */
function clearEventListeners()
{
    var events = _events;

    for (var eventName in events)
    {
        var eventObj = events[eventName];

        var i = eventObj.length;

        while (i--)
        {
            _removeListener(eventObj[i]['element'], eventName, eventObj[i]['handler'], eventObj[i]['useCapture']);

            _events[eventName].splice(i, 1);
        }
    }
}

/**
 * Removes all event listeners registered by the library on nodes
 * that are no longer part of the DOM tree
 *
 * @access public
 */
function collectGarbage()
{
    var events = _events;
    for (var eventName in events)
    {
        var eventObj = events[eventName];
        
        var i = eventObj.length;

        while (i--)
        {
            var el = eventObj[i]['element'];

            // the window, body, and document always exist so keep these listeners
            if (el == window || el == document || el == document.body)
            {
                continue;
            }
            
            if (!_.in_dom(el))
            {
                _removeListener(eventObj[i]['element'], eventName, eventObj[i]['handler'], eventObj[i]['useCapture']);
                
                _events[eventName].splice(i, 1);
            }
        }
    }
}

/**
 * Removes all registered event listners on an element
 *
 * @access private
 * @param  node    element Target node element
 */
function _removeElementListeners(element)
{
    var events = _events;

    for (var eventName in events)
    {
        var eventObj = events[eventName];

        var i = eventObj.length;

        while (i--)
        {
            if (eventObj[i]['element'] === element)
            {
                _removeListener(eventObj[i]['element'], eventName, eventObj[i]['handler'], eventObj[i]['useCapture']);
                
                _events[eventName].splice(i, 1);
            }
        }
    }
}

/**
 * Removes all registered event listners of a specific type on an element
 *
 * @access private
 * @param  node    element Target node element
 * @param  string  type    Event listener type
 */
function _removeElementTypeListeners(element, type)
{
    var eventObj = _events[type];

    var i = eventObj.length;

    while (i--)
    {
        if (eventObj[i]['element'] === element)
        {
            _removeListener(eventObj[i]['element'], type, eventObj[i]['handler'], eventObj[i]['useCapture']);
            
            _events[type].splice(i, 1);
        }
    }
}

/**
 * Adds a listener to the element
 *
 * @access private
 * @param  node    element    The target DOM node
 * @param  string  eventName  Event type
 * @param  closure handler    Callback event
 * @param  bool    useCapture Use capture (optional) (defaul false)
 */
function _addListener(el, eventName, handler, useCapture)
{
    if (el.addEventListener)
    {
        el.addEventListener(eventName, handler, useCapture);
    }
    else
    {
        el.attachEvent('on' + eventName, handler, useCapture);
    }
}

/**
 * Removes a listener from the element
 *
 * @access private
 * @param  node    element    The target DOM node
 * @param  string  eventName  Event type
 * @param  closure handler    Callback event
 * @param  bool    useCapture Use capture (optional) (defaul false)
 */
function _removeListener(el, eventName, handler, useCapture)
{
    if (el.removeEventListener)
    {
        el.removeEventListener(eventName, handler, useCapture);
    }
    else
    {
        el.detachEvent('on' + eventName, handler, useCapture);
    }
}

/* harmony default export */ const events = ({ addEventListener, removeEventListener, clearEventListeners, collectGarbage });
;// CONCATENATED MODULE: ./src/js/dom/dom/attributes.js



/**
 * List of browser prefixes
 *
 * @var array
 */
const CSS_PREFIXES =
[
    'webkit',
    'Moz',
    'ms',
    'O',
];

/**
 * CSS PREFIXABLE
 *
 * @var array
 */
const CSS_PREFIXABLE =
[
    // transitions
    'transition',
    'transition-delay',
    'transition-duration',
    'transition-property',
    'transition-timing-function',

    // trnasforms
    'transform',
    'transform-origin',
    'transform-style',
    'perspective',
    'perspective-origin',
    'backface-visibility',

    // misc
    'box-sizing',
    'calc',
    'flex',
];

function setDomAttribute(DOMElement, name, value, previousValue)
{    
    switch (name)
    {
        // Style
        case 'style':
            
            if (utils.is_empty(value))
            {
                // remove all styles completely
                DOMElement.removeAttribute('style');
            }
            else if (utils.is_string(value))
            {
                // Clear style and overwrite
                DOMElement.style = '';

                // Apply current styles
                utils.foreach(value.split(';'), function(i, rule)
                {
                    var style = rule.split(':');

                    if (style.length >= 2)
                    {
                        css(DOMElement, style.shift().trim(), style.join(':').trim());
                    }
                });
            }
            else if (utils.is_object(value))
            {
                utils.foreach(value, function(prop, value)
                {
                    css(DOMElement, prop, value);
                });
            }
            
            break;
        
        // Class
        case 'class':
        case 'className':
            DOMElement.className = value;
            break;

        // Events / attributes
        default:
            if (name[0] === 'o' && name[1] === 'n')
            {
                if (previousValue)
                {
                    removeEventListener(DOMElement, name.slice(2).toLowerCase(), previousValue);
                }
                if (value)
                {
                    addEventListener(DOMElement, name.slice(2).toLowerCase(), value);
                }
             }
            else
            {
                switch (name)
                {
                    case 'checked':
                    case 'disabled':
                    case 'selected':
                        DOMElement[name] = utils.bool(value);
                        break;
                    case 'innerHTML':
                    case 'nodeValue':
                    case 'value':
                        DOMElement[name] = value;
                        break;
                    default:
                        DOMElement.removeAttribute(name)
                        break;
                }
            }
        break;
    }
}

function removeDomAttribute(DOMElement, name, previousValue)
{
    switch (name)
    {
        // Class
        case 'class':
        case 'className':
            DOMElement.className = '';
            break;

        // Events / attributes
        default:
            if (name[0] === 'o' && name[1] === 'n')
            {
                if (previousValue)
                {       
                    removeEventListener(DOMElement, name.slice(2).toLowerCase(), previousValue);
                }
            }
            else
            {
                switch (name)
                {
                    case 'checked':
                    case 'disabled':
                    case 'selected':
                        DOMElement[name] = false
                        break
                    case 'innerHTML':
                    case 'nodeValue':
                    case 'value':
                        DOMElement[name] = ''
                      break
                    default:
                        DOMElement.removeAttribute(name)
                    break;
                }
            }
        break;
    }

}

/**
 * Set CSS value(s) on element
 *
 * @access public
 * @param  node   el     Target DOM node
 * @param  string|object Assoc array of property->value or string property
 * @example Helper.css(node, { display : 'none' });
 * @example Helper.css(node, 'display', 'none');
 */
function css(el, property, value)
{
    // If their is no value and property is an object
    if (utils.is_object(property))
    {
        utils.foreach(property, function(prop, val)
        {
            css(el, prop, val);
        });
    }
    else
    {
        // vendor prefix the property if need be and convert to camelCase
        var properties = _vendorPrefix(property);

        // Loop vendored (if added) and unvendored properties and apply
        utils.foreach(properties, function(i, prop)
        {
            el.style[prop] = value;
        });
    }
}

/**
 * Vendor prefix a css property and convert to camelCase
 *
 * @access private
 * @param  string property The CSS base property
 * @return array
 */
function _vendorPrefix(property)
{
    // Properties to return
    var props = [];

    // Convert to regular hyphenated property 
    property = _camelCaseToHyphen(property);

    // Is the property prefixable ?
    if (CSS_PREFIXABLE.includes(property))
    {
        var prefixes = CSS_PREFIXES;

        // Loop vendor prefixes
        for (var i = 0; i < prefixes.length; i++)
        {
            props.push(prefixes[i] + _ucfirst(_toCamelCase(property)));
        }
    }

    // Add non-prefixed property
    props.push(_toCamelCase(property));

    return props;
}

function _toCamelCase(str)
{
    return str.toLowerCase()
        .replace(/['"]/g, '')
        .replace(/\W+/g, ' ')
        .replace(/ (.)/g, function($1)
        {
            return $1.toUpperCase();
        })
        .replace(/ /g, '');
}

function _camelCaseToHyphen(str)
{
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1-$2$3').toLowerCase();
}

function _ucfirst(string)
{
    return (string + '').charAt(0).toUpperCase() + string.slice(1);
}

;// CONCATENATED MODULE: ./src/js/dom/dom/create.js





/**
 * Create a real DOM element from a virtual element, recursively looping down.
 * When it finds custom elements it will render them, cache them, and keep going,
 * so they are treated like any other native element.
 */

function createDomElement(vnode, parentVnode)
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

    nodeElem(vnode, DOMElement);

    return DOMElement;
}

function createHTMLElement(vnode)
{
    let { tagName, attributes, children } = vnode;

    let DOMElement = createNativeElement(tagName);

    utils.foreach(attributes, function(prop, value)
    {
        setDomAttribute(DOMElement, prop, value);
    });

    nodeElem(vnode, DOMElement);

    utils.foreach(children, function(i, child)
    {
        if (!utils.is_empty(child))
        {            
            let childDomElement = createDomElement(child, vnode);

            // Returns a fragment
            if (utils.is_array(childDomElement))
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
    if (utils.is_array(children))
    {
        utils.foreach(children, function(i, child)
        {
            mountFragment(DOMElement, child, index);
        });
    }

    if (utils.is_htmlElement(children))
    {
        DOMElement.appendChild(children);

        return;
    }
}

function createThunk(vnode, parentVnode)
{
    // Skip this it's already been rendered if it's coming from a patch
    if (isThunkInstantiated(vnode))
    {
        let DOMElement = createDomElement(vnode.children[0], vnode);

        nodeElem(vnode, DOMElement);

        return DOMElement;
    }

    let { fn, props } = vnode;

    let component = thunkInstantiate(vnode);

    let DOMElement = createDomElement(component.props.children[0], vnode);

    pointVnodeThunk(vnode, component, parentVnode);
    
    // returned a fragment or a component that returned a fragment
    if (!utils.is_htmlElement(DOMElement))
    {
        nodeElem(vnode, DOMElement);
    }

    return DOMElement;
}

function createFragment(vnode, parentVnode)
{    
    let ret = [];

    utils.foreach(vnode.children, function(i, node)
    {
        ret.push(createDomElement(node, parentVnode));
    });

    return ret;
}

;// CONCATENATED MODULE: ./src/js/dom/dom/commit.js






function commit(actions)
{
    console.log(actions);

    utils.foreach(actions, function(i, action)
    {
        let {callback, args } = action;
        
        callback.apply(null, args);
    });
}

function replaceText(vnode, text)
{
    vnode.nodeValue = text;

    nodeElem(vnode).nodeValue = text;
}

function commit_replaceNode(left, right)
{
    nodeWillUnmount(left);

    removeEvents(left);

    // todo fix path
    let DOMElement = createDomElement(right, nodePath(left));

    let lDOMElement = nodeElem(left);

    lDOMElement.parentNode.replaceChild(DOMElement, lDOMElement);

    patchVnodes(left, right);
}

function appendChild(parentVnode, vnode)
{
    // todo fix path
    let index = utils.size(parentVnode.children);
    let basePath = nodePath(parentVnode);

    let DOMElement = createDomElement(vnode, basePath + '.' + index);

    nodeElem(parentVnode).appendChild(DOMElement);

    parentVnode.children.push(vnode);
}

function removeChild(parentVnode, vnode)
{
    nodeWillUnmount(vnode);

    removeEvents(vnode);

    utils.foreach(parentVnode.children, function(i, child)
    {
        if (child === vnode)
        {            
            parentVnode.children.splice(i, 1);

            return false;
        }
    });

    nodeElem(parentVnode).removeChild(nodeElem(vnode));
}

function removeEvents(vnode)
{
    if (isThunk(vnode) || isFragment(vnode))
    {
        if (!noChildren(vnode))
        {
            utils.foreach(vnode.children, function(i, child)
            {
                removeEvents(child);
            });
        }
    }
    else if (isNative(vnode))
    {
        let DOMElement = nodeElem(vnode);

        if (DOMElement)
        {
            removeEventListener(DOMElement);
        }

        if (!noChildren(vnode))
        {
            utils.foreach(vnode.children, function(i, child)
            {
                removeEvents(child);
            });
        }
    }
}

function insertAtIndex(parentVnode, vnode, index)
{
    // Node vdom indexes and DOM indexes may be different because thunks
    // can render multiple children

    let path = nodePath(parentVnode) + '.' + index;

    let DOMElement = createDomElement(vnode, path);

    let parentDOMElement = nodeElem(parentVnode);

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

function moveToIndex(parentVnode, vnode, index)
{
    let DOMElement       = nodeElem(vnode);
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

function setAttribute(vnode, name, value, previousValue)
{
    setDomAttribute(nodeElem(vnode), name, value, previousValue);
}

function removeAttribute(vnode, name, previousValue)
{
    removeDomAttribute(nodeElem(vnode), name, previousValue)
}

;// CONCATENATED MODULE: ./src/js/dom/dom/index.js


;// CONCATENATED MODULE: ./src/js/dom/render/index.js




function render(component, parent)
{        
    let vnode = createElement(component);

    let DOMElement = createDomElement(vnode, parent);

    mount(DOMElement, parent);

    console.log(vnode);
}

function mount(DOMElement, parent)
{        
    // Edge case where root renders a fragment
    if (utils.is_array(DOMElement))
    {
        utils.foreach(DOMElement, function(i, childDomElement)
        {
            if (utils.is_array(childDomElement))
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

    if (utils.is_htmlElement(DOMElement))
    {
        parent.appendChild(DOMElement);
    }
}
;// CONCATENATED MODULE: ./src/js/dom/component/index.js



/**
 * Base component
 * 
 * static getDerivedStateFromProps()
 * componentDidMount()
 * componentWillUnmount()
 * componentWillReceiveProps(nextProps)
 * getSnapshotBeforeUpdate(prevProps, prevState)
 * shouldComponentUpdate(nextProps, nextState)
 * componentWillUpdate(changedProps, changedState)
 * componentDidUpdate(prevProps, prevState, snapshot)
 * componentDidCatch()
 * @class
 */
class Component
{
    /**
     * Context.
     *
     * @var {object}
     */
    context = {};

    /**
     * props.
     *
     * @var {object}
     */
    props = {};

    /**
     * Reference to DOM node.
     *
     * @var {object}
     */
    refs = {};

    /**
     * State obj
     *
     * @var {object}
     */
    state = {};

    /**
     * Default props.
     *
     * @var {object}
     */
    defaultProps = {};

    /**
     * Internal use
     *
     * @var {object}
     */
    __internals = 
    {
        vnode     : null,
        prevState : {},
        prevProps : {},
    };

    /**
     * Constructor
     *
     */
    constructor(props)
    {
        this.props = !utils.is_object(props) ? {} : props;
    }

    setState(key, value, callback)
    {
        if (!utils.is_object(this.state))
        {
            this.state = {};
        }

        let stateChanges = {};

        // setState({ 'foo.bar' : 'foo' })
        if (arguments.length === 1)
        {
            if (!utils.is_object(key))
            {
                throw new Error('StateError: State should be an object with [dot.notation] keys. e.g. [setState({"foo.bar" : "baz"})]');
            }

            stateChanges = key;
        }
        else
        {
            stateChanges[key] = value;
        }

        this.__internals.prevState = utils.cloneDeep(this.state);

        utils.foreach(stateChanges, function(key, value)
        {
            utils.array_set(key, value, this.state);
            
        }, this);

        if (!utils.is_equal(this.state, this.__internals.prevState))
        {
            thunkUpdate(this.__internals.vnode);
        }
    }

    getState(key)
    {
        return array_get(key, this.state);
    }

    jsx(jsx)
    {
        const context = renderContext(this);

        return parseJSX(jsx, {...context, this: this});
    }

    forceUpdate()
    {
        thunkUpdate(this.__internals.vnode);
    }
}

/**
 * Fragment component
 * 
 * @class
 */
class Fragment extends Component
{    
    constructor(props)
    {
        super(props);
    }
}

/* harmony default export */ const component = ((/* unused pure expression or super */ null && (Component)));
;// CONCATENATED MODULE: ./src/js/dom/index.js



;// CONCATENATED MODULE: ./src/js/index.js


(function()
{
    class Nest2 extends Component
    {
        constructor(props)
        {
            super(props);

            console.log('Constructing Nest2');
        }

        render()
        {
            return `
                <span>
                    Nest2
                </span>
            `;
        }
    }

    class Nest1 extends Component
    {
        Nest2 = Nest2;

        constructor(props)
        {
            super(props);

            console.log('Constructing Nest1');
        }

        render()
        {
            return `
                <div>
                    Nest 1
                    {this.props.testprop}
                </div>
            `;
        }
    }

    class Bar extends Component
    {
        constructor(props)
        {
            super(props);

            this.interpolate = 'interpolated from bar!';
            this.evaluate    = this.exampleMethod;
            this.nested      = 'Nested from Bar!';
            this.Nest1       = Nest1;

            console.log('Constructing Bar');
        }

        exampleMethod()
        {
            return 'Evaluated from bar!'
        }
        
        render()
        {
            console.log('rending Bar');

            return `
                <div>
                    Bar
                    <Nest1 testprop={this.props.testprop} />
                </div>
            `;
        }
    }

    class FragmentNest2 extends Component
    {
        Fragment = Fragment;

        render()
        {
            return `
                <Fragment>
                    <div>4. nested fragment2!</div>
                    <div>3. nested fragment2!</div>
                </Fragment>
            `;
        }
    }

    class FragmentNest1 extends Component
    {
        FragmentNest2 = FragmentNest2;
        
        render()
        {
            return `
                <FragmentNest2 />
            `;
        }
    }

    class Foo extends Component
    {
        constructor(props)
        {
            super(props);

            this.state = {counter : 1, foo: 'bar', bar: {foo: 'bar'}};

            this.interpolate = 'interpolated!';
            this.evaluate    = this.returnJsx;
            this.Bar         = Bar;
            this.numbers     = [1, 2, 3, 4, 5];
            this.nested      = 'Nested from Foo!';
            this.Nest1       = Nest1;
            this.Nest2       = Nest2;
            this.variable    = 'interpolated variable';
            this.FragmentNest1 = FragmentNest1;
            this.Fragment     = Fragment;
            this.foo = null;
            this.styles1      = {
                color: 'white',
                backgroundColor: 'red'
            };
            this.styles2 = 'color:white;backgroundColor:purple';
            this.styles3      = {
                color: 'black',
                backgroundColor: 'yellow',
                border: '1px solid black'
            };

            var _this = this;

            console.log('Constructing Foo')

            /*setInterval(function()
            {
                _this.tick();

            }, 1000);*/
        }

        tick()
        {
            if (this.state.counter === 2)
            {
                return;
            }

            console.log('STATE CHANGE');
            console.log('\n\n');

            this.setState('counter', this.state.counter + 1);
        }

        exampleMethod()
        {
            return 'Evaluated!'
        }

        returnJsx()
        {
            return this.jsx('<div><h1>Returned JSX! with <i>{variable}</i></h1></div>');
        }

        handler()
        {
            alert('clicked!');
        }

        render()
        {
            return `
                 <div>
                    1. One
                    <FragmentNest1 />
                    2. Two
                    <FragmentNest1 />
                </div>
            `;

            console.log('rending Foo');

           /* if (this.state.counter === 2)
            {
                return `
                    <ul>
                        
                    </ul>
                `
            }

            return `
                <ul>
                    <li>li 1</li>
                    <li>li 2</li>
                </ul>
            `;
*/

            if (this.state.counter === 2)
            {
                return `
                   <section>
                        <div checked="true" disabled={false}>1.div</div>
                        <Bar key="test" testprop={this.state.counter} otherprop="foobar" />
                        <i>foo</i>
                        <i>foo</i>
                        <i>foo</i>
                        <span key="span">4.span</span>
                        <div onClick={this.handler}>3. div</div>
                        <i>foo</i>
                        <i>foo</i>
                        <i>foo</i>
                        <section style={this.styles1}>section</section>
                    </section>
                `;

            }

         return `
            <section>
                <div onClick={this.handler} style={this.styles1}>1.div</div>
                <i>2.i</i>
                <div style={this.styles2}>3. div</div>
                <span key="span">4.span</span>
                <Bar key="test" testprop={this.state.counter} otherprop="foobar" />
            </section>
            `;
            
        }
    }

    const initialProps =
    {
        string: "foo", 
        number: 5,
        boolean: true
    };


    const TestFunc = (props) =>
    {
        console.log(this);

        let name = 'test';

        return `<div>hello world{this.name}</div>`;
    };

    render(Foo, document.getElementById('app'));


})();
/******/ })()
;