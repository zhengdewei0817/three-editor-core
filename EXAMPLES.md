# Three.js Editor Core 使用示例

本文档提供了 Three.js Editor Core 的详细使用示例，涵盖从基础到高级的各种用法。

## 目录

- [快速开始](#快速开始)
- [基础操作](#基础操作)
- [高级功能](#高级功能)
- [自定义扩展](#自定义扩展)
- [完整应用示例](#完整应用示例)

---

## 快速开始

### 最简单的编辑器

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Three.js Editor</title>
    <link rel="stylesheet" href="node_modules/@zhengdewei/three-editor-core/dist/src/css/main.css">
    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        #viewport { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <script type="module">
        import { Editor, Viewport } from '@zhengdewei/three-editor-core';
        
        const editor = new Editor();
        const viewport = new Viewport(editor);
        
        document.body.appendChild(viewport.dom);
        editor.init();
    </script>
</body>
</html>
```

### 带工具栏的编辑器

```typescript
import { Editor, Viewport, Toolbar } from '@zhengdewei/three-editor-core';
import '@zhengdewei/three-editor-core/dist/src/css/main.css';

// 创建编辑器实例
const editor = new Editor();

// 创建视口
const viewport = new Viewport(editor);
document.body.appendChild(viewport.dom);

// 创建工具栏
const toolbar = new Toolbar(editor);
document.body.appendChild(toolbar.dom);

// 初始化
editor.init();
```

---

## 基础操作

### 1. 添加基本几何体

```typescript
import * as THREE from 'three';
import { AddObjectCommand } from '@zhengdewei/three-editor-core';

// 立方体
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(boxGeometry, boxMaterial);
cube.name = '立方体';
editor.execute(new AddObjectCommand(editor, cube));

// 球体
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(2, 0, 0);
sphere.name = '球体';
editor.execute(new AddObjectCommand(editor, sphere));

// 圆柱体
const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.set(-2, 0, 0);
cylinder.name = '圆柱体';
editor.execute(new AddObjectCommand(editor, cylinder));
```

### 2. 添加光源

```typescript
// 方向光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.name = '方向光';
editor.execute(new AddObjectCommand(editor, directionalLight));

// 点光源
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);
pointLight.name = '点光源';
editor.execute(new AddObjectCommand(editor, pointLight));

// 环境光
const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
ambientLight.name = '环境光';
editor.execute(new AddObjectCommand(editor, ambientLight));
```

### 3. 对象变换

```typescript
import { 
  SetPositionCommand, 
  SetRotationCommand, 
  SetScaleCommand 
} from '@zhengdewei/three-editor-core';

// 设置位置
const newPosition = new THREE.Vector3(1, 2, 3);
editor.execute(new SetPositionCommand(editor, cube, newPosition));

// 设置旋转
const newRotation = new THREE.Euler(Math.PI / 4, 0, 0);
editor.execute(new SetRotationCommand(editor, cube, newRotation));

// 设置缩放
const newScale = new THREE.Vector3(2, 1, 1);
editor.execute(new SetScaleCommand(editor, cube, newScale));
```

### 4. 材质操作

```typescript
import { 
  SetMaterialCommand,
  SetMaterialColorCommand,
  SetMaterialValueCommand 
} from '@zhengdewei/three-editor-core';

// 更换材质
const newMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff });
editor.execute(new SetMaterialCommand(editor, cube, newMaterial));

// 修改材质颜色
editor.execute(new SetMaterialColorCommand(editor, cube, 'color', 0x00ffff));

// 修改材质属性
editor.execute(new SetMaterialValueCommand(editor, cube, 'roughness', 0.5));
editor.execute(new SetMaterialValueCommand(editor, cube, 'metalness', 0.8));
```

---

## 高级功能

### 1. 场景序列化与加载

```typescript
// 导出场景
function exportScene() {
  const sceneData = editor.toJSON();
  const dataStr = JSON.stringify(sceneData, null, 2);
  
  // 下载文件
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'scene.json';
  link.click();
  
  URL.revokeObjectURL(url);
}

// 导入场景
async function importScene(file) {
  try {
    const text = await file.text();
    const sceneData = JSON.parse(text);
    
    // 清空当前场景
    editor.clear();
    
    // 加载新场景
    await editor.fromJSON(sceneData);
    
    console.log('场景加载成功');
  } catch (error) {
    console.error('场景加载失败:', error);
  }
}
```

### 2. 自定义材质和纹理

```typescript
// 加载纹理
const textureLoader = new THREE.TextureLoader();

async function createTexturedMaterial() {
  const diffuseTexture = await new Promise((resolve) => {
    textureLoader.load('path/to/diffuse.jpg', resolve);
  });
  
  const normalTexture = await new Promise((resolve) => {
    textureLoader.load('path/to/normal.jpg', resolve);
  });
  
  const material = new THREE.MeshStandardMaterial({
    map: diffuseTexture,
    normalMap: normalTexture,
    roughness: 0.7,
    metalness: 0.3
  });
  
  // 添加材质到编辑器
  editor.addMaterial(material);
  
  return material;
}

// 使用纹理材质
const texturedMaterial = await createTexturedMaterial();
editor.execute(new SetMaterialCommand(editor, cube, texturedMaterial));
```

### 3. 动画系统

```typescript
// 创建动画
function createAnimation() {
  const mixer = editor.mixer;
  
  // 位置动画
  const positionKF = new THREE.VectorKeyframeTrack(
    cube.name + '.position',
    [0, 1, 2],
    [0, 0, 0, 1, 1, 1, 0, 0, 0]
  );
  
  // 旋转动画
  const rotationKF = new THREE.QuaternionKeyframeTrack(
    cube.name + '.quaternion',
    [0, 1, 2],
    [0, 0, 0, 1, 0, 0, 0.7071, 0.7071, 0, 0, 0, 1]
  );
  
  // 创建动画剪辑
  const clip = new THREE.AnimationClip('CubeAnimation', 2, [positionKF, rotationKF]);
  
  // 创建动画动作
  const action = mixer.clipAction(clip);
  action.play();
  
  return action;
}

// 播放动画
const animation = createAnimation();

// 更新动画（在渲染循环中调用）
function animate() {
  const delta = clock.getDelta();
  editor.mixer.update(delta);
  requestAnimationFrame(animate);
}
```

### 4. 相机控制

```typescript
// 添加新相机
const newCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
newCamera.position.set(0, 10, 10);
newCamera.name = '俯视相机';
editor.execute(new AddObjectCommand(editor, newCamera));

// 切换视口相机
editor.setViewportCamera(newCamera.uuid);

// 相机动画
function animateCameraToObject(targetObject) {
  const startPosition = editor.viewportCamera.position.clone();
  const endPosition = targetObject.position.clone().add(new THREE.Vector3(5, 5, 5));
  
  const tween = new TWEEN.Tween(startPosition)
    .to(endPosition, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      editor.viewportCamera.position.copy(startPosition);
      editor.viewportCamera.lookAt(targetObject.position);
    })
    .start();
}
```

### 5. 脚本系统

```typescript
// 为对象添加脚本
const script = {
  name: 'RotateScript',
  source: `
    function update(event) {
      this.rotation.y += 0.01;
    }
    
    return { update };
  `
};

editor.execute(new AddScriptCommand(editor, cube, script));

// 全局脚本
const globalScript = {
  name: 'GlobalScript',
  source: `
    function init() {
      console.log('场景初始化');
    }
    
    function update() {
      // 全局更新逻辑
    }
    
    return { init, update };
  `
};

// 添加到根对象
if (!editor.scripts['__root__']) {
  editor.scripts['__root__'] = [];
}
editor.scripts['__root__'].push(globalScript);
```

---

## 自定义扩展

### 1. 自定义命令

```typescript
import { Command } from '@zhengdewei/three-editor-core';

// 批量修改颜色命令
class SetMultipleColorsCommand extends Command {
  constructor(editor, objects, newColor) {
    super(editor);
    
    this.type = 'SetMultipleColorsCommand';
    this.name = '批量设置颜色';
    this.objects = objects;
    this.newColor = newColor;
    
    // 保存旧颜色
    this.oldColors = objects.map(obj => 
      obj.material.color ? obj.material.color.getHex() : 0xffffff
    );
  }
  
  execute() {
    this.objects.forEach(object => {
      if (object.material && object.material.color) {
        object.material.color.setHex(this.newColor);
        this.editor.signals.objectChanged.dispatch(object);
      }
    });
  }
  
  undo() {
    this.objects.forEach((object, index) => {
      if (object.material && object.material.color) {
        object.material.color.setHex(this.oldColors[index]);
        this.editor.signals.objectChanged.dispatch(object);
      }
    });
  }
}

// 使用自定义命令
const selectedObjects = [cube, sphere, cylinder];
editor.execute(new SetMultipleColorsCommand(editor, selectedObjects, 0xff0000));
```

### 2. 自定义插件系统

```typescript
// 插件基类
class EditorPlugin {
  constructor(editor) {
    this.editor = editor;
    this.enabled = false;
  }
  
  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.onEnable();
  }
  
  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.onDisable();
  }
  
  onEnable() {
    // 子类实现
  }
  
  onDisable() {
    // 子类实现
  }
}

