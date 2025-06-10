import { create } from "zustand";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";

import { Selection } from "prosemirror-state";

export const initialTree = [
  {
    id: Math.random().toFixed(10),
    expand: true,
    content: {
      type: "paragraph",
      content: [{ type: "text", text: "大纲笔记功能" }],
    },
    children: [],
  },
];

export const getInitialState: () => OutlineState = () => ({
  tree: initialTree,
  focusId: "",
  focusOffset: 0,
  editorView: null,
  history: [],
  historyIndex: 0,
});

interface OutlineActions {
  /** 更新当前树 */
  setTree: (tree: OutlineNode[]) => void;
  /** 设置当前焦点节点ID */
  setFocusId: (id: string) => void;
  /** TAB缩进 将当前节点设为上一个兄弟节点的子节点 */
  tabNode: (nodeId: string, editorView: EditorView) => void;
  /** 删除节点 */
  deleteNode: (nodeId: string) => void;
  /** 展开收起 */
  onToggleExpandNode: (nodeId: string) => void;
  /** 设置编辑器视图 */
  setEditorView: (view: EditorView | null) => void;
  /** 设置光标偏移 */
  setFocusOffset: (offset: number) => void;
  /** 切割节点 */
  onSplitNode: (nodeId: string, editorView: EditorView) => void;
  /** 更新当前节点内容 */
  updateNodeById: (nodeId: string, newContent: OutlineNode["content"]) => void;
  /** 在指定节点后添加新节点 */
  addNodeAfter: (currentNodeId: string, newNode: OutlineNode) => void;
  /** 编辑内容变化时将内容更新到当前节点 */
  onTransaction: (doc: Node, selection: Selection) => void;
  /** 通过ID查找节点 */
  findNodeById: (id: string) => OutlineNode | null;
  /** 新增历史 */
  pushHistory: () => void;
  /** 记录当前历史的节点内操作 */
  updateCurrentHistory: () => void;
  /** 重置数据 */
  reset: (initialTreeOverride: Partial<OutlineState>) => void;
}

export const useEditorStore = create<OutlineState & OutlineActions>(
  (set, get) => ({
    tree: [],
    focusId: "",
    editorView: null,
    history: [],
    focusOffset: 0,
    historyIndex: 0,
    reset: (initialTreeOverride: Partial<OutlineState>) => {
      const { pushHistory } = get();
     
      set({
        ...getInitialState(),
        ...initialTreeOverride,
      });
      pushHistory();
    },
    setTree: (newTree) => {
      set({
        tree: newTree,
      });
    },
    setFocusId: (focusId) => set({ focusId }),
    setFocusOffset: (focusOffset) => set({ focusOffset }),
    setEditorView: (editorView) => set({ editorView }),
    undoTree: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const prevEntry = history[historyIndex - 1];

        set({
          tree: prevEntry.tree,
          focusId: prevEntry.focusId,
          focusOffset: prevEntry.focusOffset,
          historyIndex: historyIndex - 1,
        });
      }
    },

    redoTree: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextEntry = history[historyIndex + 1];
        set({
          tree: nextEntry.tree,
          focusId: nextEntry.focusId,
          focusOffset: nextEntry.focusOffset,
          historyIndex: historyIndex + 1,
        });
      }
    },
    pushHistory: () => {
      const { tree, focusId, focusOffset, history, historyIndex } = get();
      // 截断历史数组，丢弃当前historyIndex之后的所有记录（防止分叉）
      const truncatedHistory = history.slice(0, historyIndex + 1);
      const nextHistory = [...truncatedHistory, { tree, focusId, focusOffset }];
      set({
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
      });
    },
    updateCurrentHistory: () => {
      const { tree, focusId, focusOffset, history, historyIndex } = get();

      const newEntry: HistoryEntry = { tree, focusId, focusOffset };
      const newHistory = [...history];
      newHistory[historyIndex] = newEntry;
      set({ history: newHistory });
    },
    onSplitNode: (nodeId: string, editorView: EditorView) => {
      const {
        findNodeById,
        updateNodeById,
        addNodeAfter,
        setFocusId,
        pushHistory,
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
        expand: true,
        content: after.toJSON(), // 或 extendedSchema.node("paragraph").toJSON()
        children: [],
      };
      setFocusOffset(0); // 重置光标偏移
      addNodeAfter(nodeId, newNode);
      setFocusId(newNode.id);

      pushHistory(); // 添加到历史记录
      console.log(get());
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

    onToggleExpandNode(nodeId: string) {
      set((state) => {
        const toggleExpand = (nodes: OutlineNode[]): OutlineNode[] => {
          return nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                expand: !node.expand, // 切换展开状态
              };
            } else if (node.children?.length) {
              return {
                ...node,
                children: toggleExpand(node.children), // 递归处理子节点
              };
            }
            return node; // 返回未修改的节点
          });
        };
        return {
          tree: toggleExpand(state.tree), // 更新树结构
        };
      });
    },

    /**
     * 处理大纲节点移动的操作，将指定的节点移动到其前一个节点的子节点列表中 按Tab键触发。
     * @param node 要移动的节点
     * @param editorView 编辑器视图对象，用于获取当前选区信息
     */
    tabNode: (nodeId: string, editorView: EditorView) => {
      const { tree, setTree, setFocusId, pushHistory } = get();
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
      pushHistory(); // 添加到历史记录
    },
    onTransaction: (doc: Node, selection: Selection) => {
      const { focusId, tree, setTree, updateCurrentHistory, setFocusOffset } =
        get();
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

      // 更新光标偏移
      setFocusOffset(selection.anchor);

      updateCurrentHistory(); // 更新当前历史记录
    },

    /**
     * 删除指定ID的节点
     * @param nodeId 要删除的节点的ID
     */
    deleteNode: (nodeId: string) => {
      const { tree, setTree, setFocusId, findNodeById, pushHistory } = get();
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
      pushHistory(); // 添加到历史记录
    },
    findNodeById(id: string): OutlineNode | null {
      const { tree } = get();

      return findNodeByIdFromTree(tree, id);
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
// function buildNodeMap(tree: OutlineNode[]): Record<string, OutlineNode> {
//   const map: Record<string, OutlineNode> = {};

//   function traverse(nodes: OutlineNode[], parentId?: string) {
//     for (const node of nodes) {
//       map[node.id] = { ...node, parentId };
//       if (node.children && node.children.length > 0) {
//         traverse(node.children, node.id);
//       }
//     }
//   }

//   traverse(tree);
//   return map;
// }

function findNodeByIdFromTree(
  tree: OutlineNode[],
  id: string
): OutlineNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeByIdFromTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
}
