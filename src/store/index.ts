import { create } from "zustand";
import { EditorView } from "prosemirror-view";
import { Node, Node as PMNode } from "prosemirror-model";

import { extendedSchema } from "../schema/extendedSchema";
import { Selection } from "prosemirror-state";

const initialTree = [
  {
    id: Math.random().toFixed(10),
    content: {
      type: "paragraph",
      content: [{ type: "text", text: "大纲笔记功能" }],
    },
    children: [],
  },
];

interface OutlineState {
  tree: OutlineNode[];
  nodeMap: Record<string, OutlineNode>;
  focusId: string;
  focusOffset: number;
  editorView: EditorView | null;
}

interface OutlineActions {
  setTree: (tree: OutlineNode[]) => void;
  setFocusId: (id: string) => void;
  addNode: (node: OutlineNode, editorView: EditorView) => void;
  tabNode: (nodeId: string, editorView: EditorView) => void;
  deleteNode: (nodeId: string) => void;
  findNodeById: (id: string) => OutlineNode | null;
  setEditorView: (view: EditorView | null) => void;
  setFocusOffset: (offset: number) => void;
  onSplitNode: (nodeId: string, editorView: EditorView) => void;
  updateNodeById: (nodeId: string, newContent: OutlineNode["content"]) => void;
  addNodeAfter: (currentNodeId: string, newNode: OutlineNode) => void;
  onTransaction: (doc: Node, selection: Selection) => void;
}