// 网格对齐插件
class GridSnapPlugin extends EditorPlugin {
  constructor(editor, gridSize = 1) {
    super(editor);
    this.gridSize = gridSize;
    this.originalTransformListener = null;
  }
  
  onEnable() {
    // 监听对象变换
    this.originalTransformListener = (object) => {
      this.snapToGrid(object);
    };
    
    this.editor.signals.objectChanged.add(this.originalTransformListener);
  }
  
  onDisable() {
    if (this.originalTransformListener) {
      this.editor.signals.objectChanged.remove(this.originalTransformListener);
    }
  }
  
  snapToGrid(object) {
    const pos = object.position;
    pos.x = Math.round(pos.x / this.gridSize) * this.gridSize;
    pos.y = Math.round(pos.y / this.gridSize) * this.gridSize;
    pos.z = Math.round(pos.z / this.gridSize) * this.gridSize;
  }
}

// 使用插件
const gridSnapPlugin = new GridSnapPlugin(editor, 0.5);
gridSnapPlugin.enable();
```

### 3. 自定义UI面板

```typescript
import { UIPanel, UIText, UIButton, UIInput } from '@zhengdewei/three-editor-core';

class PropertyPanel {
  constructor(editor) {
    this.editor = editor;
    this.container = new UIPanel();
    this.container.setClass('property-panel');
    
    this.createUI();
    this.bindEvents();
  }
  
  createUI() {
    // 标题
    this.title = new UIText('属性面板');
    this.title.setClass('panel-title');
    this.container.add(this.title);
    
    // 对象名称
    this.nameLabel = new UIText('名称:');
    this.nameInput = new UIInput();
    this.container.add(this.nameLabel);
    this.container.add(this.nameInput);
    
    // 位置控制
    this.positionLabel = new UIText('位置:');
    this.positionX = new UIInput().setWidth('60px');
    this.positionY = new UIInput().setWidth('60px');
    this.positionZ = new UIInput().setWidth('60px');
    
    this.container.add(this.positionLabel);
    this.container.add(this.positionX);
    this.container.add(this.positionY);
    this.container.add(this.positionZ);
    
    // 应用按钮
    this.applyButton = new UIButton('应用');
    this.container.add(this.applyButton);
  }
  
  bindEvents() {
    // 监听对象选择
    this.editor.signals.objectSelected.add((object) => {
      this.updatePanel(object);
    });
    
    // 应用更改
    this.applyButton.onClick(() => {
      this.applyChanges();
    });
  }
  
  updatePanel(object) {
    if (!object) {
      this.container.setDisplay('none');
      return;
    }
    
    this.container.setDisplay('block');
    this.nameInput.setValue(object.name || '');
    this.positionX.setValue(object.position.x.toFixed(2));
    this.positionY.setValue(object.position.y.toFixed(2));
    this.positionZ.setValue(object.position.z.toFixed(2));
  }
  
  applyChanges() {
    const object = this.editor.selected;
    if (!object) return;
    
    // 更新名称
    const newName = this.nameInput.getValue();
    if (newName !== object.name) {
      this.editor.nameObject(object, newName);
    }
    
    // 更新位置
    const newPosition = new THREE.Vector3(
      parseFloat(this.positionX.getValue()),
      parseFloat(this.positionY.getValue()),
      parseFloat(this.positionZ.getValue())
    );
    
    if (!object.position.equals(newPosition)) {
      this.editor.execute(new SetPositionCommand(editor, object, newPosition));
    }
  }
}

