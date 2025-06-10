import { NoteNode } from "../components/NoteNode/index";
import { useEditorStore } from "../store";

function MainContent() {
  const tree = useEditorStore((state) => state.tree);
  const focusId = useEditorStore((state) => state.focusId);

  return (
    <div className="MainContent">
      {tree.map((node) => (
        <NoteNode key={node.id} nodeId={node.id} focuseId={focusId} />
      ))}
    </div>
  );
}

export default MainContent;
