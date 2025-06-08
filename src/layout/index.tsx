import { NoteNode } from "../components/NoteNode/index";
import { useOutlineStore } from "../store";

function App() {
  const tree = useOutlineStore((state) => state.tree);
  const focusId = useOutlineStore((state) => state.focusId);

  return (
    <div style={{ width: 600, padding: "100px 100px 0", height: 600 }}>
      {tree.map((node) => (
        <NoteNode key={node.id} nodeId={node.id} focuseId={focusId} />
      ))}
    </div>
  );
}

export default App;