// 使用属性面板
const propertyPanel = new PropertyPanel(editor);
document.body.appendChild(propertyPanel.container.dom);
```

---

## 高级功能

### 1. 文件加载与导入

```typescript
// 拖拽加载
function setupDragAndDrop() {
  const viewport = document.getElementById('viewport');
  
  viewport.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  
  viewport.addEventListener('drop', (event) => {
    event.preventDefault();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      editor.loader.loadFiles(files);
    }
  });
}

// 文件选择加载
function setupFileInput() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = '.gltf,.glb,.fbx,.obj,.dae,.stl,.ply';
  
  fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      editor.loader.loadFiles(files);
    }
  });
  
  return fileInput;
}

// 程序化加载模型
async function loadGLTFModel(url) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const loader = new GLTFLoader();
  
  try {
    const gltf = await new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
    
    const model = gltf.scene;
    model.name = 'GLTF模型';
    
    editor.execute(new AddObjectCommand(editor, model));
    editor.select(model);
    
    return model;
  } catch (error) {
    console.error('模型加载失败:', error);
  }
}
```

### 2. 高级材质编辑

```typescript
// 创建复杂材质
function createAdvancedMaterial() {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.0,
    transparent: true,
    opacity: 0.8
  });
  
  // 加载纹理
  const textureLoader = new THREE.TextureLoader();
  
  textureLoader.load('textures/diffuse.jpg', (texture) => {
    material.map = texture;
    material.needsUpdate = true;
    editor.signals.materialChanged.dispatch(material);
  });
  
  textureLoader.load('textures/normal.jpg', (texture) => {
    material.normalMap = texture;
    material.needsUpdate = true;
    editor.signals.materialChanged.dispatch(material);
  });
  
  textureLoader.load('textures/roughness.jpg', (texture) => {
    material.roughnessMap = texture;
    material.needsUpdate = true;
    editor.signals.materialChanged.dispatch(material);
  });
  
  return material;
}

// 材质编辑器
class MaterialEditor {
  constructor(editor) {
    this.editor = editor;
    this.currentMaterial = null;
  }
  
  editMaterial(material) {
    this.currentMaterial = material;
    this.showMaterialPanel(material);
  }
  
  updateProperty(propertyName, value) {
    if (!this.currentMaterial) return;
    
    const oldValue = this.currentMaterial[propertyName];
    
    // 创建自定义命令
    const command = new SetMaterialValueCommand(
      this.editor,
      this.getObjectWithMaterial(this.currentMaterial),
      propertyName,
      value
    );
    
    this.editor.execute(command);
  }
  
  getObjectWithMaterial(material) {
    // 查找使用该材质的对象
    let targetObject = null;
    this.editor.scene.traverse((object) => {
      if (object.material === material) {
        targetObject = object;
      }
    });
    return targetObject;
  }
}
```

### 3. 场景环境设置

```typescript
// 设置天空盒
function setSkybox(textureUrls) {
  const loader = new THREE.CubeTextureLoader();
  const skyboxTexture = loader.load(textureUrls);
  
  editor.scene.background = skyboxTexture;
  editor.scene.environment = skyboxTexture;
  
  editor.signals.sceneBackgroundChanged.dispatch();
  editor.signals.sceneEnvironmentChanged.dispatch();
}

// 设置雾效
function setFog(type, color, near, far) {
  let fog;
  
  if (type === 'linear') {
    fog = new THREE.Fog(color, near, far);
  } else if (type === 'exponential') {
    fog = new THREE.FogExp2(color, 0.002);
  }
  
  editor.scene.fog = fog;
  editor.signals.sceneFogChanged.dispatch();
}

