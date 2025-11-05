import * as THREE from "three";
import { Editor } from "../Editor";
import { AddObjectCommand } from "../commands/AddObjectCommand";

interface ModelConfig {
  name: string;
  id: string;
  type: string;
  config: {
    props: {
      url: string;
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
  });
  console.log(model);
  model.forEach((item) => {
    // @ts-ignore
    item.uuid = name;
    editor.execute(new AddObjectCommand(editor, item));
  });

  return model;
}
