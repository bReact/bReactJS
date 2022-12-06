import { action } from './actions';
import {
    patchVnode,
    isMounted,
    isFragment,
    isThunk,
    isNative,
    isText,
    isEmpty,
    noChildren,
    singleChild,
    isSameThunk,
    isThunkInstantiated,
    isSameFragment,
    createPath,
    prevPath,
    thunkName,
    nodePath,
    nodeElem,
    nodeComponent,
    pointVnodeThunk,
    emptyChildren
} from './element';
import { instantiateThunk, rerenderThunk, unmount } from './thunk';
import _ from '../utils';

/**
 * We're patching right to left. Cheaper to retain left tree and update components
 * ass needed
 * 
 * If we retain the right tree we'll need to move more vnodes from left to right
 * as there's a higher chance of vnodes than thunks
 * 
*/
export function patch(prevNode, nextNode, actions)
{       
    // Same nothing to do
    if (prevNode === nextNode)
    {
        // nothing to do
    }
    // Replace empty -> empty, empty -> something (excludes thunks which need to be rendered)
    else if ((!isEmpty(prevNode) && isEmpty(nextNode) || isEmpty(prevNode) && !isEmpty(nextNode)) && prevNode.type !== 'thunk'  && nextNode.type !== 'thunk')
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
            instantiateThunk(right);
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

function patchThunk(left, right, actions)
{        
    // Same component 
    if (isSameThunk(left, right))
    {
        // Props need to be applied to the component here
        let component     = nodeComponent(left);
        let prevProps     = component.props;
        let newProps      = right.props;
        let leftChild     = left.children[0];
        component.props   = newProps;
        let rightchild    = rerenderThunk(component);

        patchChildren(leftChild, rightchild, actions);
    }
    // Different components
    else
    {
        instantiateThunk(right);

        actions.push(action('replaceNode', [left, right]));
    }
}

function patchFragment(prevNode, nextNode, parentDOMElement)
{
    
}

/**
 * Patch node children
 * 
*/
function patchChildren(left, right, actions)
{
    let lGroup = groupByKey(left.children);
    let rGroup = groupByKey(right.children);
    
    console.log(lGroup);
    console.log(rGroup);

    // We're only adding new children
    if (noChildren(left))
    {
        // Clear the children now
        left.children = [];

        // Only need to add a single child
        if (singleChild(right))
        {
            actions.push(action('appendChild', [left, right.children[0]]));
        }

        // We're adding multiple new children
        else if (!noChildren(right))
        {
            _.foreach(right.children, function(i, child)
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
            patch(left.children[0], right.children[0], actions);
        }
        // We're only removing the left node, nothing to insert
        else if (noChildren(right))
        {
            // Replace empty with empty
            actions.push(action('replaceNode', [left.children[0], right.children[0]]));
        }
        // There's a single child getting replaced with multiple
        else
        {
            // Patch the first child (it may be the same)
            patch(left.children[0], right.children[0], actions);

            // Append remaining children
            _.foreach(right.children, function(i, child)
            {
                if (i > 0)
                {
                    actions.push(action('appendChild', [left, child]));
                }
            });
        }
    }
    // Previous tree has multiple children
    else
    {
        // New children is single
        if (singleChild(right))
        {
            // Patch the first child (it may be the same)
            // This will trigger mount / unmount if needed
            patch(left.children[0], right.children[0], actions);

            // Unmount and remove remaining children
            _.foreach(left.children, function(i, child)
            {
                if (i > 0)
                {
                    actions.push(action('removeChild', [left, child]));
                }
            });
        }
        // We're only removing children
        else if (noChildren(right))
        {
            // When there are no child nodes in the new children
            _.foreach(left.children, function(i, child)
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

// If we're moving a thunk we need to make sure it's
// actually the same, otherwise we're mounting not moving
// Also we need to ensure it returns the same child type, otherwise

function moveChild(left, right, parentVnode, actions)
{

}

function groupByKey(children)
{
    let ret = {};

    _.foreach(children, function(i, child)
    {
        let { key } = child;

        ret[key] =
        {
            index: i,
            child,
        };
    });

    return ret;
}

function diffChildren(left, right, actions)
{
    let lGroup = groupByKey(left.children);
    let rGroup = groupByKey(right.children);
    let actionsStartIndex = actions.length > 0 ? actions.length : 0;

    // Loop right children
    _.foreach(rGroup, function(_key, entry)
    {
        let rIndex = entry.index;
        let rChild = entry.child;
        let lEntry = lGroup[_key];

        // New node either by key or > index
        if (_.is_undefined(lEntry))
        {
            actions.push(action('insertAtIndex', [left, rChild, rIndex]));
        }
        // Same key, check index
        else
        {
            delete lGroup[_key];

            let lChild = lEntry.child;

            // Moved
            if (lEntry.index !== rIndex)
            {
                // Different types
                if (lChild.type !== rChild.type)
                {
                    actions.push(action('moveToIndex', [left, lChild, rIndex, lChild.index]));

                    patch(lChild, rChild, actions);
                }
                // Same type, move and update
                else
                {
                    actions.push(action('moveToIndex', [left, lChild, rIndex, lChild.index]));

                    patch(lChild, rChild, actions);
                }
            }
            // Unmoved / patch
            else
            {
                patch(lEntry.child, rChild, actions);
            }
        }
    });

    // Not we need to remove old nodes first so insert at index works
    if (!_.is_empty(lGroup))
    {
        _.foreach(lGroup, function(_key, entry)
        {
            actions.splice(actionsStartIndex, 0, action('removeChild', [left, entry.child]));

            actionsStartIndex++;
        });
    }
}

function diffAttributes(left, right, actions)
{
    let pAttrs  = left.attributes;
    let nAttrs  = right.attributes;

    // No changes
    if (_.is_empty(pAttrs) && _.is_empty(nAttrs))
    {
        return;
    }
    
    _.foreach(nAttrs, function(prop, value)
    {
        if (!_.is_equal(value, pAttrs[prop]))
        {
            actions.push(action('setAttribute', [left, prop, value]));
        }
    });

    _.foreach(pAttrs, function(prop, value)
    {
        if (!(name in nAttrs))
        {
            actions.push(action('removeAttribute', [left, prop, value]));
        }
    });
}
