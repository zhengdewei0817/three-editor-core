import * as THREE from "three";
import { Editor } from "../Editor";
import { AddObjectCommand } from "../commands/AddObjectCommand";
import { SetPositionCommand } from "../commands/SetPositionCommand";
import { SetRotationCommand } from "../commands/SetRotationCommand";
import { SetScaleCommand } from "../commands/SetScaleCommand";
import { SetValueCommand } from "../commands/SetValueCommand";

interface CameraConfig {
  name: string;
  id: string;
  type: string;
  config: {
    props: {
      positionX?: number;
      positionY?: number;
      positionZ?: number;
      rotationX?: number;
      rotationY?: number;
      rotationZ?: number;
      scaleX?: number;
      scaleY?: number;
      scaleZ?: number;
      fov?: number;
      aspect?: number;
      near?: number;
      far?: number;
    };
  };
}

export function createCamera(
  name: string,
  options: CameraConfig,
  editor: Editor
) {
  const camera = editor.camera;
  Object.keys(options.config.props).forEach((key) => {
    options.config.props[key];
    setProps(camera, key, options.config.props[key], editor);
  });
}

export function setProps(object: THREE.Mesh, key: string, value: any, editor) {
  if (/position/.test(key)) {
    let positionX = value.x;
    let positionY = value.y;
    let positionZ = value.z;
    // if (/positionX/.test(key)) {
    //   positionX = value;
    // }
    // if (/positionY/.test(key)) {
    //   positionY = value;
    // }
    // if (/positionZ/.test(key)) {
    //   positionZ = value;
    // }
    const newPosition = new THREE.Vector3(positionX, positionY, positionZ);
    if (object.position.distanceTo(newPosition) >= 0.01) {
      console.log(newPosition);
      editor.execute(new SetPositionCommand(editor, object, newPosition));
    }
    return;
  }
  if (/rotation/.test(key)) {
    let rotationX = value._x;
    let rotationY = value._y;
    let rotationZ = value._z;
    const newRotation = new THREE.Euler(
      rotationX,
      rotationY,
      rotationZ
    );

    if (
      new THREE.Vector3()
        .setFromEuler(object.rotation)
        .distanceTo(new THREE.Vector3().setFromEuler(newRotation)) >= 0.01
    ) {
      editor.execute(new SetRotationCommand(editor, object, newRotation));
    }
    return;
  }
  if (/scale/.test(key)) {
    let scaleX = value.x;
    let scaleY = value.y;
    let scaleZ = value.z;
    const newScale = new THREE.Vector3(scaleX, scaleY, scaleZ);
    if (object.scale.distanceTo(newScale) >= 0.01) {
      editor.execute(new SetScaleCommand(editor, object, newScale));
    }
  }
  if (/fov/.test(key)) {
    object.fov = value;
    editor.execute(new SetValueCommand(editor, object, 'fov', value));
    return;
  }
  if (/near/.test(key)) {
    object.near = value;
    editor.execute(new SetValueCommand(editor, object, 'near', value));
    return;
  }
  if (/far/.test(key)) {
    object.far = value;
    editor.execute(new SetValueCommand(editor, object, 'far', value));
    return;
  }
}

export function updataUI(object) {
  const res = {
    positionX: object.position.x,
    positionY: object.position.y,
    positionZ: object.position.z,
    rotationX: object.rotation.x * THREE.MathUtils.RAD2DEG,
    rotationY: object.rotation.y * THREE.MathUtils.RAD2DEG,
    rotationZ: object.rotation.z * THREE.MathUtils.RAD2DEG,
    scaleX: object.scale.x,
    scaleY: object.scale.y,
    scaleZ: object.scale.z,
    fov: object.fov,
    near: object.near,
    far: object.far,
  };
  console.log('res', res);
  return res;
}
