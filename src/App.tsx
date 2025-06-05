import { useState } from "react";
import NoteNode from "./components/NoteNode";

import "./styles/index.scss";

const nodes: OutlineNode[] = [
  {
    id: Math.random().toFixed(10),
    content: {
      type: "paragraph",
      content: [{ type: "text", text: "大纲笔记功能" }],
    },
    children: [],
  },
];

function getInitNode(): OutlineNode {
  return {
    id: Math.random().toString(36).slice(2),
    content: {
      type: "paragraph",
      content: [{ type: "text", text: " " }],
    },
    children: [],
  };
}

function findPrevNode(
  nodes: OutlineNode[],
  targetId: string,
  parent: OutlineNode | null = null
): { prev: OutlineNode; parent: OutlineNode | null } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === targetId) {
      if (i > 0) {
        return { prev: nodes[i - 1], parent };
      } else {
        return null;
      }
    }
    if (node.children.length > 0) {
      const result = findPrevNode(node.children, targetId, node);
      if (result) return result;
    }
  }
  return null;
}

export function findNextNodeFromNodes(nodes: OutlineNode[], node: OutlineNode) {
  for (let i = 0; i < nodes.length; i++) {
    const currentNode = nodes[i];
    if (currentNode.id === node.id) {
      return nodes[i + 1];
    }
    if (
      currentNode.children.length &&
      findNextNodeFromNodes(currentNode.children, node)
    ) {
      return findNextNodeFromNodes(currentNode.children, node);
    }
  }
}

function findNodeById(nodes: OutlineNode[], id: string): OutlineNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

function App() {
  const [baseNodes, setBaseNodes] = useState(nodes);
  const [focuseId, setFocuseId] = useState<string>(nodes[0].id);
  const onAddNode = (node: OutlineNode) => {
    const newNode = getInitNode();
    if (node.parentId) {
      const parentNode = findNodeById(baseNodes, node.parentId)!;
      parentNode.children.push(newNode);
      newNode.parentId = parentNode.id;
    } else {
      baseNodes.push(newNode);
    }

    setFocuseId(newNode.id);
    setBaseNodes([...baseNodes]);
  };

  const onTabNode = (node: OutlineNode, selection?: string) => {
    const newNodes = structuredClone(baseNodes);

    const result = findPrevNode(newNodes, node.id);
    if (!result) return;

    const { prev } = result;

    // 1. 插入到 prev.children
    prev.children = [...prev.children, node];
    node.parentId = prev.id;
    if (selection) {
      node.selection = selection;
    }
    // 2. 从原来的 parent 中删除
    const currentParent = findNodeById(newNodes, prev.parentId || "");
    if (currentParent) {
      currentParent.children = currentParent.children.filter(
        (child) => child.id !== node.id
      );
    }

    // 3. 焦点更新
    setFocuseId(node.id);
    setBaseNodes(newNodes.filter((f) => f.id !== node.id));
  };

  const onDeleteNode = (node: OutlineNode) => {
    let newNodes = structuredClone(baseNodes);
    const currentParent = findNodeById(newNodes, node.parentId || "");
    if (currentParent) {
      currentParent.children = currentParent.children.filter(
        (child) => child.id !== node.id
      );
    } else {
      newNodes = newNodes.filter((f) => f.id !== node.id);
    }

    setBaseNodes(newNodes);
  }

  return (
    <div
      style={{
        width: 600,
        padding: '100px 100px 0',
        height: 600,
      }}
    >
      {baseNodes.map((node) => (
        <NoteNode
          onDeleteNode={onDeleteNode}
          onTabNode={onTabNode}
          focuseId={focuseId}
          key={node.id}
          node={node}
          onAddNode={onAddNode}
          onFocuse={(node: OutlineNode) => setFocuseId(node.id)}
        ></NoteNode>
      ))}
    </div>
  );
}

export default App;
