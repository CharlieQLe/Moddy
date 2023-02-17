import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'

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
        input: 'node_modules/steam-acf2json/main.js',
        output: {
            file: 'src/vendor/acf-parser.js',
        },
        plugins: [nodeResolve(), commonjs()],
    },
];