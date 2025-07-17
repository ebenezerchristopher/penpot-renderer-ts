// src/types/interactions.ts
import type { UUID } from './common';
import type { Point } from './geometry';

// Simplified for now, based on schema:interaction-attrs in interactions.cljc
export type EventType =
  | 'click'
  | 'mouse-press'
  | 'mouse-over'
  | 'mouse-enter'
  | 'mouse-leave'
  | 'after-delay';
export type ActionType =
  | 'navigate'
  | 'open-overlay'
  | 'toggle-overlay'
  | 'close-overlay'
  | 'prev-screen'
  | 'open-url';
export type OverlayPositioningType =
  | 'manual'
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';
export type EasingType =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';
export type DirectionType = 'right' | 'left' | 'up' | 'down';
export type WayType = 'in' | 'out';
export type AnimationType = 'dissolve' | 'slide' | 'push';

// Minimal Animation types (will be fully fleshed out if needed)
export interface DissolveAnimation {
  animation_type: 'dissolve';
  duration: number;
  easing: EasingType;
}

export interface SlideAnimation {
  animation_type: 'slide';
  duration: number;
  easing: EasingType;
  way: WayType;
  direction: DirectionType;
  offset_effect: boolean;
}

export interface PushAnimation {
  animation_type: 'push';
  duration: number;
  easing: EasingType;
  direction: DirectionType;
}

export type Animation = DissolveAnimation | SlideAnimation | PushAnimation;

export interface Interaction {
  action_type?: ActionType;
  event_type?: EventType;
  destination?: UUID | null;
  preserve_scroll?: boolean;
  animation?: Animation;
  overlay_position?: Point;
  overlay_pos_type?: OverlayPositioningType;
  close_click_outside?: boolean;
  background_overlay?: boolean;
  position_relative_to?: UUID | null;
  url?: string;
  // delay is on the interaction object itself if event_type is 'after-delay'
  delay?: number;
}
