import evaluate from './evaluate';

export default function parseJSX(jsx, obj, config)
{
	return evaluate(jsx, obj, config);
}