import camera from './camera';
import components from './components';

export default {
  Camera: camera,
  CameraFlyCameraTo: camera.flyCameraTo,
  CameraFlyToModel: camera.flyToModel,
  ComponentsShow: components.show,
  ComponentsHidden: components.hide,
  ComponentsToggle: components.toggle,
}

// 导出方法事件常量，用于 callFun 方法
export const METHODSAPI_EVENTS = {
    CAMERA: {
        GET_MAIN_CAMERA: 'Camera',
        FLY_CAMERA_TO: 'CameraFlyCameraTo',
        FLY_TO_MODEL: 'CameraFlyToModel',
    },
    COMPONENTS: {
        SHOW: 'ComponentsShow',
        HIDDEN: 'ComponentsHidden',
        TOGGLE: 'ComponentsToggle',
    },
} as const;