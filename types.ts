
export type Character = 'Argenti' | 'Boothill' | 'You' | 'Narrator' | 'Boss';

export interface DialogueNode {
  id: string;
  character: Character;
  text: string;
  background?: string;
  expression?: string;
  action?: () => void;
}

export interface Chapter {
  id: number;
  title: string;
  nodes: DialogueNode[];
  focusRequirementMinutes: number;
  focusTitle: string;
  focusDescription: string;
}

export type GameState = 'INTRO' | 'STORY' | 'TIMER' | 'WORLDVIEW' | 'CONTENTS';

export interface UserProgress {
  level: number;
  exp: number; // 0, 0.5, or 1
}