// 设置后处理
async function setupPostProcessing() {
  const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
  const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
  const { BloomPass } = await import('three/addons/postprocessing/BloomPass.js');
  
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(editor.scene, editor.camera));
  composer.addPass(new BloomPass(1.5));
  
  return composer;
}
```

---

## 完整应用示例

### 1. 完整的 3D 编辑器应用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <title>Three.js 3D 编辑器</title>
    <link rel="stylesheet" href="node_modules/@zhengdewei/three-editor-core/dist/src/css/main.css">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background: #2c2c2c;
            color: #ffffff;
            overflow: hidden;
        }
        
        #app {
            display: flex;
            height: 100vh;
        }
        
        #sidebar {
            width: 300px;
            background: #1e1e1e;
            border-right: 1px solid #404040;
            display: flex;
            flex-direction: column;
        }
        
        #main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        #toolbar {
            height: 50px;
            background: #1a1a1a;
            border-bottom: 1px solid #404040;
            display: flex;
            align-items: center;
            padding: 0 10px;
            gap: 10px;
        }
        
        #viewport {
            flex: 1;
            position: relative;
        }
        
        .panel {
            padding: 15px;
            border-bottom: 1px solid #404040;
        }
        
        .panel-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #ffffff;
        }
        
        .property-group {
            margin-bottom: 15px;
        }
        
        .property-label {
            font-size: 12px;
            color: #cccccc;
            margin-bottom: 5px;
        }
        
        .property-input {
            width: 100%;
            padding: 5px;
            background: #404040;
            border: 1px solid #606060;
            color: #ffffff;
            border-radius: 3px;
        }
        
        .button {
            background: #0066cc;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .button:hover {
            background: #0080ff;
        }
        
        .button.secondary {
            background: #666666;
        }
        
        .button.secondary:hover {
            background: #808080;
        }
        
        #scene-tree {
            flex: 1;
            overflow-y: auto;
        }
        
        .tree-item {
            padding: 5px 10px;
            cursor: pointer;
            border-bottom: 1px solid #333;
        }
        
        .tree-item:hover {
            background: #333333;
        }
        
        .tree-item.selected {
            background: #0066cc;
        }
    </style>
</head>
<body>
    <div id="app">
        <!-- 侧边栏 -->
        <div id="sidebar">
            <!-- 场景树 -->
            <div class="panel">
                <div class="panel-title">场景树</div>
                <div id="scene-tree"></div>
            </div>
            
            <!-- 属性面板 -->
            <div class="panel">
                <div class="panel-title">属性</div>
                <div id="properties-panel">
                    <div class="property-group">
                        <div class="property-label">名称</div>
                        <input type="text" id="object-name" class="property-input" placeholder="对象名称">
                    </div>
                    
                    <div class="property-group">
                        <div class="property-label">位置</div>
                        <input type="number" id="pos-x" class="property-input" placeholder="X" step="0.1">
                        <input type="number" id="pos-y" class="property-input" placeholder="Y" step="0.1">
                        <input type="number" id="pos-z" class="property-input" placeholder="Z" step="0.1">
                    </div>
                    
                    <div class="property-group">
                        <div class="property-label">旋转</div>
                        <input type="number" id="rot-x" class="property-input" placeholder="X" step="0.1">
                        <input type="number" id="rot-y" class="property-input" placeholder="Y" step="0.1">
                        <input type="number" id="rot-z" class="property-input" placeholder="Z" step="0.1">
                    </div>
                    
                    <div class="property-group">
                        <div class="property-label">缩放</div>
                        <input type="number" id="scale-x" class="property-input" placeholder="X" step="0.1" value="1">
                        <input type="number" id="scale-y" class="property-input" placeholder="Y" step="0.1" value="1">
                        <input type="number" id="scale-z" class="property-input" placeholder="Z" step="0.1" value="1">
                    </div>
                    
                    <button id="apply-transform" class="button">应用变换</button>
                </div>
            </div>
        </div>
        
        <!-- 主内容区 -->
        <div id="main-content">
            <!-- 工具栏 -->
            <div id="toolbar">
                <button id="add-cube" class="button">添加立方体</button>
                <button id="add-sphere" class="button">添加球体</button>
                <button id="add-light" class="button">添加光源</button>
                <button id="delete-object" class="button secondary">删除对象</button>
                <button id="undo" class="button secondary">撤销</button>
                <button id="redo" class="button secondary">重做</button>
                <input type="file" id="file-input" style="display: none;" multiple accept=".gltf,.glb,.fbx,.obj">
                <button id="load-file" class="button">加载文件</button>
                <button id="export-scene" class="button">导出场景</button>
            </div>
            
            <!-- 视口 -->
            <div id="viewport"></div>
        </div>
    </div>

    <script type="module">
        import { 
            Editor, 
            Viewport, 
            Toolbar,
            AddObjectCommand,
            RemoveObjectCommand,
            SetPositionCommand,
            SetRotationCommand,
            SetScaleCommand
        } from '@zhengdewei/three-editor-core';
        import * as THREE from 'three';

        // 创建编辑器
        const editor = new Editor();
        
        // 创建视口
        const viewport = new Viewport(editor);
        document.getElementById('viewport').appendChild(viewport.dom);
        
        // 创建内置工具栏
        const toolbar = new Toolbar(editor);
        document.getElementById('toolbar').appendChild(toolbar.dom);
        
        // 初始化
        editor.init();
        
        // UI 元素引用
        const sceneTree = document.getElementById('scene-tree');
        const objectNameInput = document.getElementById('object-name');
        const posXInput = document.getElementById('pos-x');
        const posYInput = document.getElementById('pos-y');
        const posZInput = document.getElementById('pos-z');
        const rotXInput = document.getElementById('rot-x');
        const rotYInput = document.getElementById('rot-y');
        const rotZInput = document.getElementById('rot-z');
        const scaleXInput = document.getElementById('scale-x');
        const scaleYInput = document.getElementById('scale-y');
        const scaleZInput = document.getElementById('scale-z');
        
        // 工具栏按钮事件
        document.getElementById('add-cube').addEventListener('click', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            const cube = new THREE.Mesh(geometry, material);
            cube.name = '立方体';
            cube.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            );
            editor.execute(new AddObjectCommand(editor, cube));
        });
        
        document.getElementById('add-sphere').addEventListener('click', () => {
            const geometry = new THREE.SphereGeometry(0.5, 32, 16);
            const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.name = '球体';
            sphere.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            );
            editor.execute(new AddObjectCommand(editor, sphere));
        });
        
        document.getElementById('add-light').addEventListener('click', () => {
            const light = new THREE.PointLight(0xffffff, 1, 10);
            light.name = '点光源';
            light.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 10
            );
            editor.execute(new AddObjectCommand(editor, light));
        });
        
        document.getElementById('delete-object').addEventListener('click', () => {
            if (editor.selected) {
                editor.execute(new RemoveObjectCommand(editor, editor.selected));
            }
        });
        
        document.getElementById('undo').addEventListener('click', () => {
            editor.undo();
        });
        
        document.getElementById('redo').addEventListener('click', () => {
            editor.redo();
        });
        
        // 文件加载
        const fileInput = document.getElementById('file-input');
        document.getElementById('load-file').addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                editor.loader.loadFiles(files);
            }
        });
        
        // 导出场景
        document.getElementById('export-scene').addEventListener('click', () => {
            const sceneData = editor.toJSON();
            const dataStr = JSON.stringify(sceneData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'scene.json';
            link.click();
            URL.revokeObjectURL(url);
        });
        
        // 属性面板事件
        document.getElementById('apply-transform').addEventListener('click', () => {
            const object = editor.selected;
            if (!object) return;
            
            // 更新名称
            const newName = objectNameInput.value;
            if (newName !== object.name) {
                editor.nameObject(object, newName);
            }
            
            // 更新位置
            const newPosition = new THREE.Vector3(
                parseFloat(posXInput.value) || 0,
                parseFloat(posYInput.value) || 0,
                parseFloat(posZInput.value) || 0
            );
            if (!object.position.equals(newPosition)) {
                editor.execute(new SetPositionCommand(editor, object, newPosition));
            }
            
            // 更新旋转
            const newRotation = new THREE.Euler(
                THREE.MathUtils.degToRad(parseFloat(rotXInput.value) || 0),
                THREE.MathUtils.degToRad(parseFloat(rotYInput.value) || 0),
                THREE.MathUtils.degToRad(parseFloat(rotZInput.value) || 0)
            );
            if (!object.rotation.equals(newRotation)) {
                editor.execute(new SetRotationCommand(editor, object, newRotation));
            }
            
            // 更新缩放
            const newScale = new THREE.Vector3(
                parseFloat(scaleXInput.value) || 1,
                parseFloat(scaleYInput.value) || 1,
                parseFloat(scaleZInput.value) || 1
            );
            if (!object.scale.equals(newScale)) {
                editor.execute(new SetScaleCommand(editor, object, newScale));
            }
        });
        
        // 更新场景树
        function updateSceneTree() {
            sceneTree.innerHTML = '';
            
            function addTreeItem(object, level = 0) {
                const item = document.createElement('div');
                item.className = 'tree-item';
                item.style.paddingLeft = (level * 20 + 10) + 'px';
                item.textContent = object.name || '未命名对象';
                item.dataset.uuid = object.uuid;
                
                if (editor.selected === object) {
                    item.classList.add('selected');
                }
                
                item.addEventListener('click', () => {
                    editor.select(object);
                });
                
                sceneTree.appendChild(item);
                
                // 添加子对象
                object.children.forEach(child => {
                    addTreeItem(child, level + 1);
                });
            }
            
            editor.scene.children.forEach(child => {
                addTreeItem(child);
            });
        }
        
        // 更新属性面板
        function updatePropertiesPanel(object) {
            if (!object) {
                document.getElementById('properties-panel').style.display = 'none';
                return;
            }
            
            document.getElementById('properties-panel').style.display = 'block';
            
            objectNameInput.value = object.name || '';
            posXInput.value = object.position.x.toFixed(3);
            posYInput.value = object.position.y.toFixed(3);
            posZInput.value = object.position.z.toFixed(3);
            rotXInput.value = THREE.MathUtils.radToDeg(object.rotation.x).toFixed(1);
            rotYInput.value = THREE.MathUtils.radToDeg(object.rotation.y).toFixed(1);
            rotZInput.value = THREE.MathUtils.radToDeg(object.rotation.z).toFixed(1);
            scaleXInput.value = object.scale.x.toFixed(3);
            scaleYInput.value = object.scale.y.toFixed(3);
            scaleZInput.value = object.scale.z.toFixed(3);
        }
        
        // 监听编辑器信号
        editor.signals.objectSelected.add((object) => {
            updatePropertiesPanel(object);
            updateSceneTree();
        });
        
        editor.signals.sceneGraphChanged.add(() => {
            updateSceneTree();
        });
        
        editor.signals.objectChanged.add((object) => {
            if (editor.selected === object) {
                updatePropertiesPanel(object);
            }
        });
        
        // 初始化场景树
        updateSceneTree();
        
        // 添加默认光源
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        ambientLight.name = '环境光';
        editor.execute(new AddObjectCommand(editor, ambientLight));
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.name = '方向光';
        editor.execute(new AddObjectCommand(editor, directionalLight));
        
        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'z':
                        event.preventDefault();
                        if (event.shiftKey) {
                            editor.redo();
                        } else {
                            editor.undo();
                        }
                        break;
                    case 's':
                        event.preventDefault();
                        // 保存场景
                        document.getElementById('export-scene').click();
                        break;
                }
            } else if (editor.selected) {
                switch (event.key) {
                    case 'Delete':
                    case 'Backspace':
                        event.preventDefault();
                        document.getElementById('delete-object').click();
                        break;
                    case 'f':
                        event.preventDefault();
                        editor.focus(editor.selected);
                        break;
                }
            }
        });
    </script>
</body>
</html>
```

