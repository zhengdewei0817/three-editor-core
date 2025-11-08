import { Editor } from "./Editor";
import { RemoveObjectCommand } from './commands/RemoveObjectCommand.js';


export function SidebarSettingsShortcuts(editor: Editor) {
  const strings = editor.strings;

  const IS_MAC = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  function isValidKeyBinding(key) {
    return key.match(/^[A-Za-z0-9]$/i); // Can't use z currently due to undo/redo
  }

  const config = editor.config;
  const signals = editor.signals;

  editor.renderer.domElement.addEventListener("keydown", function (event) {
    switch (event.key.toLowerCase()) {
      case "backspace":
        event.preventDefault(); // prevent browser back

      // fall-through

      case "delete":
        const object = editor.selected;

        if (object === null) return;

        const parent = object.parent;
        if (parent !== null)
          editor.execute(new RemoveObjectCommand(editor, object));

        break;

      case config.getKey("settings/shortcuts/translate"):
        signals.transformModeChanged.dispatch("translate");

        break;

      case config.getKey("settings/shortcuts/rotate"):
        signals.transformModeChanged.dispatch("rotate");

        break;

      case config.getKey("settings/shortcuts/scale"):
        signals.transformModeChanged.dispatch("scale");

        break;

      case config.getKey("settings/shortcuts/undo"):
        if (IS_MAC ? event.metaKey : event.ctrlKey) {
          event.preventDefault(); // Prevent browser specific hotkeys

          if (event.shiftKey) {
            editor.redo();
          } else {
            editor.undo();
          }
        }

        break;

      case config.getKey("settings/shortcuts/focus"):
        if (editor.selected !== null) {
          editor.focus(editor.selected);
        }

        break;
    }
  });
}
