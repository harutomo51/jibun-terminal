export const APPEARANCE_CHANNELS = {
  onCommand: 'appearance:onCommand'
} as const;

export type AppearanceCommand = 'open-settings' | 'cycle-background';

export interface AppearanceCommandPayload {
  command: AppearanceCommand;
}

export interface AppearanceBridgeApi {
  onCommand: (callback: (payload: AppearanceCommandPayload) => void) => () => void;
}
