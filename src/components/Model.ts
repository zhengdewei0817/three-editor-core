import * as THREE from "three";
import { Editor } from "../Editor";
import { AddObjectCommand } from "../commands/AddObjectCommand";
import { SetPositionCommand } from "../commands/SetPositionCommand";
import { SetRotationCommand } from "../commands/SetRotationCommand";
import { SetScaleCommand } from "../commands/SetScaleCommand";
import { SetMaterialColorCommand } from "../commands/SetMaterialColorCommand";
import { SetMaterialValueCommand } from "../commands/SetMaterialValueCommand";
interface ModelConfig {
  name: string;
  id: string;
  type: string;
  config: {
    props: {
      url: {
        fileUrl: string;
        fileName: string;
      };
    };
  };
}

export async function createModel(
  name: string,
  options: ModelConfig,
  editor: Editor
) {
  const props = options.config.props || ({} as ModelConfig["config"]["props"]);
  const url = props.url;
  console.log(url);
  const model = await editor.loader.loadByUrls([url], {
    getModel: true,
  }, () => {}, (e) => {
    console.log(e);
  }, {
    disabledSelect: true,
  });
  console.log(model);
  
  model.forEach((item) => {
    // @ts-ignore
    item.uuid = name;
    item.url = url;
    Object.keys(options.config.props).forEach(key => {
      options.config.props[key];
      setProps(item, key, options.config.props[key], editor);
    });
    editor.execute(new AddObjectCommand(editor, item));
  });
  return model;
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
      url:object.url,
  };
  console.log('res', res)
  return res;

}