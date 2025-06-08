export const MarkActionTypes = {
  Bold: 'bold',
  Italic: 'italic',
  Underline: 'underline',
  Strike: 'strike',
  Code: 'code',
} as const;

export type MarkActionType = typeof MarkActionTypes[keyof typeof MarkActionTypes];
