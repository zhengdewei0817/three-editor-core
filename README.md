# Three.js Editor Core

一个基于 Three.js 的强大 3D 编辑器核心库，提供完整的 3D 场景编辑、对象管理、历史记录、材质编辑等功能。

## ✨ 特性

- 🎯 **完整的 3D 编辑器核心功能**
- 🔄 **命令模式与撤销/重做系统**
- 🎮 **3D 场景播放器**
- 🎨 **材质和几何体管理**
- 📷 **多相机支持**
- 🎪 **变换控制器 (移动/旋转/缩放)**
- 💾 **场景序列化与加载**
- 🔌 **丰富的信号系统**
- 📱 **响应式视口**
- 🛠️ **可扩展的工具栏**

## 📦 安装

```bash
npm install @zhengdewei/three-editor-core
```

## 🚀 快速开始

### 基本用法

```typescript
import { Editor, Viewport, Toolbar, Player } from '@zhengdewei/three-editor-core';
import '@zhengdewei/three-editor-core/dist/src/css/main.css';

// 创建编辑器实例
const editor = new Editor();

// 创建视口
const viewport = new Viewport(editor);
document.body.appendChild(viewport.dom);

// 创建工具栏
const toolbar = new Toolbar(editor);
document.body.appendChild(toolbar.dom);

// 初始化渲染器
editor.init();
```

### 添加 3D 对象

```typescript
import * as THREE from 'three';
import { AddObjectCommand } from '@zhengdewei/three-editor-core';

// 创建一个立方体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

// 使用命令模式添加对象（支持撤销）
editor.execute(new AddObjectCommand(editor, cube));
```

### 场景播放

```typescript
// 创建播放器
const player = new Player();

// 加载场景数据
const sceneData = editor.toJSON();
player.load(sceneData);

// 开始播放
player.play();
```

## 🏗️ 核心架构

### 主要组件

#### Editor (编辑器核心)
编辑器的主要类，管理整个 3D 场景和编辑状态。

```typescript
class Editor {
  // 核心属性
  scene: THREE.Scene;          // 主场景
  camera: THREE.Camera;        // 当前相机
  sceneHelpers: THREE.Scene;   // 辅助对象场景
  
  // 管理器
  history: History;            // 历史记录管理
  selector: Selector;          // 对象选择器
  loader: Loader;             // 文件加载器
  config: Config;             // 配置管理
  
  // 资源管理
  geometries: Object;         // 几何体集合
  materials: Object;          // 材质集合
  textures: Object;           // 纹理集合
  scripts: Object;            // 脚本集合
}
```

#### 信号系统
基于观察者模式的事件系统，用于组件间通信：

```typescript
// 场景相关信号
editor.signals.sceneGraphChanged.add(() => {
  console.log('场景图发生变化');
});

// 对象选择信号
editor.signals.objectSelected.add((object) => {
  console.log('选中对象:', object);
});

// 材质变化信号
editor.signals.materialChanged.add((material) => {
  console.log('材质已更新:', material);
});
```

#### 命令模式
所有编辑操作都通过命令模式实现，支持撤销/重做：

```typescript
import { 
  AddObjectCommand,
  RemoveObjectCommand,
  SetPositionCommand,
  SetRotationCommand,
  SetScaleCommand 
} from '@zhengdewei/three-editor-core';

// 添加对象
editor.execute(new AddObjectCommand(editor, object));

// 设置位置
editor.execute(new SetPositionCommand(editor, object, new THREE.Vector3(1, 2, 3)));

// 撤销操作
editor.undo();

// 重做操作
editor.redo();
```

## 📚 API 文档

### Editor 类

#### 构造函数
```typescript
constructor()
```
创建一个新的编辑器实例。

#### 核心方法

##### 对象管理
```typescript
// 添加对象到场景
addObject(object: THREE.Object3D, parent?: THREE.Object3D, index?: number): void

// 移除对象
removeObject(object: THREE.Object3D): void

// 命名对象
nameObject(object: THREE.Object3D, name: string): void

// 根据 UUID 查找对象
objectByUuid(uuid: string): THREE.Object3D | undefined

// 根据 ID 查找对象
selectById(id: number): void
```

