import { thunkUpdate } from '../vdom/index';
import _ from '../utils/index';

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
export class Component
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
        this.props = !_.is_object(props) ? {} : props;
    }

    setState(key, value, callback)
    {
        if (!_.is_object(this.state))
        {
            this.state = {};
        }

        let stateChanges = {};

        // setState({ 'foo.bar' : 'foo' })
        if (arguments.length === 1)
        {
            if (!_.is_object(key))
            {
                throw new Error('StateError: State should be an object with [dot.notation] keys. e.g. [setState({"foo.bar" : "baz"})]');
            }

            stateChanges = key;
        }
        else
        {
            stateChanges[key] = value;
        }

        this.__internals.prevState = _.cloneDeep(this.state);

        _.foreach(stateChanges, function(key, value)
        {
            _.array_set(key, value, this.state);
            
        }, this);

        if (!_.is_equal(this.state, this.__internals.prevState))
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
export class Fragment extends Component
{    
    constructor(props)
    {
        super(props);
    }
}

class HooksWrapper extends Component
{
    hookIndex;
    hooks = [];
    hookDeps = [];

    constructor(render, props)
    {
        super(props);

        this.__internals._fn = render;
    }

    render()
    {
        const prevContext = currentComponent;

        try
        {
            currentComponent = this;

            this.hookIndex = 0;

            return this.__internals._fn(this.props);

        }
        finally
        {
            currentComponent = prevContext;
        }
    }
}

/**
 * Functional component callback
 * 
 * @class
 */
export function componentFactory(fn)
{   
    const factory = function(props)
    {
        let component = new HooksWrapper(fn, props);

        return component;
    }

    return factory;
}

let currentComponent;

export function useState(initial)
{
    const i = currentComponent.hookIndex++;
    
    if (!currentComponent.hooks[i])
    {
        currentComponent.hooks[i] =
        {
            state: transformState(initial)
        };
    }
    
    const thisHookContext = currentComponent;
    
    return [
        currentComponent.hooks[i].state,
        
        useCallback(newState =>
        {
            thisHookContext.hooks[i].state = transformState(newState, thisHookContext.hooks[i].state);

            thisHookContext.setState();

        }, [])
    ];
}

function useCallback(cb, deps)
{
    return useMemo(() => cb, deps);
}

function useMemo(factory, deps)
{
    const i = currentComponent.hookIndex++;
    
    if ( !currentComponent.hooks[i] || !deps || !sameArray(deps, currentComponent.hookDeps[i]))
    {
        currentComponent.hooks[i] = factory();

        currentComponent.hookDeps[i] = deps;
    }
    
    return currentComponent.hooks[i];
}

function transformState(state, prevState)
{
    if (typeof state === "function")
    {
        return state(prevState);
    }

    return state;
}

function sameArray(arr1, arr2)
{
    if (arr1.length !== arr2.length)
    {
        return false;
    }

    for (let i = 0; i < arr1.length; ++i)
    {
        if (arr1[i] !== arr2[i])
        {
            return false;
        }
    }

    return true;
}

export default Component;