export const useOutlineStore = create<OutlineState & OutlineActions>(
  (set, get) => ({
    tree: initialTree,
    nodeMap: buildNodeMap(initialTree),
    focusId: "",
    editorView: null,
    focusOffset: 0,
    setTree: (tree) => set({ tree }),
    setFocusId: (focusId) => set({ focusId }),
    setFocusOffset: (focusOffset) => set({ focusOffset }),
    setEditorView: (editorView) => set({ editorView }),
    onSplitNode: (nodeId: string, editorView: EditorView) => {
      const {
        findNodeById,
        updateNodeById,
        addNodeAfter,
        setFocusId,
        setFocusOffset,
      } = get();
      const node = findNodeById(nodeId);
      if (!node) return;
      const { state } = editorView;
      const { from } = state.selection;
      // 不处理选区情况，仅处理光标（collapsed selection）
      if (!state.selection.empty) return;
      const doc = state.doc;
      // ProseMirror Node 的 slice（前半部分）与剩余部分
      const before = doc.cut(0, from);
      const after = doc.cut(from);

      // 更新当前节点的内容为前半部分
      updateNodeById(nodeId, before.toJSON());

      // 构造新节点（空或插入后半部分）
      const newNode = {
        id: crypto.randomUUID(),
        content: after.toJSON(), // 或 extendedSchema.node("paragraph").toJSON()
        children: [],
      };
      setFocusOffset(0); // 重置光标偏移
      addNodeAfter(nodeId, newNode);
      setFocusId(newNode.id);
    },
    /**
     * 通过节点ID更新节点的内容
     * @param nodeId 要更新的节点的ID
     * @param newContent 新的内容，应符合OutlineNode["content"]的类型
     */
    updateNodeById: (nodeId: string, newContent: OutlineNode["content"]) => {
      set((state) => {
        const update = (nodes: OutlineNode[]): OutlineNode[] => {
          return nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                content: newContent,
              };
            } else if (node.children?.length) {
              return {
                ...node,
                children: update(node.children),
              };
            }
            return node;
          });
        };

        return {
          tree: update(state.tree),
        };
      });
    },
    /**
     * 在指定节点后添加新节点
     * @param currentNodeId 当前节点的ID
     * @param newNode 需要添加的新节点
     */
    addNodeAfter: (currentNodeId: string, newNode: OutlineNode) => {
      set((state) => {
        const insert = (nodes: OutlineNode[]): OutlineNode[] => {
          const newNodes: OutlineNode[] = [];
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            newNodes.push(node);
            if (node.id === currentNodeId) {
              newNodes.push(newNode);
            } else if (node.children?.length) {
              newNodes[i] = {
                ...node,
                children: insert(node.children),
              };
            }
          }
          return newNodes;
        };

        return {
          tree: insert(state.tree),
        };
      });
    },
    /**
     * 通过ID查找节点
     * @param id 需要查找的节点的ID
     * @returns 找到的节点对象，如果未找到则返回null
     */
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

    /**
     * 在编辑视图中添加一个新的节点到给定的节点之后。
     *
     * @param node 要添加新节点之前的OutlineNode对象。
     * @param editorView 当前编辑器的视图，用于获取选择状态和进行DOM操作。
     *
     * @description
     * 该函数首先解析给定的节点内容，并根据当前编辑器的选择状态确定插入位置。
     * 然后，创建一个新的OutlineNode对象，其内容为原始节点内容之后的部分。
     * 接着，更新原始节点的内容为插入点之前的内容。
     * 最后，通过递归遍历现有的树结构，在指定节点之后插入新节点，并更新整个树结构。
     * 更新后，将新的树结构设置回状态，并将焦点设置为新节点的ID。
     */
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

    /**
     * 处理大纲节点移动的操作，将指定的节点移动到其前一个节点的子节点列表中 按Tab键触发。
     * @param node 要移动的节点
     * @param editorView 编辑器视图对象，用于获取当前选区信息
     */
    tabNode: (nodeId: string, editorView: EditorView) => {
      const { tree, setTree, setFocusId } = get();
      const newTree = structuredClone(tree);

      const result = findNodeWithParent(newTree, nodeId);
      if (!result) return;

      const { node, index, siblings } = result;

      // 2. 找上一个兄弟节点
      if (index === 0) return; // 没有上一个兄弟节点，退出

      const prevSibling = siblings[index - 1];

      // 3. 删除当前节点
      siblings.splice(index, 1);

      // 4. 添加为上一个兄弟的子节点
      prevSibling.children = [
        ...(prevSibling.children || []),
        {
          ...node,
          parentId: prevSibling.id,
          selection: editorView.state.selection.toJSON(),
        },
      ];

      // 5. 提交更新
      setTree(newTree);
      setFocusId(node.id);
    },
    onTransaction: (doc: Node, selection: Selection) => {
      const { focusId, tree, setTree } = get();
      if (!focusId) return;

      const updateNode = (nodes: OutlineNode[]): OutlineNode[] => {
        return nodes.map((node) => {
          if (node.id === focusId) {
            return {
              ...node,
              content: doc.toJSON(),
              selection: selection.toJSON(),
            };
          } else if (node.children.length > 0) {
            return {
              ...node,
              children: updateNode(node.children),
            };
          }
          return node;
        });
      };

      const newTree = updateNode(tree);
      setTree(newTree);
    },

    /**
     * 删除指定ID的节点
     * @param nodeId 要删除的节点的ID
     */
    deleteNode: (nodeId: string) => {
      const { tree, setTree, findNodeById, setFocusId } = get();
      const nodeToDelete = findNodeById(nodeId);
      if (!nodeToDelete) return;
      const parentId = nodeToDelete.parentId;
      const newTree = structuredClone(tree); // 深拷贝树结构
      const findAndDelete = (nodes: OutlineNode[]): OutlineNode[] => {
        return nodes
          .map((node) => {
            if (node.children.length > 0) {
              node.children = findAndDelete(node.children);
            }
            return node;
          })
          .filter((node) => node.id !== nodeId);
      };

      // 根节点删除 or 有父节点
      const updatedTree = !parentId
        ? newTree.filter((n) => n.id !== nodeId)
        : findAndDelete(newTree);

      setFocusId(""); // 清除焦点 ID
      setTree(updatedTree);
    },
  })
);

/**
 * 在节点树中查找具有指定ID的节点，并返回该节点及其父节点、索引和兄弟节点。
 *
 * @param nodes 节点数组，表示整个节点树。
 * @param targetId 要查找的节点的ID。
 * @param parent 当前节点的父节点，默认为null（表示从根节点开始查找）。
 * @returns 如果找到目标节点，则返回包含目标节点、其索引、父节点和兄弟节点的对象；否则返回null。
 */
function findNodeWithParent(
  nodes: OutlineNode[],
  targetId: string,
  parent: OutlineNode | null = null
): {
  node: OutlineNode;
  index: number;
  parent: OutlineNode | null;
  siblings: OutlineNode[];
} | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === targetId) {
      return { node, index: i, parent, siblings: nodes };
    }
    if (node.children.length > 0) {
      const result = findNodeWithParent(node.children, targetId, node);
      if (result) return result;
    }
  }
  return null;
}

/**
 * 构建节点映射关系
 * @param tree 原始树形结构节点数组
 * @returns 返回每个节点及其父节点ID的映射关系
 */
function buildNodeMap(tree: OutlineNode[]): Record<string, OutlineNode> {
  const map: Record<string, OutlineNode> = {};

  function traverse(nodes: OutlineNode[], parentId?: string) {
    for (const node of nodes) {
      map[node.id] = { ...node, parentId };
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id);
      }
    }
  }

  traverse(tree);
  return map;
}