##### 选择与聚焦
```typescript
// 选择对象
select(object: THREE.Object3D | null): void

// 根据 UUID 选择
selectByUuid(uuid: string): void

// 取消选择
deselect(): void

// 聚焦到对象
focus(object: THREE.Object3D): void
```

##### 材质管理
```typescript
// 添加材质
addMaterial(material: THREE.Material): void

// 设置材质名称
setMaterialName(material: THREE.Material, name: string): void

// 获取对象材质
getObjectMaterial(object: THREE.Object3D, slot?: number): THREE.Material

// 设置对象材质
setObjectMaterial(object: THREE.Object3D, slot: number, material: THREE.Material): void
```

##### 场景管理
```typescript
// 设置场景
setScene(scene: THREE.Scene): void

// 清空场景
clear(): void

// 从JSON加载
fromJSON(json: any): Promise<void>

// 导出为JSON
toJSON(): Object
```

##### 历史记录
```typescript
// 执行命令
execute(command: Command, optionalName?: string): void

// 撤销
undo(): void

// 重做
redo(): void
```

### Viewport 类

视口组件，提供 3D 场景的渲染和交互功能。

```typescript
// 创建视口
const viewport = new Viewport(editor);

// 添加到DOM
document.body.appendChild(viewport.dom);
```

**功能特性：**
- WebGL 渲染
- 变换控制器 (TransformControls)
- 网格辅助线
- 视图助手
- 路径追踪渲染支持
- XR/VR 支持

### Toolbar 类

工具栏组件，提供变换工具的UI控制。

```typescript
const toolbar = new Toolbar(editor);
document.body.appendChild(toolbar.dom);
```

**工具包括：**
- 移动工具 (Translate)
- 旋转工具 (Rotate)  
- 缩放工具 (Scale)
- 本地/世界坐标切换

### Player 类

3D 场景播放器，用于预览和运行场景。

```typescript
const player = new Player();

// 加载场景
player.load(sceneData);

// 播放
player.play();

// 暂停
player.stop();

// 设置尺寸
player.setSize(width, height);
```

### History 类

历史记录管理器，实现撤销/重做功能。

```typescript
// 执行命令
history.execute(command, optionalName);

// 撤销
history.undo();

// 重做  
history.redo();

// 清空历史
history.clear();
```

### 命令系统

所有可用的命令类：

#### 对象操作命令
```typescript
import {
  AddObjectCommand,      // 添加对象
  RemoveObjectCommand,   // 移除对象
  MoveObjectCommand,     // 移动对象
} from '@zhengdewei/three-editor-core';
```

#### 变换命令
```typescript
import {
  SetPositionCommand,    // 设置位置
  SetRotationCommand,    // 设置旋转
  SetScaleCommand,       // 设置缩放
} from '@zhengdewei/three-editor-core';
```

#### 材质命令
```typescript
import {
  SetMaterialCommand,        // 设置材质
  SetMaterialColorCommand,   // 设置材质颜色
  SetMaterialValueCommand,   // 设置材质属性值
  SetMaterialMapCommand,     // 设置材质贴图
} from '@zhengdewei/three-editor-core';
```

#### 几何体命令
```typescript
import {
  SetGeometryCommand,        // 设置几何体
  SetGeometryValueCommand,   // 设置几何体属性
} from '@zhengdewei/three-editor-core';
```

#### 脚本命令
```typescript
import {
  AddScriptCommand,          // 添加脚本
  RemoveScriptCommand,       // 移除脚本
  SetScriptValueCommand,     // 设置脚本值
} from '@zhengdewei/three-editor-core';
```

## 🎨 样式

项目包含预设的CSS样式，需要单独引入：

```typescript
import '@zhengdewei/three-editor-core/dist/src/css/main.css';
```

或在HTML中引入：

```html
<link rel="stylesheet" href="node_modules/@zhengdewei/three-editor-core/dist/src/css/main.css">
```

## 🔧 配置选项

### Config 类

配置管理器，处理编辑器设置和用户偏好：

