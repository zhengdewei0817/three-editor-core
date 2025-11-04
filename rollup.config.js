const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs').default;
const typescript = require('@rollup/plugin-typescript').default;
const terser = require('@rollup/plugin-terser').default;
const replace = require('@rollup/plugin-replace');
const path = require('path');
const { readFileSync } = require('fs');

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

function isThreeAddons(id) {
  return id === 'three';
}

function rewriteThreeAddonsPaths() {
  return {
    name: 'rewrite-three-addons-paths',
    resolveId(id, importer) {
      // 如果是 three/addons/* 路径，重写为绝对路径
      if (id.startsWith('three/addons/')) {
        const relativePath = id.replace('three/addons/', '');
        // 返回绝对路径指向 src/jsm/
        const absolutePath = path.resolve(__dirname, 'src/jsm', relativePath);
        return absolutePath;
      }
      return null;
    },
    renderChunk(code, chunk) {
      // 对于动态导入，保持原样，因为它们在运行时会被处理
      // 或者如果需要，也可以在这里替换
      return code;
    }
  };
}

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
      compact: false, 
      inlineDynamicImports: true,
    },
    plugins: [
      replace({
        preventAssignment: true,
        delimiters: ['\\b', '\\b'],
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env': JSON.stringify({}),
        'process.browser': 'true',
        // 只替换特定的 process 属性访问，而不是整个 process 对象
        'process.argv': '[]',
        'process.argv.length': '0',
        'process.argv[1]': 'undefined',
        'process.argv.slice(2)': '[]',
        'process.versions': '{}',
        'process.versions.node': 'undefined',
        "process.platform": "undefined",
        "process.stdout":"undefined",
        "process.stderr":"undefined",
        "process.stdin":"undefined",
        "process.exit":"undefined",
        "process.on":"undefined",
        "process.off":"undefined",
        "process.addListener":"undefined",
        "process.removeListener":"undefined",
        "process.removeAllListeners":"undefined",
        'typeof process': JSON.stringify('object'),
        // 不替换独立的 process，避免影响 this.process 等方法名
      }),
      rewriteThreeAddonsPaths(), 
      resolve({
        browser: true,
      }),
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
      replace({
        preventAssignment: true,
        delimiters: ['\\b', '\\b'],
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env': JSON.stringify({}),
        'process.browser': 'true',
        // 只替换特定的 process 属性访问，而不是整个 process 对象
        'process.argv': '[]',
        'process.argv.length': '0',
        'process.argv[1]': 'undefined',
        'process.argv.slice(2)': '[]',
        'process.versions': '{}',
        'process.versions.node': 'undefined',
        "process.platform": "undefined",
        "process.stdout":"undefined",
        "process.stderr":"undefined",
        "process.stdin":"undefined",
        "process.exit":"undefined",
        "process.on":"undefined",
        "process.off":"undefined",
        "process.addListener":"undefined",
        "process.removeListener":"undefined",
        "process.removeAllListeners":"undefined",
        'typeof process': JSON.stringify('object'),
        // 不替换独立的 process，避免影响 this.process 等方法名
      }),
      rewriteThreeAddonsPaths(), // 添加路径重写插件
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        skipLibCheck: true,
        noEmitOnError: false,
        declaration: false
      }),
      // terser(),
    ],
  },
]; 