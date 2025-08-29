# Three.js Editor Core API 文档

## 目录

- [Editor 类](#editor-类)
- [Viewport 类](#viewport-类)
- [Toolbar 类](#toolbar-类)
- [Player 类](#player-类)
- [History 类](#history-类)
- [Selector 类](#selector-类)
- [Config 类](#config-类)
- [Loader 类](#loader-类)
- [Command 类](#command-类)
- [命令系统](#命令系统)
- [信号系统](#信号系统)

---

## Editor 类

编辑器的核心类，管理整个 3D 场景和编辑状态。

### 构造函数

```typescript
constructor()
```

创建一个新的编辑器实例，初始化所有核心组件。

### 属性

#### 核心场景属性
- `scene: THREE.Scene` - 主要的 3D 场景
- `camera: THREE.Camera` - 当前活动相机
- `sceneHelpers: THREE.Scene` - 辅助对象场景（网格、辅助线等）
- `selected: THREE.Object3D | null` - 当前选中的对象

#### 管理器实例
- `config: Config` - 配置管理器
- `history: History` - 历史记录管理器
- `selector: Selector` - 对象选择器
- `storage: Storage` - 存储管理器
- `loader: Loader` - 文件加载器
- `strings: Strings` - 国际化字符串管理器

#### 资源集合
- `geometries: Object` - 几何体集合 (uuid -> geometry)
- `materials: Object` - 材质集合 (uuid -> material)
- `textures: Object` - 纹理集合 (uuid -> texture)
- `scripts: Object` - 脚本集合 (uuid -> scripts[])
- `cameras: Object` - 相机集合 (uuid -> camera)

#### 其他属性
- `mixer: THREE.AnimationMixer` - 动画混合器
- `materialsRefCounter: Map` - 材质引用计数器
- `viewportCamera: THREE.Camera` - 视口使用的相机
- `viewportShading: string` - 视口着色模式

### 方法

#### 对象管理

##### `addObject(object, parent?, index?)`
添加对象到场景中。

**参数：**
- `object: THREE.Object3D` - 要添加的对象
- `parent?: THREE.Object3D` - 父对象（可选，默认添加到根场景）
- `index?: number` - 插入位置（可选）

**示例：**
```typescript
const cube = new THREE.Mesh(geometry, material);
editor.addObject(cube);

// 添加到特定父对象
editor.addObject(childObject, parentObject, 0);
```

##### `removeObject(object)`
从场景中移除对象。

**参数：**
- `object: THREE.Object3D` - 要移除的对象

##### `nameObject(object, name)`
为对象设置名称。

**参数：**
- `object: THREE.Object3D` - 目标对象
- `name: string` - 新名称

#### 选择与聚焦

##### `select(object)`
选择指定对象。

**参数：**
- `object: THREE.Object3D | null` - 要选择的对象，null 表示取消选择

##### `selectById(id)`
根据对象 ID 选择对象。

**参数：**
- `id: number` - 对象 ID

##### `selectByUuid(uuid)`
根据 UUID 选择对象。

**参数：**
- `uuid: string` - 对象 UUID

##### `deselect()`
取消当前选择。

##### `focus(object)`
聚焦到指定对象（相机移动到合适位置观察对象）。

**参数：**
- `object: THREE.Object3D` - 要聚焦的对象

##### `focusById(id)`
根据 ID 聚焦对象。

**参数：**
- `id: number` - 对象 ID

#### 几何体管理

##### `addGeometry(geometry)`
添加几何体到管理器。

**参数：**
- `geometry: THREE.BufferGeometry` - 几何体对象

##### `setGeometryName(geometry, name)`
设置几何体名称。

**参数：**
- `geometry: THREE.BufferGeometry` - 几何体对象
- `name: string` - 新名称

#### 材质管理

##### `addMaterial(material)`
添加材质到管理器，支持材质数组。

**参数：**
- `material: THREE.Material | THREE.Material[]` - 材质对象或材质数组

##### `removeMaterial(material)`
从管理器移除材质。

**参数：**
- `material: THREE.Material | THREE.Material[]` - 要移除的材质

##### `getMaterialById(id)`
根据 ID 获取材质。

**参数：**
- `id: number` - 材质 ID

**返回：**
- `THREE.Material | undefined` - 找到的材质或 undefined

##### `setMaterialName(material, name)`
设置材质名称。

**参数：**
- `material: THREE.Material` - 材质对象
- `name: string` - 新名称

##### `getObjectMaterial(object, slot?)`
获取对象的材质。

**参数：**
- `object: THREE.Object3D` - 目标对象
- `slot?: number` - 材质槽位（用于多材质对象）

**返回：**
- `THREE.Material` - 材质对象

##### `setObjectMaterial(object, slot, newMaterial)`
设置对象的材质。

**参数：**
- `object: THREE.Object3D` - 目标对象
- `slot: number` - 材质槽位
- `newMaterial: THREE.Material` - 新材质

#### 相机管理

##### `addCamera(camera)`
添加相机到管理器。

**参数：**
- `camera: THREE.Camera` - 相机对象

##### `removeCamera(camera)`
从管理器移除相机。

**参数：**
- `camera: THREE.Camera` - 要移除的相机

##### `setViewportCamera(uuid)`
设置视口使用的相机。

**参数：**
- `uuid: string` - 相机的 UUID

#### 脚本管理

##### `addScript(object, script)`
为对象添加脚本。

**参数：**
- `object: THREE.Object3D` - 目标对象
- `script: Object` - 脚本对象

##### `removeScript(object, script)`
从对象移除脚本。

**参数：**
- `object: THREE.Object3D` - 目标对象
- `script: Object` - 要移除的脚本

#### 场景管理

##### `setScene(scene)`
设置编辑器场景。

**参数：**
- `scene: THREE.Scene` - 新场景对象

##### `clear()`
清空编辑器，重置所有状态。

##### `fromJSON(json)`
从 JSON 数据加载场景。

**参数：**
- `json: Object` - 场景 JSON 数据

**返回：**
- `Promise<void>`

##### `toJSON()`
将当前场景导出为 JSON 格式。

**返回：**
- `Object` - 场景 JSON 数据

#### 历史记录

##### `execute(cmd, optionalName?)`
执行命令并记录到历史。

**参数：**
- `cmd: Command` - 要执行的命令
- `optionalName?: string` - 可选的命令名称

##### `undo()`
撤销上一个操作。

##### `redo()`
重做下一个操作。

#### 查找方法

##### `objectByUuid(uuid)`
根据 UUID 查找对象。

**参数：**
- `uuid: string` - 对象 UUID

**返回：**
- `THREE.Object3D | undefined` - 找到的对象或 undefined

---

## Viewport 类

视口组件，提供 3D 场景的渲染和交互功能。

### 构造函数

```typescript
constructor(editor: Editor)
```

**参数：**
- `editor: Editor` - 编辑器实例

### 属性

- `dom: HTMLElement` - 视口的 DOM 元素

### 功能特性

- **WebGL 渲染** - 基于 THREE.WebGLRenderer
- **变换控制器** - 支持移动、旋转、缩放操作
- **网格辅助线** - 可视化参考网格
- **视图助手** - 坐标轴指示器
- **选择框** - 对象选择时的边界框显示
- **路径追踪** - 高质量渲染支持
- **XR 支持** - VR/AR 功能

### 交互功能

- 鼠标选择对象
- 拖拽文件加载
- 键盘快捷键支持
- 触摸设备支持

---

## Toolbar 类

工具栏组件，提供变换工具的 UI 控制。

### 构造函数

```typescript
constructor(editor: Editor)
```

**参数：**
- `editor: Editor` - 编辑器实例

### 属性

- `dom: HTMLElement` - 工具栏的 DOM 元素

### 工具按钮

#### 变换工具
- **移动工具 (Translate)** - 激活位置变换模式
- **旋转工具 (Rotate)** - 激活旋转变换模式
- **缩放工具 (Scale)** - 激活缩放变换模式

#### 坐标系切换
- **本地/世界坐标** - 切换变换坐标系

### 快捷键

- `W` - 切换到移动工具
- `E` - 切换到旋转工具
- `R` - 切换到缩放工具

---

## Player 类

3D 场景播放器，用于预览和运行场景。

### 构造函数

```typescript
constructor()
```

### 属性

- `dom: HTMLElement` - 播放器的 DOM 容器
- `canvas: HTMLCanvasElement` - 渲染画布
- `width: number` - 播放器宽度
- `height: number` - 播放器高度

### 方法

#### 场景加载

##### `load(json)`
加载场景数据。

**参数：**
- `json: Object` - 场景 JSON 数据

##### `setScene(scene)`
设置播放场景。

**参数：**
- `scene: THREE.Scene` - 场景对象

##### `setCamera(camera)`
设置播放相机。

**参数：**
- `camera: THREE.Camera` - 相机对象

#### 播放控制

##### `play()`
开始播放场景。

##### `stop()`
停止播放场景。

##### `setSize(width, height)`
设置播放器尺寸。

**参数：**
- `width: number` - 宽度
- `height: number` - 高度

#### 动画支持

##### `loadAnimations(animations)`
加载动画数据。

**参数：**
- `animations: Array` - 动画数组

播放器支持以下动画功能：
- 对象动画播放
- 动画混合器管理
- 动画时间控制

---

## History 类

历史记录管理器，实现撤销/重做功能。

### 构造函数

```typescript
constructor(editor: Editor)
```

**参数：**
- `editor: Editor` - 编辑器实例

### 属性

- `editor: Editor` - 编辑器引用
- `undos: Command[]` - 撤销命令栈
- `redos: Command[]` - 重做命令栈
- `historyDisabled: boolean` - 历史记录是否禁用

### 方法

##### `execute(cmd, optionalName?)`
执行命令并添加到历史记录。

**参数：**
- `cmd: Command` - 要执行的命令
- `optionalName?: string` - 可选命令名称

**特性：**
- 智能命令合并（相同类型的连续命令会合并）
- 时间窗口内的命令更新（500ms内的相同命令会更新而非新增）

##### `undo()`
撤销最后一个命令。

##### `redo()`
重做下一个命令。

##### `clear()`
清空所有历史记录。

##### `goToState(id)`
跳转到指定的历史状态。

**参数：**
- `id: number` - 历史状态 ID

##### `enableSerialization(enabled)`
启用/禁用历史记录序列化。

**参数：**
- `enabled: boolean` - 是否启用

---

## Selector 类

对象选择器，处理 3D 对象的选择逻辑。

### 构造函数

```typescript
constructor(editor: Editor)
```

**参数：**
- `editor: Editor` - 编辑器实例

### 方法

##### `select(object)`
选择指定对象。

**参数：**
- `object: THREE.Object3D | null` - 要选择的对象

##### `deselect()`
取消当前选择。

##### `getIntersects(raycaster)`
获取射线与场景的交点。

**参数：**
- `raycaster: THREE.Raycaster` - 射线投射器

**返回：**
- `Array` - 交点数组

##### `getPointerIntersects(point, camera)`
获取指针位置与场景的交点。

**参数：**
- `point: Object` - 屏幕坐标 {x, y}
- `camera: THREE.Camera` - 相机对象

**返回：**
- `Array` - 交点数组

---

## Config 类

配置管理器，处理编辑器设置和用户偏好。

### 构造函数

```typescript
constructor()
```

### 方法

##### `getKey(key)`
获取配置值。

**参数：**
- `key: string` - 配置键名

**返回：**
- `any` - 配置值

**示例：**
```typescript
const language = config.getKey('language');
const shadows = config.getKey('project/renderer/shadows');
```

##### `setKey(...args)`
设置配置值，支持批量设置。

**参数：**
- `...args` - 键值对：key1, value1, key2, value2, ...

**示例：**
```typescript
config.setKey('language', 'en');
config.setKey('project/renderer/shadows', true, 'autosave', false);
```

##### `clear()`
清空所有配置，恢复默认值。

### 默认配置

```typescript
{
  'language': 'zh',                           // 界面语言
  'autosave': true,                          // 自动保存
  'project/title': '',                       // 项目标题
  'project/editable': false,                 // 是否可编辑
  'project/vr': false,                       // VR 模式
  'project/renderer/antialias': true,        // 抗锯齿
  'project/renderer/shadows': true,          // 阴影
  'project/renderer/shadowType': 1,          // 阴影类型 (PCF)
  'project/renderer/toneMapping': 0,         // 色调映射 (NoToneMapping)
  'project/renderer/toneMappingExposure': 1, // 曝光度
  'settings/history': false,                 // 历史记录
  'settings/shortcuts/translate': 'w',       // 移动快捷键
  'settings/shortcuts/rotate': 'e',          // 旋转快捷键
  'settings/shortcuts/scale': 'r',           // 缩放快捷键
  'settings/shortcuts/undo': 'z',            // 撤销快捷键
  'settings/shortcuts/focus': 'f'            // 聚焦快捷键
}
```

---

## Loader 类

文件加载器，支持多种 3D 文件格式。

### 构造函数

```typescript
constructor(editor: Editor)
```

**参数：**
- `editor: Editor` - 编辑器实例

### 方法

##### `loadItemList(items)`
加载拖拽项目列表。

**参数：**
- `items: DataTransferItemList` - 拖拽项目列表

##### `loadFiles(files, filesMap?)`
加载文件列表。

**参数：**
- `files: FileList` - 文件列表
- `filesMap?: Object` - 文件映射（可选）

##### `loadFile(file, manager?)`
加载单个文件。

**参数：**
- `file: File` - 文件对象
- `manager?: THREE.LoadingManager` - 加载管理器（可选）

### 支持的文件格式

| 格式 | 描述 | 加载器 |
|------|------|--------|
| .3dm | Rhino 3D 模型 | Rhino3dmLoader |
| .3ds | 3D Studio 模型 | TDSLoader |
| .3mf | 3D 制造格式 | ThreeMFLoader |
| .amf | 增材制造格式 | AMFLoader |
| .dae | Collada 格式 | ColladaLoader |
| .drc | Draco 压缩几何 | DRACOLoader |
| .fbx | Autodesk FBX | FBXLoader |
| .gltf/.glb | glTF 格式 | GLTFLoader |
| .obj | Wavefront OBJ | OBJLoader |
| .ply | 多边形文件格式 | PLYLoader |
| .stl | 立体光刻格式 | STLLoader |
| .zip | 压缩文件 | 自动解压 |

---

## Command 类

命令模式的基类，所有可撤销操作的基础。

### 构造函数

```typescript
constructor(editor: Editor)
```

**参数：**
- `editor: Editor` - 编辑器实例

### 属性

- `id: number` - 命令 ID
- `inMemory: boolean` - 是否在内存中
- `updatable: boolean` - 是否可更新（用于命令合并）
- `type: string` - 命令类型
- `name: string` - 命令名称
- `editor: Editor` - 编辑器引用

### 方法

##### `execute()`
执行命令。需要在子类中实现。

##### `undo()`
撤销命令。需要在子类中实现。

##### `update(cmd)`
更新命令（用于命令合并）。可选实现。

**参数：**
- `cmd: Command` - 新命令

##### `toJSON()`
序列化命令为 JSON。

**返回：**
- `Object` - JSON 数据

##### `fromJSON(json)`
从 JSON 反序列化命令。

**参数：**
- `json: Object` - JSON 数据

---

## 命令系统

### 对象操作命令

#### AddObjectCommand
添加对象到场景。

```typescript
constructor(editor: Editor, object: THREE.Object3D)
```

#### RemoveObjectCommand  
从场景移除对象。

```typescript
constructor(editor: Editor, object: THREE.Object3D)
```

#### MoveObjectCommand
移动对象到新的父级。

```typescript
constructor(editor: Editor, object: THREE.Object3D, newParent: THREE.Object3D, newBefore?: THREE.Object3D)
```

### 变换命令

#### SetPositionCommand
设置对象位置。

```typescript
constructor(editor: Editor, object: THREE.Object3D, newPosition: THREE.Vector3, optionalOldPosition?: THREE.Vector3)
```

#### SetRotationCommand
设置对象旋转。

```typescript
constructor(editor: Editor, object: THREE.Object3D, newRotation: THREE.Euler, optionalOldRotation?: THREE.Euler)
```

#### SetScaleCommand
设置对象缩放。

```typescript
constructor(editor: Editor, object: THREE.Object3D, newScale: THREE.Vector3, optionalOldScale?: THREE.Vector3)
```

### 材质命令

#### SetMaterialCommand
设置对象材质。

```typescript
constructor(editor: Editor, object: THREE.Object3D, newMaterial: THREE.Material, materialSlot?: number)
```

#### SetMaterialColorCommand
设置材质颜色。

```typescript
constructor(editor: Editor, object: THREE.Object3D, attributeName: string, newValue: number, materialSlot?: number)
```

#### SetMaterialValueCommand
设置材质属性值。

```typescript
constructor(editor: Editor, object: THREE.Object3D, attributeName: string, newValue: any, materialSlot?: number)
```

### 几何体命令

#### SetGeometryCommand
设置对象几何体。

```typescript
constructor(editor: Editor, object: THREE.Object3D, newGeometry: THREE.BufferGeometry)
```

#### SetGeometryValueCommand
设置几何体属性值。

```typescript
constructor(editor: Editor, object: THREE.Object3D, attributeName: string, newValue: any)
```

### 脚本命令

#### AddScriptCommand
为对象添加脚本。

```typescript
constructor(editor: Editor, object: THREE.Object3D, script: Object)
```

#### RemoveScriptCommand
从对象移除脚本。

```typescript
constructor(editor: Editor, object: THREE.Object3D, script: Object)
```

#### SetScriptValueCommand
设置脚本属性值。

```typescript
constructor(editor: Editor, object: THREE.Object3D, script: Object, attributeName: string, newValue: any)
```

### 场景命令

#### SetSceneCommand
设置场景属性。

```typescript
constructor(editor: Editor, attributeName: string, newValue: any)
```

### 复合命令

#### MultiCmdsCommand
批量执行多个命令。

```typescript
constructor(editor: Editor, commands: Command[])
```

---

## 信号系统

编辑器使用基于观察者模式的信号系统进行组件间通信。

### 脚本相关信号

- `editScript` - 编辑脚本
- `scriptAdded` - 脚本已添加
- `scriptChanged` - 脚本已更改
- `scriptRemoved` - 脚本已移除

### 播放器相关信号

- `startPlayer` - 开始播放
- `stopPlayer` - 停止播放

### XR 相关信号

- `enterXR` - 进入 XR 模式
- `offerXR` - 提供 XR 功能
- `leaveXR` - 离开 XR 模式

### 通知信号

- `editorCleared` - 编辑器已清空
- `savingStarted` - 开始保存
- `savingFinished` - 保存完成

### 变换相关信号

- `transformModeChanged` - 变换模式已更改
- `snapChanged` - 吸附设置已更改
- `spaceChanged` - 坐标空间已更改

### 渲染器相关信号

- `rendererCreated` - 渲染器已创建
- `rendererUpdated` - 渲染器已更新
- `rendererDetectKTX2Support` - 检测 KTX2 支持

### 场景相关信号

- `sceneBackgroundChanged` - 场景背景已更改
- `sceneEnvironmentChanged` - 场景环境已更改
- `sceneFogChanged` - 场景雾效已更改
- `sceneFogSettingsChanged` - 雾效设置已更改
- `sceneGraphChanged` - 场景图已更改
- `sceneRendered` - 场景已渲染

### 相机相关信号

- `cameraChanged` - 相机已更改
- `cameraResetted` - 相机已重置
- `cameraAdded` - 相机已添加
- `cameraRemoved` - 相机已移除

### 对象相关信号

- `objectSelected` - 对象已选择
- `objectFocused` - 对象已聚焦
- `objectAdded` - 对象已添加
- `objectChanged` - 对象已更改
- `objectRemoved` - 对象已移除

### 几何体相关信号

- `geometryChanged` - 几何体已更改

### 材质相关信号

- `materialAdded` - 材质已添加
- `materialChanged` - 材质已更改
- `materialRemoved` - 材质已移除

### 辅助对象信号

- `helperAdded` - 辅助对象已添加
- `helperRemoved` - 辅助对象已移除

### 视口相关信号

- `viewportCameraChanged` - 视口相机已更改
- `viewportShadingChanged` - 视口着色已更改

### 界面相关信号

- `windowResize` - 窗口大小已更改
- `showHelpersChanged` - 辅助对象显示状态已更改
- `refreshSidebarObject3D` - 刷新侧边栏对象面板
- `refreshSidebarEnvironment` - 刷新侧边栏环境面板
- `historyChanged` - 历史记录已更改

### 交互信号

- `intersectionsDetected` - 检测到交点
- `pathTracerUpdated` - 路径追踪器已更新

### 信号使用示例

```typescript
// 监听对象选择
editor.signals.objectSelected.add((object) => {
  console.log('选中对象:', object?.name || 'null');
});

// 监听场景变化
editor.signals.sceneGraphChanged.add(() => {
  updateSceneTree();
});

// 监听材质变化
editor.signals.materialChanged.add((material) => {
  updateMaterialPanel(material);
});

// 监听历史记录变化
editor.signals.historyChanged.add((command) => {
  updateHistoryPanel();
});
```

---

## 使用模式

### 基本编辑流程

```typescript
// 1. 创建编辑器
const editor = new Editor();

// 2. 创建UI组件
const viewport = new Viewport(editor);
const toolbar = new Toolbar(editor);

// 3. 添加到DOM
document.body.appendChild(viewport.dom);
document.body.appendChild(toolbar.dom);

// 4. 初始化
editor.init();

// 5. 添加对象
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);

editor.execute(new AddObjectCommand(editor, mesh));

// 6. 选择对象
editor.select(mesh);

// 7. 修改属性
editor.execute(new SetPositionCommand(editor, mesh, new THREE.Vector3(1, 0, 0)));
```

### 事件驱动开发

```typescript
// 监听用户操作
editor.signals.objectSelected.add((object) => {
  if (object) {
    showPropertyPanel(object);
  } else {
    hidePropertyPanel();
  }
});

// 监听场景变化
editor.signals.sceneGraphChanged.add(() => {
  updateOutliner();
});

// 监听历史变化
editor.signals.historyChanged.add(() => {
  updateUndoRedoButtons();
});
```

### 自定义扩展

```typescript
// 自定义命令
class SetObjectNameCommand extends Command {
  constructor(editor, object, newName) {
    super(editor);
    this.type = 'SetObjectNameCommand';
    this.object = object;
    this.oldName = object.name;
    this.newName = newName;
  }
  
  execute() {
    this.object.name = this.newName;
    this.editor.signals.objectChanged.dispatch(this.object);
  }
  
  undo() {
    this.object.name = this.oldName;
    this.editor.signals.objectChanged.dispatch(this.object);
  }
}

// 使用自定义命令
editor.execute(new SetObjectNameCommand(editor, selectedObject, '新名称'));
```

---

## 最佳实践

### 1. 使用命令模式
所有修改操作都应该通过命令模式执行，以支持撤销/重做：

```typescript
// ✅ 正确做法
editor.execute(new SetPositionCommand(editor, object, newPosition));

// ❌ 错误做法
object.position.copy(newPosition);
```

### 2. 监听信号
使用信号系统保持UI与数据同步：

```typescript
editor.signals.objectSelected.add((object) => {
  updatePropertyPanel(object);
});
```

### 3. 资源管理
使用编辑器的资源管理器：

```typescript
// ✅ 正确做法
editor.addMaterial(material);

// ❌ 错误做法
editor.materials[material.uuid] = material;
```

### 4. 配置管理
使用配置系统存储用户偏好：

```typescript
// 保存用户设置
editor.config.setKey('myPlugin/enabled', true);

// 读取用户设置
const enabled = editor.config.getKey('myPlugin/enabled');
```

### 5. 错误处理
适当处理加载和操作错误：

```typescript
try {
  await editor.fromJSON(sceneData);
} catch (error) {
  console.error('场景加载失败:', error);
  showErrorMessage('无法加载场景文件');
}
``` 