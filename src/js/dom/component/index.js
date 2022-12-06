import { updateThunk } from '../vdom/thunk';
import _ from '../utils';

const _Component = function(props, context)
{
    this.context = { current: null };

    this.props = !_.is_object(props) ? {} : props;

    this.__internals = {
        vnode : null,
        prevProps :
    };
    

    return this;
}

_Component.prototype = {};

_Component.prototype.setState = function(key, value)
{
    return this._validateForm();
};

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
     * Constructor
     *
     */
    constructor(props)
    {
        return new _Component(props, this.defaultProps);
    }

    setState(key, value)
    {
        let newState = {};

        // setState({ 'foo.bar' : 'foo' })
        if (arguments.length === 1)
        {
            if (!_.is_object(key))
            {
                throw new Error('State must be an object.');
            }

            newState = key;
        }
        else
        {
            newState[key] = value;
        }

        newState = _.dotify(newState);

        if (_.is_callable(this.componentWillUpdate))
        {
            //this.componentWillUpdate(this.props, newState);
        }

        _.foreach(newState, function(key, value)
        {
            _.array_set(key, value, this.state);
            
        }, this);

        updateThunk(this._vnode);
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
        update(this);
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

export default Component;