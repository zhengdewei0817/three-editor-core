import { Editor } from '../types';

export default class Base {
   static getInstanceByUUID(editor: Editor, uuid: string) {
    const object = editor.objectByUuid(uuid);
    return object;
   }
}