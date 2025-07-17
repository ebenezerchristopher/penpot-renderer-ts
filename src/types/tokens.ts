// src/types/tokens.ts

/**
 * Represents a map of applied design tokens to shape properties.
 * The keys are typically property names (e.g., 'fill', 'stroke-width', 'font-size')
 * and the values are token references (e.g., 'color.primary.500', 'spacing.medium').
 * Corresponds to `schema:applied-tokens` in `token.cljc`.
 */
export type AppliedTokens = Record<string, string>;
