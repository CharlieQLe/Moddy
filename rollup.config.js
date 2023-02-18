import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts';

/* Export like so:

export default [
    ...
    {
        input: 'path/to/module/js',
        output: {
            file: 'src/vendor/modulename.js,
        },
        plugins: [nodeResolve(), commonjs(), ...],
    },
    {
        input: 'path/to/module/d.ts',
        output: {
            file: 'src/vendor/modulename.d.js,
        },
        plugins: [dts()],
    },
    ...
]

*/

export default [
    {
        input: 'node_modules/@node-steam/vdf/lib/index.js',
        output: {
            file: 'src/vendor/vdf-parser.js',
        },
        plugins: [nodeResolve(), commonjs()],
    },
    {
        input: 'node_modules/@node-steam/vdf/lib/index.d.ts',
        output: {
            file: 'src/vendor/vdf-parser.d.ts',
        },
        plugins: [dts()],
    },
    {
        input: 'node_modules/steam-acf2json/main.js',
        output: {
            file: 'src/vendor/acf-parser.js',
        },
        plugins: [nodeResolve(), commonjs()],
    },
];