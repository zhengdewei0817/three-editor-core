import Base from './base';
import { Editor } from '../types';
import { SetValueCommand } from './../commands/SetValueCommand.js';

export default class Components extends Base {
    static async show(editor: Editor, uuid: string, type: string, data: any) {
        const object = Components.getInstanceByUUID(editor, uuid);
        console.log('ComponentsShow', object)
        if (object.visible !== true) {
            editor.execute(new SetValueCommand(editor, object, 'visible', true));
        }
    }
    static async hide(editor: Editor, uuid: string, type: string, data: any) {
        const object = Components.getInstanceByUUID(editor, uuid);
        console.log('ComponentsHide', object)
        if (object.visible !== false) {
            editor.execute(new SetValueCommand(editor, object, 'visible', false));
        }
    }
    static async toggle(editor: Editor, uuid: string, type: string, data: any) {
        const object = Components.getInstanceByUUID(editor, uuid);
        console.log('ComponentsToggle', object)
        if (object.visible !== true) {
            editor.execute(new SetValueCommand(editor, object, 'visible', true));
        } else {
            editor.execute(new SetValueCommand(editor, object, 'visible', false));
        }
    }
}