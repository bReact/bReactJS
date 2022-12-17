/** @type {number} */
let currentHook = 0;

let currentComponent;

let previousComponent;

function _render(vnode)
{
	if (oldBeforeRender) oldBeforeRender(vnode);

	currentComponent = vnode._component;
	currentIndex = 0;

	const hooks = currentComponent.__hooks;

	if (hooks)
	{
		if (previousComponent === currentComponent)
		{
			hooks._pendingEffects = [];
			currentComponent._renderCallbacks = [];
			
			hooks._list.forEach(hookItem =>
			{
				if (hookItem._nextValue)
				{
					hookItem._value = hookItem._nextValue;
				}
				
				hookItem._pendingValue = EMPTY;
				hookItem._nextValue = hookItem._pendingArgs = undefined;
			});
		}
		else
		{
			hooks._pendingEffects.forEach(invokeCleanup);
			hooks._pendingEffects.forEach(invokeEffect);
			hooks._pendingEffects = [];
		}
	}

	previousComponent = currentComponent;
};

function invokeOrReturn(arg, f)
{
	return typeof f == 'function' ? f(arg) : f;
}

/**
 * @param {import('./index').StateUpdater<any>} [initialState]
 */
export function useState(initialState)
{
	currentHook = 1;

	return [initialState, setState];
}

/**
 * @param {import('./index').Reducer<any, any>} reducer
 * @param {import('./index').StateUpdater<any>} initialState
 * @param {(initialState: any) => void} [init]
 * @returns {[ any, (state: any) => void ]}
 */
export function setState(reducer, initialState, init)
{
	
}
