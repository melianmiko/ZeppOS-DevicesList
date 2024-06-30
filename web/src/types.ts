export const SCREEN_SHAPES = ['round', 'square', 'band'] as const;

export type KnownScreenShape = (typeof SCREEN_SHAPES)[number];
export type ScreenShape = KnownScreenShape | 'unknown';

export interface RawDevice {
  id: string;
  deviceName: string;
  alternativeDeviceNames?: string[];
  deviceSource: Array<number | null>;
  chipset: string;
  screenShape: string;
  screenWidth: number;
  screenHeight: number;
  screenRadius: number;
  physicalKeysCount: number | string;
  osVersion: string;
  productionId: Array<number | null>;
  deviceImage?: string | null;
}

export interface DeviceRevision {
  deviceSource: number;
  productionId: number | null;
}

export interface Device {
  id: string;
  deviceName: string;
  alternativeDeviceNames: string[];
  chipset: string;
  screenShape: ScreenShape;
  screenWidth: number;
  screenHeight: number;
  screenRadius: number;
  physicalKeysCount: number;
  osVersion: string;
  deviceImage: string | null;
  revisions: DeviceRevision[];
}

export type SortKey =
  | 'deviceName'
  | 'screenShape'
  | 'resolution'
  | 'physicalKeysCount'
  | 'osVersion'
  | 'chipset'
  | 'revisions';

export type SortDirection = 'asc' | 'desc';
