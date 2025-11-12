import * as THREE from "three";
import { Editor } from "../Editor";
import { AddObjectCommand } from "../commands/AddObjectCommand.js";
import { SetPositionCommand } from "../commands/SetPositionCommand.js";
import { SetColorCommand } from "../commands/SetColorCommand.js";
import { SetValueCommand } from "../commands/SetValueCommand.js";


interface AmbientLightConfig {
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
    };
  };
}

export function createAmbientLight(name: string, options: AmbientLightConfig, editor: Editor) {
  const props = options.config.props || {};
  const positionX = props.positionX || 0;
  const positionY = props.positionY || 0;
  const positionZ = props.positionZ || 0;
  const color = props.color || "#ffffff";
  const intensity = props.intensity || 1;
  const ambientLight = new THREE.AmbientLight(new THREE.Color(color), intensity);
  ambientLight.position.set(positionX, positionY, positionZ);
  ambientLight.name = name;
  ambientLight.uuid = name;
  Object.keys(options.config.props).forEach(key => {
    options.config.props[key];
    setProps(ambientLight, key, options.config.props[key], editor);
  });
  editor.execute(new AddObjectCommand(editor, ambientLight));
}

export function setProps(object: THREE.AmbientLight, key: string, value: any, editor: Editor) {
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

export function updataUI(object: THREE.AmbientLight) {
  return {
    positionX: object.position.x,
    positionY: object.position.y,
    positionZ: object.position.z,
    color: `#${object.color.getHexString()}`,
    intensity: object.intensity,
  };
}