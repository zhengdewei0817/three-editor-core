const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs').default;
const typescript = require('@rollup/plugin-typescript').default;
const { terser } = require('rollup-plugin-terser');
const { readFileSync } = require('fs');

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const commonConfig = {
  input: 'src/index.ts',
  external: ['three'],
  onwarn(warning, warn) {
    if (warning.code === 'EVAL' || warning.message.includes('eval')) {
      return;
    }
    warn(warning);
  },
};

module.exports = [
  // CommonJS build
  {
    ...commonConfig,
    output: {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        skipLibCheck: true,
        noEmitOnError: false,
        declaration: false
      }),
      terser(),
    ],
  },
  // ESM build
  {
    ...commonConfig,
    output: {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        skipLibCheck: true,
        noEmitOnError: false,
        declaration: false
      }),
      terser(),
    ],
  },
]; 