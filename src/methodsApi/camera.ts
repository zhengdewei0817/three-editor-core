import * as THREE from "three";
import TWEEN from "three/addons/libs/tween.module.js";
import { Editor } from "../types";
import Base from "./base";

export default class Camera extends Base {
  static async getMainCamera(
    editor: Editor,
    uuid: string,
    type: string,
    data: any
  ) {
    return editor.camera;
  }

  /**
   * 平滑飞行到指定位置，并始终朝向 lookAtPos
   */
  static async flyCameraTo(
    editor: Editor,
    uuid: string,
    type: string,
    data: {
      targetPos: { x: number; y: number; z: number };
      lookAtPos: { x: number; y: number; z: number };
      duration?: number;
      onComplete?: () => void;
    }
  ): Promise<void> {
    console.log("flyCameraTo", data);
    return new Promise((resolve) => {
      const camera = editor.camera;
      const { targetPos, lookAtPos, duration = 2000, onComplete } = data;

      const targetPosition = new THREE.Vector3(
        targetPos.x,
        targetPos.y,
        targetPos.z
      );
      const lookAtPosition = new THREE.Vector3(
        lookAtPos.x,
        lookAtPos.y,
        lookAtPos.z
      );

      const startPos = camera.position.clone();

      const tweenObj = { t: 0 };
      new TWEEN.Tween(tweenObj)
        .to({ t: 1 }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          // 插值位置
          const currentPos = new THREE.Vector3().lerpVectors(
            startPos,
            targetPosition,
            tweenObj.t
          );
          camera.position.copy(currentPos);

          // 始终朝向目标点
          camera.lookAt(lookAtPosition);

          // 通知渲染更新
          editor.signals.cameraChanged.dispatch(camera);
        })
        .onComplete(() => {
          camera.position.copy(targetPosition);
          camera.lookAt(lookAtPosition);
          if (editor.controlsCenter) {
            editor.controlsCenter.copy(lookAtPosition);
          }

          editor.signals.cameraChanged.dispatch(camera);
          if (onComplete) onComplete();
          resolve();
        })
        .start();
    });
  }

  static async flyToModel(
    editor: Editor,
    uuid: string,
    type: string,
    data: {
      targetUuid: string;
      duration?: number;
      onComplete?: () => void;
    }
  ): Promise<void> {
    console.log("flyToModel", data);
    return new Promise((resolve) => {
      const camera = editor.camera;
      const { targetUuid, duration = 2000, onComplete } = data;
      const target = editor.objectByUuid(targetUuid);
      if (!target) {
        return;
      }
      const targetPosition = target.position
        .clone()
        .add(new THREE.Vector3(0, 10, 10));
      const targetLookAt = target.position.clone();
      const startPos = camera.position.clone();

      const tweenObj = { t: 0 };
      new TWEEN.Tween(tweenObj)
        .to({ t: 1 }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          const currentPos = new THREE.Vector3().lerpVectors(
            startPos,
            targetPosition,
            tweenObj.t
          );
          camera.position.copy(currentPos);
          camera.lookAt(targetLookAt);
          editor.signals.cameraChanged.dispatch(camera);

        })
        .onComplete(() => {
          camera.position.copy(targetPosition);
          camera.lookAt(targetLookAt);
          if (editor.controlsCenter) {
            editor.controlsCenter.copy(targetLookAt);
          }
          editor.signals.cameraChanged.dispatch(camera);

          if (onComplete) onComplete();
          resolve();
        })
        .start();
    });
  }
}
