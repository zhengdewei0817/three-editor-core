# Three.js Editor Core

一个基于Three.js的3D编辑器核心包，提供丰富的3D编辑功能和工具。

## 安装

```bash
npm install three-editor-core
```

## 使用方法

```typescript
import { EditorCore } from 'three-editor-core';

// 创建编辑器实例
const editor = new EditorCore();
```

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 代码检查

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix

# 类型检查
npm run type-check
```

## 项目结构

```
src/
├── index.ts          # 主入口文件
├── core/             # 核心功能
├── utils/            # 工具函数
├── types/            # 类型定义
└── setupTests.ts     # 测试设置
```

## 许可证

MIT 