### 2. 播放器应用示例

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>3D 场景播放器</title>
    <style>
        body {
            margin: 0;
            background: #000;
            font-family: Arial, sans-serif;
        }
        
        #player-container {
            position: relative;
            width: 100vw;
            height: 100vh;
        }
        
        #controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            display: flex;
            gap: 10px;
        }
        
        .control-button {
            background: #0066cc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .control-button:hover {
            background: #0080ff;
        }
        
        .control-button:disabled {
            background: #666;
            cursor: not-allowed;
        }
        
        #file-input {
            display: none;
        }
    </style>
</head>
<body>
    <div id="player-container">
        <div id="controls">
            <input type="file" id="file-input" accept=".json">
            <button id="load-scene" class="control-button">加载场景</button>
            <button id="play-btn" class="control-button">播放</button>
            <button id="stop-btn" class="control-button" disabled>停止</button>
            <button id="fullscreen-btn" class="control-button">全屏</button>
        </div>
    </div>

    <script type="module">
        import { Player } from '@zhengdewei/three-editor-core';
        
        // 创建播放器
        const player = new Player();
        const container = document.getElementById('player-container');
        container.appendChild(player.dom);
        
        // 设置播放器尺寸
        function resizePlayer() {
            player.setSize(window.innerWidth, window.innerHeight);
        }
        
        resizePlayer();
        window.addEventListener('resize', resizePlayer);
        
        // 控制按钮
        const fileInput = document.getElementById('file-input');
        const loadBtn = document.getElementById('load-scene');
        const playBtn = document.getElementById('play-btn');
        const stopBtn = document.getElementById('stop-btn');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        let isPlaying = false;
        
        // 加载场景文件
        loadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const sceneData = JSON.parse(text);
                
                player.load(sceneData);
                playBtn.disabled = false;
                
                console.log('场景加载成功');
            } catch (error) {
                console.error('场景加载失败:', error);
                alert('场景文件格式错误');
            }
        });
        
        // 播放控制
        playBtn.addEventListener('click', () => {
            player.play();
            isPlaying = true;
            playBtn.disabled = true;
            stopBtn.disabled = false;
        });
        
        stopBtn.addEventListener('click', () => {
            player.stop();
            isPlaying = false;
            playBtn.disabled = false;
            stopBtn.disabled = true;
        });
        
        // 全屏控制
        fullscreenBtn.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                container.requestFullscreen();
            }
        });
        
        // 键盘控制
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    if (isPlaying) {
                        stopBtn.click();
                    } else {
                        playBtn.click();
                    }
                    break;
                case 'F11':
                    event.preventDefault();
                    fullscreenBtn.click();
                    break;
            }
        });
        
        // 示例场景数据
        const exampleScene = {
            metadata: {},
            project: {
                shadows: true,
                shadowType: 1,
                toneMapping: 0,
                toneMappingExposure: 1
            },
            camera: {
                object: {
                    type: 'PerspectiveCamera',
                    fov: 50,
                    zoom: 1,
                    near: 0.01,
                    far: 1000,
                    position: [0, 5, 10],
                    rotation: [0, 0, 0],
                    quaternion: [0, 0, 0, 1]
                }
            },
            scene: {
                object: {
                    type: 'Scene',
                    children: [
                        {
                            type: 'Mesh',
                            geometry: {
                                type: 'BoxGeometry',
                                width: 1,
                                height: 1,
                                depth: 1
                            },
                            material: {
                                type: 'MeshStandardMaterial',
                                color: 0x00ff00
                            },
                            position: [0, 0.5, 0],
                            name: '示例立方体'
                        },
                        {
                            type: 'DirectionalLight',
                            color: 0xffffff,
                            intensity: 1,
                            position: [5, 5, 5],
                            name: '方向光'
                        }
                    ]
                }
            },
            scripts: {},
            history: { undos: [], redos: [] }
        };
        
        // 加载示例场景
        setTimeout(() => {
            player.load(exampleScene);
            playBtn.disabled = false;
        }, 1000);
    </script>
