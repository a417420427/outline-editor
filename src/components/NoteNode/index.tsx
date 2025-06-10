// NoteNode.tsx （主组件只负责切换和递归）
import { useState } from "react";
import { NoteNodeEditor } from "./NoteNodeEditor";
import { NoteNodeReadonly } from "./NoteNodeReadonly";
import NodeActionsBar from "./NodeActionsBar";
import { List, ChevronDown } from "lucide-react";
import "./index.scss";
import { useEditorStore } from "../../store";

export function NoteNode(props: NoteNodeProps) {
  const { nodeId, focuseId } = props;
  const [actionVisible, setActionVisible] = useState(false);

  const node = useEditorStore((state) => state.findNodeById(nodeId)!);
  const deleteNode = useEditorStore((state) => state.deleteNode);

  const onToggleExpandNode = useEditorStore(
    (state) => state.onToggleExpandNode
  );
  const onActionClick = (action: ActionType) => {
    switch (action) {
      case "delete":
        deleteNode(nodeId);
        break;
      default:
        console.warn("未处理的操作类型:", action);
        break;
    }
  };
  return (
    <div className="NoteNode">
      <div className="NoteNode-block">
        <div className="NoteNode-replace">
          {focuseId === nodeId && (
            <List
              onClick={() => setActionVisible(true)}
              size={12}
              cursor="pointer"
            />
          )}
          {focuseId === nodeId && actionVisible && (
            <NodeActionsBar onClick={onActionClick} actions={[]} />
          )}
        </div>

        <div className="NoteNode-replace">
          {focuseId === nodeId &&
          node &&
          node.children &&
          node.children.length > 0 ? (
            <ChevronDown style={{
              transform: !node.expand ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }} onClick={() => onToggleExpandNode(nodeId)} cursor="pointer" className="NoteNode-expand"></ChevronDown>
          ) : null}
        </div>
        <div className="NoteNode-icon" />

        {focuseId === nodeId ? (
          <NoteNodeEditor nodeId={nodeId} onTransaction={() => {}} />
        ) : (
          <NoteNodeReadonly nodeId={nodeId} />
        )}
      </div>
      <div className="indent" style={{ paddingLeft: 16 }}>
        {node &&
          node.children &&
          node.expand &&
          node.children.map((child) => (
            <NoteNode key={child.id} nodeId={child.id} focuseId={focuseId} />
          ))}
      </div>
    </div>
  );
}
