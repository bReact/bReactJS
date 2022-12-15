import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: './index.js',
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  output: {
    file: './dist/bundle.js',
    format: 'iife', // use browser globals
    sourceMap: true
  }
};