</body>
</html>
```

### 3. React 集成示例

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  Editor, 
  Viewport, 
  Toolbar,
  AddObjectCommand 
} from '@zhengdewei/three-editor-core';
import * as THREE from 'three';

const ThreeEditor: React.FC = () => {
  const editorRef = useRef<Editor>();
  const viewportRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  
  useEffect(() => {
    // 创建编辑器
    const editor = new Editor();
    editorRef.current = editor;
    
    // 创建视口
    const viewport = new Viewport(editor);
    if (viewportRef.current) {
      viewportRef.current.appendChild(viewport.dom);
    }
    
    // 创建工具栏
    const toolbar = new Toolbar(editor);
    if (toolbarRef.current) {
      toolbarRef.current.appendChild(toolbar.dom);
    }
    
    // 初始化
    editor.init();
    
    // 监听对象选择
    editor.signals.objectSelected.add((object: THREE.Object3D | null) => {
      setSelectedObject(object);
    });
    
    // 添加默认光源
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    ambientLight.name = '环境光';
    editor.execute(new AddObjectCommand(editor, ambientLight));
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.name = '方向光';
    editor.execute(new AddObjectCommand(editor, directionalLight));
    
    return () => {
      // 清理
      if (viewportRef.current) {
        viewportRef.current.innerHTML = '';
      }
      if (toolbarRef.current) {
        toolbarRef.current.innerHTML = '';
      }
    };
  }, []);
  
  const addCube = () => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: Math.random() * 0xffffff 
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = '立方体';
    
    editor.execute(new AddObjectCommand(editor, cube));
  };
  
  const deleteSelected = () => {
    const editor = editorRef.current;
    if (!editor || !selectedObject) return;
    
    editor.execute(new RemoveObjectCommand(editor, selectedObject));
  };
  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <div style={{ 
        height: '50px', 
        background: '#1a1a1a', 
        display: 'flex', 
        alignItems: 'center',
        padding: '0 10px',
        gap: '10px'
      }}>
        <div ref={toolbarRef} />
        <button onClick={addCube} style={{
          background: '#0066cc',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '3px',
          cursor: 'pointer'
        }}>
          添加立方体
        </button>
        <button onClick={deleteSelected} disabled={!selectedObject} style={{
          background: selectedObject ? '#cc0000' : '#666',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '3px',
          cursor: selectedObject ? 'pointer' : 'not-allowed'
        }}>
          删除对象
        </button>
      </div>
      
      {/* 主视口 */}
      <div ref={viewportRef} style={{ flex: 1 }} />
      
      {/* 状态栏 */}
      <div style={{
        height: '30px',
        background: '#1e1e1e',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        fontSize: '12px',
        color: '#ccc'
      }}>
        {selectedObject ? `已选择: ${selectedObject.name}` : '未选择对象'}
      </div>
    </div>
  );
};

export default ThreeEditor;
```

### 4. Vue 集成示例

