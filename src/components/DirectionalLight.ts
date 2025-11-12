import * as THREE from "three";
import { Editor } from "../Editor";
import { AddObjectCommand } from "../commands/AddObjectCommand.js";
import { SetPositionCommand } from "../commands/SetPositionCommand.js";
import { SetColorCommand } from "../commands/SetColorCommand.js";
import { SetValueCommand } from "../commands/SetValueCommand.js";

interface DirectionalLightConfig {
  name: string;
  id: string;
  type: string;
  config: {
    props: {
      positionX?: number;
      positionY?: number;
      positionZ?: number;
      color?: string;
      intensity?: number;
    }
  };
}

export function createDirectionalLight(name: string, options: DirectionalLightConfig, editor: Editor) {
  const props = options.config.props || {};
  const positionX = props.positionX || 0;
  const positionY = props.positionY || 0;
  const positionZ = props.positionZ || 0;
  const color = props.color || "#ffffff";
  const intensity = props.intensity || 1;
  const directionalLight = new THREE.DirectionalLight(new THREE.Color(color), intensity);
  directionalLight.position.set(positionX, positionY, positionZ);   
  directionalLight.name = name;
  directionalLight.uuid = name;
  directionalLight.castShadow = true; // 必须开启！
  Object.keys(options.config.props).forEach(key => {
    options.config.props[key];
    setProps(directionalLight, key, options.config.props[key], editor);
  });
  editor.execute(new AddObjectCommand(editor, directionalLight));
}

export function setProps(object: THREE.DirectionalLight, key: string, value: any, editor: Editor) {
  if (/position/.test(key)) {
    let positionX = object.position.x;
    let positionY = object.position.y;
    let positionZ = object.position.z;
    if (/positionX/.test(key)) {
      positionX = value;
    }
    if (/positionY/.test(key)) {
      positionY = value;
    }
    if (/positionZ/.test(key)) {
      positionZ = value;
    }
    const newPosition = new THREE.Vector3(positionX, positionY, positionZ);
    if (object.position.distanceTo(newPosition) >= 0.01) {
      editor.execute(new SetPositionCommand(editor, object, newPosition));
    }
    return;
  }
  if (/color/.test(key)) {
    const newColor = new THREE.Color(value);
    if (object.color.getHex() !== newColor.getHex()) {
      editor.execute(new SetColorCommand(editor, object, 'color', newColor.getHex()));
    }
    return;
  }
  if (/intensity/.test(key)) {
    if (object.intensity !== undefined && Math.abs( object.intensity - value ) >= 0.01 ) {
      editor.execute(new SetValueCommand(editor, object, 'intensity', value));
    }
    return;
  }
}   

export function updataUI(object: THREE.DirectionalLight) {
  return {
    positionX: object.position.x,
    positionY: object.position.y,
    positionZ: object.position.z,
    color: `#${object.color.getHexString()}`,
    intensity: object.intensity,
  };
}