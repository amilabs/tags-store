import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import analyze from 'rollup-plugin-analyzer'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const extensions = ['.js']

export default {
  input: './src/index.js',
  treeshake: true,
  strictDeprecations: true,
  plugins: [
    resolve({ extensions, browser: true, preferBuiltins: true }),
    commonjs({ exclude: 'src/**' }),
    babel({ extensions, exclude: 'node_modules/**' }),
    terser(),
    analyze({ limit: 5 }),
  ],
  output: [
    {
      file: pkg.module,
      format: 'cjs',
      sourcemap: false,
    }
  ],
}
