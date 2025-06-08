export const CommandActionTypes = {
  Undo: 'undo',
  Redo: 'redo',
  FocusNextNode: 'focusNextNode',
  ToggleFullScreen: 'toggleFullScreen',
} as const;

export type CommandActionType = typeof CommandActionTypes[keyof typeof CommandActionTypes];