```vue
<template>
  <div class="three-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div ref="toolbarRef" class="built-in-toolbar"></div>
      <button @click="addCube" class="btn">添加立方体</button>
      <button @click="addSphere" class="btn">添加球体</button>
      <button @click="deleteSelected" :disabled="!selectedObject" class="btn danger">删除</button>
      <button @click="exportScene" class="btn">导出场景</button>
    </div>
    
    <!-- 主视口 -->
    <div ref="viewportRef" class="viewport"></div>
    
    <!-- 属性面板 -->
    <div v-if="selectedObject" class="properties-panel">
      <h3>属性</h3>
      <div class="property-group">
        <label>名称:</label>
        <input v-model="objectName" @change="updateObjectName" />
      </div>
      <div class="property-group">
        <label>位置:</label>
        <input v-model.number="position.x" @change="updatePosition" type="number" step="0.1" />
        <input v-model.number="position.y" @change="updatePosition" type="number" step="0.1" />
        <input v-model.number="position.z" @change="updatePosition" type="number" step="0.1" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { 
  Editor, 
  Viewport, 
  Toolbar,
  AddObjectCommand,
  RemoveObjectCommand,
  SetPositionCommand
} from '@zhengdewei/three-editor-core';
import * as THREE from 'three';

const viewportRef = ref<HTMLDivElement>();
const toolbarRef = ref<HTMLDivElement>();
const selectedObject = ref<THREE.Object3D | null>(null);
const objectName = ref('');
const position = reactive({ x: 0, y: 0, z: 0 });

let editor: Editor;

onMounted(() => {
  // 创建编辑器
  editor = new Editor();
  
  // 创建视口
  const viewport = new Viewport(editor);
  if (viewportRef.value) {
    viewportRef.value.appendChild(viewport.dom);
  }
  
  // 创建工具栏
  const toolbar = new Toolbar(editor);
  if (toolbarRef.value) {
    toolbarRef.value.appendChild(toolbar.dom);
  }
  
  // 初始化
  editor.init();
  
  // 监听对象选择
  editor.signals.objectSelected.add((object: THREE.Object3D | null) => {
    selectedObject.value = object;
    if (object) {
      objectName.value = object.name || '';
      position.x = Number(object.position.x.toFixed(3));
      position.y = Number(object.position.y.toFixed(3));
      position.z = Number(object.position.z.toFixed(3));
    }
  });
  
  // 添加默认光源
  setupDefaultLighting();
});

onUnmounted(() => {
  // 清理
  if (viewportRef.value) {
    viewportRef.value.innerHTML = '';
  }
  if (toolbarRef.value) {
    toolbarRef.value.innerHTML = '';
  }
});

function setupDefaultLighting() {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
  ambientLight.name = '环境光';
  editor.execute(new AddObjectCommand(editor, ambientLight));
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.name = '方向光';
  editor.execute(new AddObjectCommand(editor, directionalLight));
}

function addCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ 
    color: Math.random() * 0xffffff 
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.name = '立方体';
  cube.position.set(
    (Math.random() - 0.5) * 10,
    Math.random() * 3,
    (Math.random() - 0.5) * 10
  );
  
  editor.execute(new AddObjectCommand(editor, cube));
}

function addSphere() {
  const geometry = new THREE.SphereGeometry(0.5, 32, 16);
  const material = new THREE.MeshStandardMaterial({ 
    color: Math.random() * 0xffffff 
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.name = '球体';
  sphere.position.set(
    (Math.random() - 0.5) * 10,
    Math.random() * 3,
    (Math.random() - 0.5) * 10
  );
  
  editor.execute(new AddObjectCommand(editor, sphere));
}

function deleteSelected() {
  if (selectedObject.value) {
    editor.execute(new RemoveObjectCommand(editor, selectedObject.value));
  }
}

function updateObjectName() {
  if (selectedObject.value && objectName.value !== selectedObject.value.name) {
    editor.nameObject(selectedObject.value, objectName.value);
  }
}

function updatePosition() {
  if (!selectedObject.value) return;
  
  const newPosition = new THREE.Vector3(position.x, position.y, position.z);
  if (!selectedObject.value.position.equals(newPosition)) {
    editor.execute(new SetPositionCommand(editor, selectedObject.value, newPosition));
  }
}

function exportScene() {
  const sceneData = editor.toJSON();
  const dataStr = JSON.stringify(sceneData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'scene.json';
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.three-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  height: 50px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 10px;
  border-bottom: 1px solid #404040;
}

.built-in-toolbar {
  display: flex;
  gap: 5px;
}

.viewport {
  flex: 1;
  position: relative;
}

.properties-panel {
  position: absolute;
  right: 10px;
  top: 60px;
  width: 250px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 5px;
  color: white;
}

.property-group {
  margin-bottom: 15px;
}

.property-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #ccc;
}

.property-group input {
  width: 100%;
  padding: 5px;
  background: #404040;
  border: 1px solid #606060;
  color: white;
  border-radius: 3px;
  margin-bottom: 5px;
}

.btn {
  background: #0066cc;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.btn:hover:not(:disabled) {
  background: #0080ff;
}

.btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.btn.danger {
  background: #cc0000;
}

.btn.danger:hover:not(:disabled) {
  background: #ff0000;
}
</style>
```

---

## 实用工具函数

### 1. 场景工具

```typescript
// 场景统计工具
class SceneAnalyzer {
  constructor(editor) {
    this.editor = editor;
  }
  
  getStatistics() {
    const stats = {
      objects: 0,
      meshes: 0,
      lights: 0,
      cameras: 0,
      materials: Object.keys(this.editor.materials).length,
      geometries: Object.keys(this.editor.geometries).length,
      textures: Object.keys(this.editor.textures).length,
      triangles: 0,
      vertices: 0
    };
    
    this.editor.scene.traverse((object) => {
      stats.objects++;
      
      if (object.isMesh) {
        stats.meshes++;
        if (object.geometry) {
          const geometry = object.geometry;
          if (geometry.index) {
            stats.triangles += geometry.index.count / 3;
          } else {
            stats.triangles += geometry.attributes.position.count / 3;
          }
          stats.vertices += geometry.attributes.position.count;
        }
      } else if (object.isLight) {
        stats.lights++;
      } else if (object.isCamera) {
        stats.cameras++;
      }
    });
    
    return stats;
  }
  
  optimizeScene() {
    // 合并相同材质
    this.mergeSameMaterials();
    
    // 移除未使用的资源
    this.removeUnusedResources();
    
    // 合并几何体（可选）
    this.mergeGeometries();
  }
  
  mergeSameMaterials() {
    const materialMap = new Map();
    
    this.editor.scene.traverse((object) => {
      if (object.isMesh && object.material) {
        const materialKey = this.getMaterialKey(object.material);
        
        if (materialMap.has(materialKey)) {
          object.material = materialMap.get(materialKey);
        } else {
          materialMap.set(materialKey, object.material);
        }
      }
    });
  }
  
  getMaterialKey(material) {
    return JSON.stringify({
      type: material.type,
      color: material.color?.getHex(),
      roughness: material.roughness,
      metalness: material.metalness,
      transparent: material.transparent,
      opacity: material.opacity
    });
  }
}

// 使用场景分析器
const analyzer = new SceneAnalyzer(editor);
const stats = analyzer.getStatistics();
console.log('场景统计:', stats);
```

### 2. 导入导出工具

```typescript
// 导入导出管理器
class ImportExportManager {
  constructor(editor) {
    this.editor = editor;
  }
  
  // 导出为 glTF
  async exportGLTF() {
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const exporter = new GLTFExporter();
    
    return new Promise((resolve, reject) => {
      exporter.parse(
        this.editor.scene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: 'application/octet-stream' }));
          } else {
            const output = JSON.stringify(result, null, 2);
            resolve(new Blob([output], { type: 'application/json' }));
          }
        },
        { binary: true },
        reject
      );
    });
  }
  
  // 导出为 OBJ
  async exportOBJ() {
    const { OBJExporter } = await import('three/addons/exporters/OBJExporter.js');
    const exporter = new OBJExporter();
    
    const result = exporter.parse(this.editor.scene);
    return new Blob([result], { type: 'text/plain' });
  }
  
  // 导出为 STL
  async exportSTL() {
    const { STLExporter } = await import('three/addons/exporters/STLExporter.js');
    const exporter = new STLExporter();
    
    const result = exporter.parse(this.editor.scene);
    return new Blob([result], { type: 'application/octet-stream' });
  }
  
  // 下载文件
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// 使用导入导出管理器
const importExportManager = new ImportExportManager(editor);

// 导出 glTF
async function exportAsGLTF() {
  try {
    const blob = await importExportManager.exportGLTF();
    importExportManager.downloadBlob(blob, 'scene.glb');
  } catch (error) {
    console.error('导出失败:', error);
  }
}
```

