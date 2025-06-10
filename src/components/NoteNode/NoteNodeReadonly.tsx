import { DOMSerializer, Node as PMNode } from "prosemirror-model";
import { extendedSchema } from "../../schema/extendedSchema";
import { useEditorStore } from "../../store";
export function NoteNodeReadonly({
  nodeId,
}: {
  nodeId: string;
}) {

  const findNodeById = useEditorStore((state) => state.findNodeById);

  const html = renderContentToHTML(findNodeById(nodeId)!.content);

  const setFocusId = useEditorStore((state) => state.setFocusId);
  const setFocusOffset = useEditorStore((state) => state.setFocusOffset);
  return (
    <div
      className="NoteNode-readonly"
      contentEditable={false}
      onClick={() => {
        setFocusId(nodeId)

        // 这里可以添加其他逻辑，比如选中节点
        console.log(window.getSelection());
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const offset = range.startOffset;
          setFocusOffset(offset);
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderContentToHTML(content: any): string {
  const node = PMNode.fromJSON(extendedSchema, content);
  const fragment = DOMSerializer.fromSchema(extendedSchema).serializeFragment(
    node.content
  );

  const div = document.createElement("div");
  div.appendChild(fragment);

  return div.innerHTML;
}
