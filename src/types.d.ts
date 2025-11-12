import * as THREE from "three";

// 信号类型定义
interface Signal {
  add(listener: Function): void;
  remove(listener: Function): void;
  dispatch(...args: any[]): void;
  active?: boolean;
}

export class Editor {
  // 信号系统
  signals: {
    // script
    editScript: Signal;
    scriptAdded: Signal;
    scriptChanged: Signal;
    scriptRemoved: Signal;

    // player
    startPlayer: Signal;
    stopPlayer: Signal;

    // xr
    enterXR: Signal;
    offerXR: Signal;
    leaveXR: Signal;

    // notifications
    editorCleared: Signal;
    savingStarted: Signal;
    savingFinished: Signal;

    // transform
    transformModeChanged: Signal;
    snapChanged: Signal;
    spaceChanged: Signal;

    // renderer
    rendererCreated: Signal;
    rendererUpdated: Signal;
    rendererDetectKTX2Support: Signal;

    // scene
    sceneBackgroundChanged: Signal;
    sceneEnvironmentChanged: Signal;
    sceneFogChanged: Signal;
    sceneFogSettingsChanged: Signal;
    sceneGraphChanged: Signal;
    sceneRendered: Signal;

    // camera
    cameraChanged: Signal;
    cameraResetted: Signal;
    cameraAdded: Signal;
    cameraRemoved: Signal;

    // geometry
    geometryChanged: Signal;

    // object
    objectSelected: Signal;
    objectFocused: Signal;
    objectAdded: Signal;
    objectChanged: Signal;
    objectRemoved: Signal;

    // helper
    helperAdded: Signal;
    helperRemoved: Signal;

    // material
    materialAdded: Signal;
    materialChanged: Signal;
    materialRemoved: Signal;

    // window
    windowResize: Signal;

    // helpers
    showHelpersChanged: Signal;

    // refresh
    refreshSidebarObject3D: Signal;
    refreshSidebarEnvironment: Signal;

    // history
    historyChanged: Signal;

    // viewport
    viewportCameraChanged: Signal;
    viewportShadingChanged: Signal;

    // intersections
    intersectionsDetected: Signal;

    // pathtracer
    pathTracerUpdated: Signal;

    // schema
    updataSchema: Signal;
  };

  // 数据属性
  data: Record<string, any>;
  oloData: Record<string, any>;
  controlsCenter?: THREE.Vector3;

  // 核心属性
  scene: THREE.Scene;
  camera: THREE.Camera;
  sceneHelpers: THREE.Scene;

  // 配置和工具
  config: any;
  history: any;
  selector: any;
  storage: any;
  strings: any;
  loader: any;

  // 资源管理
  object: Record<string, any>;
  geometries: Record<string, THREE.BufferGeometry>;
  materials: Record<string, THREE.Material>;
  textures: Record<string, THREE.Texture>;
  scripts: Record<string, any[]>;

  // 材质引用计数器
  materialsRefCounter: Map<THREE.Material, number>;

  // 动画混合器
  mixer: THREE.AnimationMixer;

  // 选择相关
  selected: THREE.Object3D | null;
  helpers: Record<number, any>;

  // 相机管理
  cameras: Record<string, THREE.Camera>;

  // 视口相关
  viewportCamera: THREE.Camera;
  viewportShading: string;

  constructor(options: {
    useCSS3D?: boolean;
    markFactory?: (
      editor: Editor,
      uuid: string,
      type: string,
      params: any
    ) => any;
    callback?: (editor: Editor) => void;
    isPlayer?: boolean;
  });
  cssRenderer: CSS3DRenderer | null;

  // 事件监听
  addEvent(): void;

  // 场景管理
  setScene(scene: THREE.Scene): void;
  clear(): void;
  clearObjects(): void;
  fromJSON(json: any): Promise<void>;
  toJSON(): any;

  // 对象管理
  addObject(
    object: THREE.Object3D,
    parent?: THREE.Object3D,
    index?: number
  ): void;
  nameObject(object: THREE.Object3D, name: string): void;
  removeObject(object: THREE.Object3D): void;

  // 几何体管理
  addGeometry(geometry: THREE.BufferGeometry): void;
  setGeometryName(geometry: THREE.BufferGeometry, name: string): void;

  // 材质管理
  addMaterial(material: THREE.Material | THREE.Material[]): void;
  addMaterialToRefCounter(material: THREE.Material): void;
  removeMaterial(material: THREE.Material | THREE.Material[]): void;
  removeMaterialFromRefCounter(material: THREE.Material): void;
  getMaterialById(id: number): THREE.Material | undefined;
  setMaterialName(material: THREE.Material, name: string): void;
  getObjectMaterial(object: THREE.Object3D, slot?: number): THREE.Material;
  setObjectMaterial(
    object: THREE.Object3D,
    slot: number | undefined,
    newMaterial: THREE.Material
  ): void;

  // 纹理管理
  addTexture(texture: THREE.Texture): void;
  addSkyToScene(
    hdrPath: string,
    options?: { height?: number; radius?: number }
  ): void;
  removeSkyFromScene(): void;
  // 相机管理
  addCamera(camera: THREE.Camera): void;
  setCamera(cameraOptions: any): void;
  removeCamera(camera: THREE.Camera): void;

  // 辅助对象管理
  addHelper(object: THREE.Object3D, helper?: any): void;
  removeHelper(object: THREE.Object3D): void;

  // 脚本管理
  addScript(object: THREE.Object3D, script: any): void;
  removeScript(object: THREE.Object3D, script: any): void;

  // 视口相关
  setViewportCamera(uuid: string): void;
  setViewportShading(value: string): void;

  // 选择相关
  select(object: THREE.Object3D | null): void;
  selectById(id: number): void;
  selectByUuid(uuid: string): void;
  deselect(): void;
  focus(object: THREE.Object3D | undefined): void;
  focusById(id: number): void;

  // 查找方法
  objectByUuid(uuid: string): THREE.Object3D | undefined;

  // 历史记录
  execute(cmd: any, optionalName?: string): void;
  undo(): void;
  redo(): void;

  // 工具方法
  utils: {
    save(blob: Blob, filename?: string): void;
    saveArrayBuffer(buffer: ArrayBuffer, filename?: string): void;
    saveString(text: string, filename?: string): void;
    formatNumber(number: number): string;
  };

  // 初始化和销毁
  init(options: { width?: number; height?: number }): void;
  destroy(): void;

  // 数据管理
  setData(
    data: any,
    options?: { mergeUpdate?: boolean },
    callback?: () => void
  ): void;
  diffData(
    data: any,
    oldData: any,
    isRoot?: boolean,
    rootName?: string,
    rootData?: any
  ): any;
  _updateByField(
    rootName: string,
    key: string,
    newVal: any,
    oldVal: any,
    rootData: any
  ): void;
  _addByData(name: string, value: any): void;

  // 方法调用
  callFun(
    methodName: string,
    targetUUID: string,
    type: string,
    data: any
  ): Promise<void>;
}

// 为全局对象提供类型声明
declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

// 方法 API 事件常量类型定义
export const METHODSAPI_EVENTS: {
  readonly CAMERA: {
    readonly GET_MAIN_CAMERA: "Camera";
    readonly FLY_CAMERA_TO: "CameraFlyCameraTo";
  };
  readonly COMPONENTS: {
    readonly SHOW: "ComponentsShow";
    readonly HIDDEN: "ComponentsHidden";
    readonly TOGGLE: "ComponentsToggle";
  };
};
