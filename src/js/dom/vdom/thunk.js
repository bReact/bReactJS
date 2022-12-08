import { createElement, nodeComponent, isNative, isThunk, isFragment } from './element';
import parseJSX from '../jsx';
import { commit } from '../dom';
import { patch } from './patch';
import _ from '../utils';

export function thunkInstantiate(vnode)
{
    let component = nodeComponent(vnode);

    if (!component)
    {
        let { fn, props } = vnode;

        props = _.cloneDeep(props);

        component = _.is_class(fn) ? new fn(props) : fn(props);
    }

    component.props.children = [jsxFactory(component)];

    return component;
}

export function thunkUpdate(vnode)
{
    let component = vnode.__internals._component;
    let left      = vnode.children[0];
    let right     = jsxFactory(component);
    let actions   = tree(left, right);

    if (!_.is_empty(actions.current))
    {
        commit(actions.current);
    }
}

export function thunkRender(component)
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

    const context = renderContext(component);

    const result = parseJSX(jsx, {...context, this: component });

    if (_.is_array(result))
    {
        throw new Error('SyntaxError: Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>?');
    }

    return result;
}

function renderContext(component)
{
    const exclude = ['constructor', 'render'];
    const funcs   = Object.getOwnPropertyNames(Object.getPrototypeOf(component));
    const props   = Object.keys(component);
    const keys    = [...funcs, ...props];
    let   ret     = {};

    _.foreach(keys, function(i, key)
    {
        if (!exclude.includes(key))
        {
            ret[key] = component[key];
        }
    });

    return ret;
}
