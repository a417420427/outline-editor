/**
 * 插入一个新节点在当前节点之后（同级）
 */
export function insertBelow(
  tree: OutlineNode,
  targetId: string,
  newNode: OutlineNode
): OutlineNode {
  function helper(node: OutlineNode): OutlineNode {
    if (node.children.some((child) => child.id === targetId)) {
      const newChildren: OutlineNode[] = [];
      for (let i = 0; i < node.children.length; i++) {
        newChildren.push(node.children[i]);
        if (node.children[i].id === targetId) {
          newChildren.push(newNode);
        }
      }
      return { ...node, children: newChildren.map(helper) };
    } else {
      return { ...node, children: node.children.map(helper) };
    }
  }

  return helper(tree);
}

/**
 * 删除指定节点
 */
export function deleteNode(tree: OutlineNode, targetId: string): OutlineNode {
  function helper(node: OutlineNode): OutlineNode {
    return {
      ...node,
      children: node.children
        .filter((child) => child.id !== targetId)
        .map(helper),
    };
  }

  return helper(tree);
}
