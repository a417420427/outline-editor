// === 工具函数 ===

export function generateNodeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function isLeafNode(node: OutlineNode): boolean {
  return !node.children || node.children.length === 0;
}

export function hasChildren(node: OutlineNode): boolean {
  return !!node.children && node.children.length > 0;
}

// === 查找与遍历 ===

export function findNodeById(
  ctx: TreeContext,
  nodeId: string
): OutlineNode | undefined {
  const { tree } = ctx;
  for (const node of tree) {
    if (node.id === nodeId) return node;
    if (node.children && node.children.length) {
      const found = findNodeById({ ...ctx, tree: node.children }, nodeId);
      if (found) return found;
    }
  }
  return undefined;
}

export function findParentNode(
  ctx: TreeContext,
  nodeId: string
): OutlineNode | undefined {
  const { tree } = ctx;
  for (const node of tree) {
    if (node.children && node.children.find((child) => child.id === nodeId)) {
      return node;
    }
    if (node.children && node.children.length) {
      const found = findParentNode({ ...ctx, tree: node.children }, nodeId);
      if (found) return found;
    }
  }
  return undefined;
}

export function findNodePath(
  ctx: TreeContext,
  nodeId: string
): OutlineNode[] | undefined {
  const { tree } = ctx;
  for (const node of tree) {
    if (node.id === nodeId) {
      return [node];
    }
    if (node.children && node.children.length) {
      const path = findNodePath({ ...ctx, tree: node.children }, nodeId);
      if (path) {
        return [node, ...path];
      }
    }
  }
  return undefined;
}

export function findSiblings(
  ctx: TreeContext,
  nodeId: string
): OutlineNode[] | undefined {
  const parent = findParentNode(ctx, nodeId);
  if (parent) {
    return parent.children;
  } else {
    return ctx.tree;
  }
}

export function findPreviousNode(
  ctx: TreeContext,
  nodeId: string
): OutlineNode | undefined {
  const siblings = findSiblings(ctx, nodeId);
  if (!siblings) return undefined;
  const idx = siblings.findIndex((n) => n.id === nodeId);
  if (idx > 0) return siblings[idx - 1];
  return undefined;
}

export function findNextNode(
  ctx: TreeContext,
  nodeId: string
): OutlineNode | undefined {
  const siblings = findSiblings(ctx, nodeId);
  if (!siblings) return undefined;
  const idx = siblings.findIndex((n) => n.id === nodeId);
  if (idx >= 0 && idx < siblings.length - 1) return siblings[idx + 1];
  return undefined;
}

// === 基础结构操作 ===



// 传入当前节点id 和光标位置（或者通过 editorView 拿光标位置）
export function addNode(ctx: TreeContext, nodeId: string): OutlineNode[] {
  const { tree, editorView } = ctx;
  if (!editorView) return tree;
  console.log("addNode", nodeId);
  return tree;
}


export function insertNodeAbove(
  ctx: TreeContext,
  targetId: string,
  newNode: OutlineNode
): OutlineNode[] {
  const { tree } = ctx;
  const parent = findParentNode(ctx, targetId);
  if (!parent) {
    const idx = tree.findIndex((n) => n.id === targetId);
    if (idx === -1) return tree;
    const newTree = [...tree];
    newTree.splice(idx, 0, newNode);
    return newTree;
  } else {
    const newChildren = [...parent.children];
    const idx = newChildren.findIndex((n) => n.id === targetId);
    if (idx === -1) return tree;
    newChildren.splice(idx, 0, newNode);
    return updateNode(ctx, parent.id, { children: newChildren });
  }
}

export function insertNodeBelow(
  ctx: TreeContext,
  targetId: string,
  newNode: OutlineNode
): OutlineNode[] {
  const { tree } = ctx;
  const parent = findParentNode(ctx, targetId);
  if (!parent) {
    const idx = tree.findIndex((n) => n.id === targetId);
    if (idx === -1) return tree;
    const newTree = [...tree];
    newTree.splice(idx + 1, 0, newNode);
    return newTree;
  } else {
    const newChildren = [...parent.children];
    const idx = newChildren.findIndex((n) => n.id === targetId);
    if (idx === -1) return tree;
    newChildren.splice(idx + 1, 0, newNode);
    return updateNode(ctx, parent.id, { children: newChildren });
  }
}

export function deleteNode(ctx: TreeContext, nodeId: string): OutlineNode[] {
  const { tree } = ctx;
  return tree
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (node.children && node.children.length) {
        return {
          ...node,
          children: deleteNode({ ...ctx, tree: node.children }, nodeId),
        };
      }
      return node;
    });
}

export function updateNode(
  ctx: TreeContext,
  nodeId: string,
  updatedFields: Partial<OutlineNode>
): OutlineNode[] {
  const { tree } = ctx;
  return tree.map((node) => {
    if (node.id === nodeId) {
      return { ...node, ...updatedFields };
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: updateNode(
          { ...ctx, tree: node.children },
          nodeId,
          updatedFields
        ),
      };
    }
    return node;
  });
}

export function moveNode(
  ctx: TreeContext,
  nodeId: string,
  newParentId: string,
  position?: number
): OutlineNode[] {
  const { tree } = ctx;
  let movedNode: OutlineNode | null = null;

  function removeNode(nodes: OutlineNode[]): OutlineNode[] {
    return nodes.filter((n) => {
      if (n.id === nodeId) {
        movedNode = n;
        return false;
      }
      if (n.children && n.children.length) {
        n.children = removeNode(n.children);
      }
      return true;
    });
  }

  const treeWithoutNode = removeNode(tree);
  if (!movedNode) return tree;

  function insertNode(nodes: OutlineNode[]): OutlineNode[] {
    return nodes.map((n) => {
      if (n.id === newParentId) {
        const children = n.children ? [...n.children] : [];
        if (
          position === undefined ||
          position < 0 ||
          position > children.length
        ) {
          children.push(movedNode!);
        } else {
          children.splice(position, 0, movedNode!);
        }
        return { ...n, children };
      }
      if (n.children && n.children.length) {
        return { ...n, children: insertNode(n.children) };
      }
      return n;
    });
  }

  return insertNode(treeWithoutNode);
}

// === 展开折叠状态 ===

export function toggleNodeCollapsed(
  ctx: TreeContext,
  nodeId: string
): OutlineNode[] {
  const node = findNodeById(ctx, nodeId);
  if (!node) return ctx.tree;
  return updateNode(ctx, nodeId, { collapsed: !node.collapsed });
}

export function setNodeCollapsed(
  ctx: TreeContext,
  nodeId: string,
  collapsed: boolean
): OutlineNode[] {
  return updateNode(ctx, nodeId, { collapsed });
}

export function isNodeCollapsed(ctx: TreeContext, nodeId: string): boolean {
  const node = findNodeById(ctx, nodeId);
  return !!node?.collapsed;
}
