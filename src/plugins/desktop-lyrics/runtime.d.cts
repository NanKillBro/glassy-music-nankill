import type { BrowserWindow } from 'electron';

export function createDesktopLyrics(options: {
  window: BrowserWindow;
  html: string;
  preload: string;
}): {
  start(): void;
  stop(): void;
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
};