### 3. 性能监控

```typescript
// 性能监控器
class PerformanceMonitor {
  constructor(editor) {
    this.editor = editor;
    this.stats = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
    
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.startMonitoring();
  }
  
  startMonitoring() {
    const monitor = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      
      this.frameCount++;
      
      // 每秒更新一次统计
      if (deltaTime >= 1000) {
        this.stats.fps = Math.round((this.frameCount * 1000) / deltaTime);
        this.stats.frameTime = Math.round(deltaTime / this.frameCount * 100) / 100;
        
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        this.updateRenderStats();
        this.onStatsUpdate(this.stats);
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }
  
  updateRenderStats() {
    // 获取渲染器信息（如果可用）
    const renderer = this.getRenderer();
    if (renderer && renderer.info) {
      this.stats.drawCalls = renderer.info.render.calls;
      this.stats.triangles = renderer.info.render.triangles;
      this.stats.points = renderer.info.render.points;
      this.stats.lines = renderer.info.render.lines;
    }
  }
  
  getRenderer() {
    // 从视口获取渲染器实例
    return window.renderer; // 需要根据实际实现调整
  }
  
  onStatsUpdate(stats) {
    // 子类可以重写此方法来处理统计更新
    console.log('性能统计:', stats);
  }
}

// 性能显示组件
class PerformanceDisplay extends PerformanceMonitor {
  constructor(editor) {
    super(editor);
    this.createDisplay();
  }
  
  createDisplay() {
    this.display = document.createElement('div');
    this.display.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    `;
    document.body.appendChild(this.display);
  }
  
  onStatsUpdate(stats) {
    this.display.innerHTML = `
      FPS: ${stats.fps}<br>
      帧时间: ${stats.frameTime}ms<br>
      绘制调用: ${stats.drawCalls}<br>
      三角形: ${stats.triangles}<br>
    `;
  }
}

// 使用性能监控
const performanceDisplay = new PerformanceDisplay(editor);
```

---

## 调试和开发工具

### 1. 调试助手

```typescript
// 调试工具类
class EditorDebugger {
  constructor(editor) {
    this.editor = editor;
    this.enabled = false;
  }
  
  enable() {
    this.enabled = true;
    this.setupDebugCommands();
    this.setupSignalLogging();
  }
  
  setupDebugCommands() {
    // 添加到全局对象以便在控制台中使用
    window.editorDebug = {
      editor: this.editor,
      scene: this.editor.scene,
      selected: () => this.editor.selected,
      
      // 场景信息
      sceneInfo: () => {
        console.log('场景对象数量:', this.editor.scene.children.length);
        console.log('材质数量:', Object.keys(this.editor.materials).length);
        console.log('几何体数量:', Object.keys(this.editor.geometries).length);
      },
      
      // 选中对象信息
      selectedInfo: () => {
        const obj = this.editor.selected;
        if (obj) {
          console.log('选中对象:', obj);
          console.log('位置:', obj.position);
          console.log('旋转:', obj.rotation);
          console.log('缩放:', obj.scale);
          console.log('材质:', obj.material);
          console.log('几何体:', obj.geometry);
        } else {
          console.log('未选择对象');
        }
      },
      
      // 历史记录信息
      historyInfo: () => {
        console.log('撤销栈:', this.editor.history.undos);
        console.log('重做栈:', this.editor.history.redos);
      }
    };
    
    console.log('调试工具已启用，使用 window.editorDebug 访问调试功能');
  }
  
  setupSignalLogging() {
    // 记录所有信号
    Object.keys(this.editor.signals).forEach(signalName => {
      const signal = this.editor.signals[signalName];
      signal.add((...args) => {
        console.log(`信号触发: ${signalName}`, args);
      });
    });
  }
}

// 启用调试
const debugger = new EditorDebugger(editor);
debugger.enable();
```

### 2. 单元测试示例

```typescript
// 测试文件: editor.test.js
import { Editor, AddObjectCommand, RemoveObjectCommand } from '@zhengdewei/three-editor-core';
import * as THREE from 'three';

describe('Editor', () => {
  let editor;
  
  beforeEach(() => {
    editor = new Editor();
  });
  
  test('应该能创建编辑器实例', () => {
    expect(editor).toBeDefined();
    expect(editor.scene).toBeInstanceOf(THREE.Scene);
    expect(editor.camera).toBeInstanceOf(THREE.Camera);
  });
  
  test('应该能添加对象', () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial()
    );
    
    editor.addObject(cube);
    
    expect(editor.scene.children).toContain(cube);
  });
  
  test('应该能使用命令添加对象', () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial()
    );
    
    const command = new AddObjectCommand(editor, cube);
    editor.execute(command);
    
    expect(editor.scene.children).toContain(cube);
    expect(editor.selected).toBe(cube);
  });
  
  test('应该能撤销添加对象操作', () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial()
    );
    
    editor.execute(new AddObjectCommand(editor, cube));
    expect(editor.scene.children).toContain(cube);
    
    editor.undo();
    expect(editor.scene.children).not.toContain(cube);
  });
  
  test('应该能序列化和反序列化场景', async () => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    cube.name = '测试立方体';
    
    editor.addObject(cube);
    
    const json = editor.toJSON();
    expect(json).toBeDefined();
    expect(json.scene).toBeDefined();
    
    // 清空场景
    editor.clear();
    expect(editor.scene.children.length).toBe(0);
    
    // 重新加载
    await editor.fromJSON(json);
    
    const loadedCube = editor.scene.getObjectByName('测试立方体');
    expect(loadedCube).toBeDefined();
    expect(loadedCube.material.color.getHex()).toBe(0xff0000);
  });
});
```

这些示例展示了 Three.js Editor Core 的各种用法，从简单的基础操作到复杂的自定义扩展。你可以根据具体需求选择合适的示例作为起点，然后根据项目要求进行定制和扩展。 