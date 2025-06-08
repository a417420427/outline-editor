import type { extendedSchema } from "../schema/extendedSchema";

export type MarkActionType = keyof typeof extendedSchema.marks;
