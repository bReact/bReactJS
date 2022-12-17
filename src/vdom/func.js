import { commit } from '../dom/index';
import { patch } from './patch';
import _ from '../utils/index';

export function funcRender(vnode)
{    
    let { fn, props } = vnode;

    let child = fn(props);

    vnode.children = [child];
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
