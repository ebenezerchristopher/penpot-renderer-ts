// src/types/text.ts
import type { UUID } from './common';
import type { Fill } from './styles'; // Text nodes can have fills

// Text Content Structure (simplified based on provided schema)
// This is a recursive structure.

export interface TextNode {
  text: string;
  key?: string;
  fills?: Fill[];
  font_family?: string;
  font_size?: string;
  font_style?: string;
  font_weight?: string;
  direction?: string;
  text_decoration?: string;
  text_transform?: string;
  typography_ref_id?: UUID | null;
  typography_ref_file?: UUID | null;
}

export interface ParagraphNode {
  type: 'paragraph';
  key?: string;
  fills?: Fill[];
  font_family?: string;
  font_size?: string;
  font_style?: string;
  font_weight?: string;
  direction?: string;
  text_decoration?: string;
  text_transform?: string;
  typography_ref_id?: UUID | null;
  typography_ref_file?: UUID | null;
  children: TextNode[];
}

export interface ParagraphSetNode {
  type: 'paragraph-set';
  key?: string;
  children: ParagraphNode[];
}

export interface TextContent {
  type: 'root';
  key?: string;
  children?: (ParagraphSetNode | ParagraphNode)[]; // Can contain paragraph-sets or direct paragraphs
}
