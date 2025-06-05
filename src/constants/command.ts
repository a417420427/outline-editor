// commands.ts
export const Commands = {
  InsertNodeBelow: "insertNodeBelow",
  InsertNodeAbove: "insertNodeAbove",
  InsertChildNode: "insertChildNode",
  DeleteNode: "deleteNode",
  DuplicateNode: "duplicateNode",
  MoveNodeUp: "moveNodeUp",
  MoveNodeDown: "moveNodeDown",
  IndentNode: "indentNode",
  OutdentNode: 'OutdentNode',
  UnindentNode: "unindentNode",
  CollapseNode: "collapseNode",
  ExpandNode: "expandNode",
  ToggleCollapse: "toggleCollapse",
  FocusNextNode: "focusNextNode",
  FocusPrevNode: "focusPrevNode",
  FocusParentNode: "focusParentNode",
  FocusFirstChild: "focusFirstChild",
} as const;

export type Command = keyof typeof Commands;
