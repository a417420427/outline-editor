// NoteNodeEditor.tsx

import { useProseMirrorEditor } from "./useProseMirrorEditor";
import FloatingToolbar from "./FloatingToolbar";
import { Node as PMNode } from "prosemirror-model";

import type { Selection } from "prosemirror-state";
import { useEditorStore } from "../../store";
import { extendedSchema } from "../../schema/extendedSchema";
import { toggleMark } from "prosemirror-commands";
import type { MarkActionType } from "types/markActions";
export type ProseMirrorSelectionJSON = ReturnType<Selection["toJSON"]>;

export type ProseMirrorJSON = ReturnType<PMNode["toJSON"]>;

export function NoteNodeEditor({
  nodeId,
}: {
  nodeId: string;
  onTransaction: (
    docJSON: ProseMirrorJSON,
    selection: ProseMirrorSelectionJSON
  ) => void;
}) {
  const findNodeById = useEditorStore((state) => state.findNodeById);

  const { editorRef, selectionCoords } = useProseMirrorEditor({
    docJSON: findNodeById(nodeId)?.content,
    nodeId,
  });

  // 格式化函数放这里或提升出去
  const editView = useEditorStore((state) => state.editorView);
  const handleFormat = (type: MarkActionType, payload?: string) => {
    if (!editView) return;
    const view = editView;
    const markType = extendedSchema.marks[type];
    if (!markType || !view) return;
    const { from, to, empty } = view.state.selection;
    const tr = view.state.tr;

    switch (type) {
      case "link":
        tr.addMark(from, to, markType.create({ href: payload }));
        view.dispatch(tr);
        view.focus();
        break;
      case "color":
        if (!empty) {
          toggleMark(markType, { color: payload })(
            view.state,
            editView.dispatch
          );
          editView.focus();
        } else {
          // 可选：处理 collapsed selection（比如下次输入生效）
          console.warn("空选择，颜色 mark 未应用");
        }
        view.focus();
        break;
      default:
        toggleMark(markType)(view.state, view.dispatch);
        view.focus();
        break;
    }
  };

  return (
    <>
      <div ref={editorRef} className="NoteNode-content" />
      {selectionCoords && (
        <FloatingToolbar
          top={selectionCoords.top}
          left={selectionCoords.left}
          onFormat={handleFormat}
        />
      )}
    </>
  );
}
