export const NodeActionTypes = {
  InsertImage: 'insertImage',
  InsertLink: 'insertLink',
  InsertParagraph: 'insertParagraph',
  InsertHeading: 'insertHeading',
} as const;

export type NodeActionType = typeof NodeActionTypes[keyof typeof NodeActionTypes];
