/** @type {number} */
let currentIndex;

/** @type {import('./internal').Component} */
let currentComponent;

/** @type {import('./internal').Component} */
let previousComponent;

/** @type {number} */
let currentHook = 0;

/** @type {Array<import('./internal').Component>} */
let afterPaintEffects = [];

let EMPTY = [];

let oldBeforeDiff = options._diff;
let oldBeforeRender = options._render;
let oldAfterDiff = options.diffed;
let oldCommit = options._commit;
let oldBeforeUnmount = options.unmount;

const RAF_TIMEOUT = 100;
let prevRaf;



/**
 * @param {import('./index').StateUpdater<any>} [initialState]
 */
export function useState(initialState)
{
	currentHook = 1;
	
	return useReducer(invokeOrReturn, initialState);
}

/**
 * @param {import('./index').Reducer<any, any>} reducer
 * @param {import('./index').StateUpdater<any>} initialState
 * @param {(initialState: any) => void} [init]
 * @returns {[ any, (state: any) => void ]}
 */
export function useReducer(reducer, initialState, init) {
	/** @type {import('./internal').ReducerHookState} */
	const hookState = getHookState(currentIndex++, 2);
	hookState._reducer = reducer;
	if (!hookState._component) {
		hookState._value = [
			!init ? invokeOrReturn(undefined, initialState) : init(initialState),

			action => {
				const currentValue = hookState._nextValue
					? hookState._nextValue[0]
					: hookState._value[0];
				const nextValue = hookState._reducer(currentValue, action);

				if (currentValue !== nextValue) {
					hookState._nextValue = [nextValue, hookState._value[1]];
					hookState._component.setState({});
				}
			}
		];

		hookState._component = currentComponent;

		if (!currentComponent._hasScuFromHooks) {
			currentComponent._hasScuFromHooks = true;
			const prevScu = currentComponent.shouldComponentUpdate;

			// This SCU has the purpose of bailing out after repeated updates
			// to stateful hooks.
			// we store the next value in _nextValue[0] and keep doing that for all
			// state setters, if we have next states and
			// all next states within a component end up being equal to their original state
			// we are safe to bail out for this specific component.
			currentComponent.shouldComponentUpdate = function(p, s, c) {
				if (!hookState._component.__hooks) return true;

				const stateHooks = hookState._component.__hooks._list.filter(
					x => x._component
				);
				const allHooksEmpty = stateHooks.every(x => !x._nextValue);
				// When we have no updated hooks in the component we invoke the previous SCU or
				// traverse the VDOM tree further.
				if (allHooksEmpty) {
					return prevScu ? prevScu.call(this, p, s, c) : true;
				}

				// We check whether we have components with a nextValue set that
				// have values that aren't equal to one another this pushes
				// us to update further down the tree
				let shouldUpdate = false;
				stateHooks.forEach(hookItem => {
					if (hookItem._nextValue) {
						const currentValue = hookItem._value[0];
						hookItem._value = hookItem._nextValue;
						hookItem._nextValue = undefined;
						if (currentValue !== hookItem._value[0]) shouldUpdate = true;
					}
				});

				return shouldUpdate || hookState._component.props !== p
					? prevScu
						? prevScu.call(this, p, s, c)
						: true
					: false;
			};
		}
	}

	return hookState._nextValue || hookState._value;
}