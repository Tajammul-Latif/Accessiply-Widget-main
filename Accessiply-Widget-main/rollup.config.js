import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-only';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/widget.js',
        format: 'iife',
        name: 'Widget',
    },
    plugins: [
        svelte({
            emitCss: false,  // CSS wird in der JS-Datei eingebettet
        }),
        css({ output: 'bundle.css' }), // CSS wird in eine separate Datei geschrieben
        resolve(),
        commonjs(),
    ]
};