```typescript
// 获取配置
const language = editor.config.getKey('language');

// 设置配置
editor.config.setKey('project/renderer/shadows', true);

// 清空配置
editor.config.clear();
```

**默认配置项：**

```typescript
{
  'language': 'zh',                           // 界面语言
  'autosave': true,                          // 自动保存
  'project/renderer/antialias': true,        // 抗锯齿
  'project/renderer/shadows': true,          // 阴影
  'project/renderer/shadowType': 1,          // 阴影类型
  'project/renderer/toneMapping': 0,         // 色调映射
  'project/renderer/toneMappingExposure': 1, // 曝光度
  'settings/history': false,                 // 历史记录
  'settings/shortcuts/translate': 'w',       // 移动快捷键
  'settings/shortcuts/rotate': 'e',          // 旋转快捷键
  'settings/shortcuts/scale': 'r',           // 缩放快捷键
  'settings/shortcuts/undo': 'z',            // 撤销快捷键
  'settings/shortcuts/focus': 'f'            // 聚焦快捷键
}
```

## 🎯 使用示例

### 完整的编辑器应用

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Three.js Editor</title>
    <link rel="stylesheet" href="node_modules/@zhengdewei/three-editor-core/dist/src/css/main.css">
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
        }
        
        #toolbar {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 100;
        }
        
        #viewport {
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>
<body>
    <script type="module">
        import { Editor, Viewport, Toolbar } from '@zhengdewei/three-editor-core';
        import * as THREE from 'three';
        
        // 创建编辑器
        const editor = new Editor();
        
        // 创建视口
        const viewport = new Viewport(editor);
        document.body.appendChild(viewport.dom);
        
        // 创建工具栏
        const toolbar = new Toolbar(editor);
        document.body.appendChild(toolbar.dom);
        
        // 初始化
        editor.init();
        
        // 添加示例对象
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0.5, 0);
        
        editor.addObject(cube);
        editor.select(cube);
    </script>
</body>
</html>
```

### 自定义命令

```typescript
import { Command } from '@zhengdewei/three-editor-core';

class CustomCommand extends Command {
  constructor(editor, object, newColor) {
    super(editor);
    
    this.type = 'CustomCommand';
    this.name = '自定义颜色命令';
    
    this.object = object;
    this.oldColor = object.material.color.getHex();
    this.newColor = newColor;
  }
  
  execute() {
    this.object.material.color.setHex(this.newColor);
    this.editor.signals.objectChanged.dispatch(this.object);
  }
  
  undo() {
    this.object.material.color.setHex(this.oldColor);
    this.editor.signals.objectChanged.dispatch(this.object);
  }
}

// 使用自定义命令
const customCmd = new CustomCommand(editor, selectedObject, 0xff0000);
editor.execute(customCmd);
```

### 文件加载

编辑器支持多种 3D 文件格式：

```typescript
// 支持的格式
const supportedFormats = [
  '3dm', '3ds', '3mf', 'amf', 'dae', 'drc', 'fbx', 'gltf', 'glb',
  'js', 'json', 'kmz', 'ldr', 'md2', 'obj', 'pcd', 'ply', 'stl',
  'vtk', 'vtp', 'vtu', 'wrl', 'x3d'
];

// 通过拖拽加载文件
viewport.dom.addEventListener('drop', (event) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  editor.loader.loadFiles(files);
});
```

### 信号监听

```typescript
// 监听对象选择
editor.signals.objectSelected.add((object) => {
  if (object) {
    console.log('选中了对象:', object.name);
  } else {
    console.log('取消选择');
  }
});

// 监听场景变化
editor.signals.sceneGraphChanged.add(() => {
  console.log('场景结构发生变化');
  updateUI();
});

// 监听历史记录变化
editor.signals.historyChanged.add((command) => {
  console.log('执行了命令:', command.name);
  updateHistoryUI();
});
```

### 场景序列化

```typescript
// 导出场景
const sceneData = editor.toJSON();
localStorage.setItem('myScene', JSON.stringify(sceneData));

// 加载场景
const savedData = JSON.parse(localStorage.getItem('myScene'));
await editor.fromJSON(savedData);
```

## 🎮 播放器功能

Player 类提供场景播放功能，支持动画和交互脚本：

```typescript
const player = new Player();

