import * as THREE from 'three';

export class Editor {
  // 信号系统
  signals: {
    // script
    scriptAdded: any;
    scriptRemoved: any;
    scriptChanged: any;
    
    // player
    startPlayer: any;
    stopPlayer: any;
    
    // notifications
    showNotification: any;
    
    // scene
    sceneBackgroundChanged: any;
    sceneEnvironmentChanged: any;
    sceneFogChanged: any;
    sceneGraphChanged: any;
    
    // object
    objectAdded: any;
    objectChanged: any;
    objectFocused: any;
    objectRemoved: any;
    objectSelected: any;
    
    // geometry
    geometryChanged: any;
    
    // material
    materialAdded: any;
    materialChanged: any;
    materialRemoved: any;
    
    // texture
    textureChanged: any;
    
    // camera
    cameraAdded: any;
    cameraRemoved: any;
    cameraChanged: any;
    
    // viewport
    viewportCameraChanged: any;
    viewportShadingChanged: any;
    
    // transform
    transformModeChanged: any;
    snapChanged: any;
    spaceChanged: any;
    
    // history
    historyChanged: any;
    
    // refresh
    refreshSidebarObject3D: any;
    refreshSidebarEnvironment: any;
  };

  // 核心属性
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  
  // 配置和工具
  config: any;
  history: any;
  strings: any;
  storage: any;
  loader: any;
  selector: any;

  constructor();
  
  // 核心方法
  addObject(object: THREE.Object3D, parent?: THREE.Object3D, index?: number): void;
  moveObject(object: THREE.Object3D, parent: THREE.Object3D, before?: THREE.Object3D): void;
  nameObject(object: THREE.Object3D, name: string): void;
  removeObject(object: THREE.Object3D): void;
  addGeometry(geometry: THREE.BufferGeometry): void;
  setGeometryName(geometry: THREE.BufferGeometry, name: string): void;
  addMaterial(material: THREE.Material): void;
  setMaterialName(material: THREE.Material, name: string): void;
  addTexture(texture: THREE.Texture): void;
  setTextureName(texture: THREE.Texture, name: string): void;
  addCamera(camera: THREE.Camera): void;
  removeCamera(camera: THREE.Camera): void;
  
  // 选择相关
  select(object: THREE.Object3D | null): void;
  selectById(id: number): void;
  selectByUuid(uuid: string): void;
  deselect(): void;
  focus(object: THREE.Object3D): void;
  focusById(id: number): void;
  focusByUuid(uuid: string): void;
  
  // 查找方法
  objectByUuid(uuid: string): THREE.Object3D | undefined;
  objectById(id: number): THREE.Object3D | undefined;
  materialByUuid(uuid: string): THREE.Material | undefined;
  
  // 场景管理
  setScene(scene: THREE.Scene): void;
  clear(): void;
  fromJSON(json: any): void;
  toJSON(): any;
  
  // 视口相关
  setViewportCamera(camera: THREE.Camera): void;
  setViewportShading(shading: string): void;
}

// 为全局对象提供类型声明
declare global {
  interface Window {
    THREE: typeof THREE;
  }
} 