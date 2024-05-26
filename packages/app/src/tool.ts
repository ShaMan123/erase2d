export type Tool = (typeof TOOL)[number];
export const TOOL = ['select', 'draw', 'erase', 'undo'] as const;