// 设置容器
document.body.appendChild(player.dom);

// 设置尺寸
player.setSize(800, 600);

// 加载场景
player.load(sceneData);

// 控制播放
player.play();    // 开始播放
player.stop();    // 停止播放
player.setSize(width, height);  // 调整尺寸

// 监听播放事件
player.addEventListener('start', () => {
  console.log('播放开始');
});

player.addEventListener('stop', () => {
  console.log('播放停止');
});
```

## 🛠️ 开发指南

### 环境要求

- Node.js >= 14
- npm >= 6

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

## 📁 项目结构

```
src/
├── index.ts                 # 主入口文件
├── Editor.js               # 编辑器核心类
├── Viewport.js             # 视口组件
├── Toolbar.js              # 工具栏组件
├── Player.js               # 播放器组件
├── History.js              # 历史记录管理
├── Loader.js               # 文件加载器
├── Selector.js             # 对象选择器
├── Config.js               # 配置管理
├── Storage.js              # 存储管理
├── Strings.js              # 国际化字符串
├── Command.js              # 命令基类
├── types.d.ts              # TypeScript 类型定义
├── commands/               # 命令类目录
│   ├── Commands.js         # 命令导出文件
│   ├── AddObjectCommand.js # 添加对象命令
│   ├── RemoveObjectCommand.js # 移除对象命令
│   ├── SetPositionCommand.js  # 设置位置命令
│   ├── SetRotationCommand.js  # 设置旋转命令
│   ├── SetScaleCommand.js     # 设置缩放命令
│   ├── SetMaterialCommand.js  # 设置材质命令
│   └── ...                    # 其他命令
├── css/
│   └── main.css            # 主样式文件
├── libs/                   # 第三方库
│   ├── signals.min.js      # 信号系统
│   └── ui.js              # UI 组件库
└── images/                 # 图标资源
    ├── translate.svg       # 移动工具图标
    ├── rotate.svg          # 旋转工具图标
    └── scale.svg           # 缩放工具图标
```

## 🔌 扩展性

### 自定义命令

继承 `Command` 基类创建自定义命令：

```typescript
import { Command } from '@zhengdewei/three-editor-core';

class MyCustomCommand extends Command {
  constructor(editor, params) {
    super(editor);
    this.type = 'MyCustomCommand';
    this.name = '我的自定义命令';
    // 初始化参数
  }
  
  execute() {
    // 执行逻辑
  }
  
  undo() {
    // 撤销逻辑
  }
  
  toJSON() {
    // 序列化
    return super.toJSON();
  }
  
  fromJSON(json) {
    // 反序列化
    super.fromJSON(json);
  }
}
```

### 自定义加载器

扩展 `Loader` 类支持新的文件格式：

```typescript
// 在 Loader.js 的 loadFile 方法中添加新格式
case 'myformat':
  reader.addEventListener('load', function(event) {
    const contents = event.target.result;
    // 解析自定义格式
    const object = parseMyFormat(contents);
    editor.execute(new AddObjectCommand(editor, object));
  });
  reader.readAsArrayBuffer(file);
  break;
```

## 🌐 国际化

编辑器支持多语言，通过 `Strings` 类管理：

```typescript
// 支持的语言
const supportedLanguages = ['zh', 'en', 'fr', 'ja', 'ko', 'fa'];

// 获取字符串
const translateText = editor.strings.getKey('toolbar/translate');

// 设置语言
editor.config.setKey('language', 'en');
```

## 🔗 依赖

### 核心依赖
- **three**: ^0.179.1 - Three.js 3D 库
- **three-gpu-pathtracer**: ^0.0.23 - GPU 路径追踪
- **three-mesh-bvh**: ^0.9.1 - 网格边界体积层次结构

### 开发依赖
- TypeScript 5.0+
- Rollup (打包工具)
- Jest (测试框架)
- ESLint (代码检查)


### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request


## 🚀 更新日志

### v1.0.0
- 初始版本发布
- 完整的编辑器核心功能
- 命令模式与历史记录
- 多格式文件加载支持
- 播放器功能 