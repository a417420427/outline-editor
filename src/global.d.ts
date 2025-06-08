import type { JSONContent } from "@tiptap/core"; // 或者使用 ProseMirror 的 Node JSON 类型
import type { Selection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

declare global {
  interface OutlineNode {
    title?: string; // 节点标题
    expanded?: boolean; // 可选，指示节点是否展开

    id: string; // 唯一标识符
    content: JSONContent; // ProseMirror 文档内容的 JSON 表示
    children: OutlineNode[]; // 子节点数组
    selection?: Selection;
    collapsed?: boolean; // 可选，指示子节点是否折叠
    parentId?: string; // 可选，父节点的 ID
    createdAt?: string; // 可选，创建时间
    updatedAt?: string; // 可选，更新时间
  }
  interface NoteNodeProps {
    nodeId: string;
    focuseId: string;
  }

  interface TreeContext {
    tree: OutlineNode[]; // 整棵树
    editorView: EditorView; // 编辑器视图实例
    selectionNodeId?: string; // 当前选中节点 ID（如果需要）
    // userId?: string; // 当前用户 ID（可选）
    config?: Record<string, string | number | boolean|undefined>; // 额外配置
  }

  type FormatType = "strong" | "em" | "code" | "link" | "color";

  type ActionType = "delete" | "mark" | "import" | "export";
}
