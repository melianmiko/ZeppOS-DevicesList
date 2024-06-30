import rawDevices from '../../../zepp_devices.json';
import { normalizeDevice } from '../lib/devices';
import type { RawDevice } from '../types';

// The source of truth is the repository-level zepp_devices.json.
export const devices = (rawDevices as unknown as RawDevice[]).map(normalizeDevice);
