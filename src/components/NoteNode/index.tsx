// NoteNode.tsx （主组件只负责切换和递归）
import { useState } from "react";
import { NoteNodeEditor } from "./NoteNodeEditor";
import { NoteNodeReadonly } from "./NoteNodeReadonly";
import NodeActionsBar from "./NodeActionsBar";
import { List } from "lucide-react";
import "./index.scss";
import { useOutlineStore } from "../../store";

export function NoteNode(props: NoteNodeProps) {
  const { nodeId, focuseId } = props;
  const [actionVisible, setActionVisible] = useState(false);


  const node = useOutlineStore((state) => state.findNodeById(nodeId)!);

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
            <NodeActionsBar
              onClick={(id) => id === "delete"}
              actions={[]}
            />
          )}
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
          node.children.map((child) => (
            <NoteNode key={child.id} nodeId={child.id} focuseId={focuseId} />
          ))}
      </div>
    </div>
  );
}
