// commandDispatcher.ts

import {type Command } from "../constants/command";

export interface DispatchContext {
  currentNode: OutlineNode;
  baseNodes: OutlineNode[];
  setBaseNodes: (nodes: OutlineNode[]) => void;
  setFocusId: (id: string) => void;
}

export function dispatchCommand(
  command: Command,
  context: DispatchContext
) {
  const { currentNode, baseNodes, setBaseNodes, setFocusId } = context;

  const clone = structuredClone(baseNodes); // 简化示例，建议用更安全方法
  const newNode = { ...currentNode, id: Math.random().toFixed(10) };

  switch (command) {
    case "InsertNodeBelow":
      // 插入到当前节点下方（兄弟）
      insertBelow(clone, currentNode, newNode);
      setBaseNodes(clone);
      setFocusId(newNode.id);
      break;

    case "InsertChildNode":
      // 添加子节点
      currentNode.children.push(newNode);
      setBaseNodes([...clone]);
      setFocusId(newNode.id);
      break;

    case "DeleteNode":
      // 删除
      deleteNode(clone, currentNode);
      setBaseNodes(clone);
      break;

    case "IndentNode":
      // 缩进
      indentNode(clone, currentNode);
      setBaseNodes(clone);
      setFocusId(currentNode.id);
      break;
    case 'OutdentNode':
      break

    // ... 其他命令

    default:
      break;
  }
}


function insertBelow(nodes: OutlineNode[], currentNode: OutlineNode, newNode: OutlineNode) {
  console.log(nodes, currentNode, newNode)
}

function deleteNode(nodes: OutlineNode[], currentNode: OutlineNode) {
  console.log(nodes, currentNode)
}

function indentNode(nodes: OutlineNode[], currentNode: OutlineNode) {
  console.log(nodes, currentNode)
}