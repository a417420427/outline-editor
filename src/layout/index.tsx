import { useEffect } from "react";
import { NoteNode } from "../components/NoteNode/index";
import { useOutlineStore } from "../store";

function App() {
  const tree = useOutlineStore((state) => state.tree);
  const focusId = useOutlineStore((state) => state.focusId);

  
  
  const initState = useOutlineStore((state) => state.initState);

  useEffect(() => {
    initState()
  })
  return (
    <div style={{ width: 600, padding: "100px 100px 0", height: 600 }}>
      <div className="buttons">
        <button>保存</button>
      </div>
      {tree.map((node) => (
        <NoteNode key={node.id} nodeId={node.id} focuseId={focusId} />
      ))}
    </div>
  );
}

export default App;
