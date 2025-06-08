import { type MarkActionType } from './markActions';
import { type NodeActionType } from './nodeActions';
import { type CommandActionType } from './commandActions';

export type EditorActionType =
  | MarkActionType
  | NodeActionType
  | CommandActionType;
