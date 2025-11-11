import * as THREE from "three";
import { SetPositionCommand } from "../commands/SetPositionCommand.js";
import { SetRotationCommand } from "../commands/SetRotationCommand.js";
import { SetScaleCommand } from "../commands/SetScaleCommand.js";
import { SetMaterialColorCommand } from "../commands/SetMaterialColorCommand.js";
import { SetMaterialValueCommand } from "../commands/SetMaterialValueCommand.js";

import { CSS3DSprite } from "../jsm/renderers/CSS3DRenderer.js";
interface MeshConfig {
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
      showrHide?: boolean;
      width?: number;
      height?: number;
      depth?: number;
      color?: string;
      transparent?: boolean;
      opacity?: number;
    };
  };
}

export function createMesh(name: string, options: MeshConfig) {
  const props = options.config.props || {};
  const width = props.width || 1;
  const height = props.height || 1;
  const depth = props.depth || 1;
  const color = props.color || 0xffffff;
  const cubeGeometry = new THREE.BoxGeometry(width, height, depth);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
  });
  const object = new THREE.Mesh(cubeGeometry, cubeMaterial);
  object.userData.elementId = name;
  object.uuid = name;
  	
  // // 创建测试 CSS3D 元素
  // const element = document.createElement('div');
  // element.style.backgroundColor = 'red';
  // element.textContent = '123123';
  
  // // 创建 CSS3DSprite 并添加到场景
  // const sprite = new CSS3DSprite(element);
  // sprite.position.set(object.position.x, object.position.y+2, object.position.z);
  // sprite.scale.set(0.1, 0.1, 0.1);
  // object.add(sprite);

  return object;
}

export function setProps(object: THREE.Mesh, key: string, value: any, editor) {
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
      console.log(newPosition);
      editor.execute(new SetPositionCommand(editor, object, newPosition));
    }
    return;
  }
  if (/rotation/.test(key)) {
    let rotationX = object.rotation.x;
    let rotationY = object.rotation.y;
    let rotationZ = object.rotation.z;
    if (/rotationX/.test(key)) {
      rotationX = value;
    }
    if (/rotationY/.test(key)) {
      rotationY = value;
    }
    if (/rotationZ/.test(key)) {
      rotationZ = value;
    }
    const newRotation = new THREE.Euler( rotationX * THREE.MathUtils.DEG2RAD, rotationY * THREE.MathUtils.DEG2RAD, rotationZ * THREE.MathUtils.DEG2RAD );

    if ( new THREE.Vector3().setFromEuler( object.rotation ).distanceTo( new THREE.Vector3().setFromEuler( newRotation ) ) >= 0.01 ) {
        editor.execute( new SetRotationCommand( editor, object, newRotation ) );

    }
    return;
  }
  if (/scale/.test(key)) {
    let scaleX = object.scale.x;
    let scaleY = object.scale.y;
    let scaleZ = object.scale.z;
    if (/scaleX/.test(key)) {
      scaleX = value;
    }
    if (/scaleY/.test(key)) {
      scaleY = value;
    }
    if (/scaleZ/.test(key)) {
      scaleZ = value;
    }
    const newScale = new THREE.Vector3( scaleX, scaleY, scaleZ );
    if ( object.scale.distanceTo( newScale ) >= 0.01 ) {

        editor.execute( new SetScaleCommand( editor, object, newScale ) );

    }
  }
  if (/color/.test(key)) {
    const newColor = new THREE.Color(value);
    if ( object.material.color !== undefined && object.material.color.getHex() !== newColor.getHex() ) {
        console.log(newColor);
        editor.execute( new SetMaterialColorCommand( editor, object, 'color', newColor.getHex() ) );
    }
    return;
  }
  if (/transparent/.test(key)) {
    object.material.transparent = value;
    editor.execute( new SetMaterialValueCommand( editor, object, 'transparent', value ) );
    return;
  }
  if (/opacity/.test(key)) {
    object.material.opacity = value;
    editor.execute( new SetMaterialValueCommand( editor, object, 'opacity', value ) );
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
        color: `#${object.material.color.getHexString()}`,
        transparent: object.material.transparent,
        opacity: object.material.opacity,
    };
    return res;

}