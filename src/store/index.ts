import { create } from 'zustand';
import { EditorView } from 'prosemirror-view';
import { Node as PMNode } from 'prosemirror-model';

import { extendedSchema } from '../schema/extendedSchema';

interface OutlineState {
  tree: OutlineNode[];
  focusId: string;
}

interface OutlineActions {
  setTree: (tree: OutlineNode[]) => void;
  setFocusId: (id: string) => void;
  addNode: (node: OutlineNode, editorView: EditorView) => void;
  tabNode: (node: OutlineNode, editorView: EditorView) => void;
  deleteNode: (node: OutlineNode) => void;
  findNodeById: (id: string) => OutlineNode | null;
}

export const useOutlineStore = create<OutlineState & OutlineActions>((set, get) => ({
  tree: [
    {
      id: Math.random().toFixed(10),
      content: {
        type: 'paragraph',
        content: [{ type: 'text', text: '大纲笔记功能' }],
      },
      children: [],
    },
  ],
  focusId: '',

  setTree: (tree) => set({ tree }),
  setFocusId: (focusId) => set({ focusId }),

  findNodeById: (id: string) => {
    function find(nodes: OutlineNode[]): OutlineNode | null {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = find(node.children);
        if (found) return found;
      }
      return null;
    }
    return find(get().tree);
  },

  addNode: (node: OutlineNode, editorView: EditorView) => {
    const { tree, setTree, setFocusId } = get();
    const docNode = PMNode.fromJSON(extendedSchema, node.content);
    const selection = editorView.state.selection;
    const offset = selection?.anchor ?? 0;

    const trDoc = docNode.cut(0, docNode.content.size);
    const before = trDoc.cut(0, offset);
    const after = trDoc.cut(offset, docNode.content.size);

    const newNode: OutlineNode = {
      id: Math.random().toString(36).slice(2),
      content: after.toJSON(),
      children: [],
      parentId: node.parentId,
    };

    // 修改老节点内容
    node.content = before.toJSON();

    // 更新树（插入 newNode 紧跟 node 后面）
    function insertNode(nodes: OutlineNode[]): OutlineNode[] {
      return nodes.flatMap((n) => {
        if (n.id === node.id) {
          if (node.parentId) {
            return [n, newNode]; // 会在父 children 里插入
          } else {
            return [n, newNode]; // 根层插入
          }
        }
        if (n.children.length > 0) {
          n.children = insertNode(n.children);
        }
        return [n];
      });
    }

    const newTree = insertNode(tree);

    setTree(newTree);
    setFocusId(newNode.id);
  },

  tabNode: (node: OutlineNode, editorView: EditorView) => {
    const { tree, setTree, setFocusId, findNodeById } = get();
    const newNodes = structuredClone(tree);

    // 找前一个节点
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

    const selection = editorView.state.selection.toJSON();
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
    const currentParent = findNodeById(node.parentId || '');
    if (currentParent) {
      currentParent.children = currentParent.children.filter((child) => child.id !== node.id);
    }

    setFocusId(node.id);
    setTree(newNodes.filter((f) => f.id !== node.id));
  },

  deleteNode: (node: OutlineNode) => {
    const { tree, setTree } = get();
    let newNodes = structuredClone(tree);

    const findNodeById = (id: string, nodes = newNodes): OutlineNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNodeById(id, node.children);
        if (found) return found;
      }
      return null;
    };

    const currentParent = findNodeById(node.parentId || '');
    if (currentParent) {
      currentParent.children = currentParent.children.filter((child) => child.id !== node.id);
    } else {
      newNodes = newNodes.filter((f) => f.id !== node.id);
    }

    setTree(newNodes);
  },
}));
