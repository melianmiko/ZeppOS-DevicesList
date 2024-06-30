import {
  SCREEN_SHAPES,
  type Device,
  type DeviceRevision,
  type KnownScreenShape,
  type RawDevice,
  type ScreenShape,
  type SortKey,
} from '../types';

const SHAPE_ORDER: Record<ScreenShape, number> = {
  round: 0,
  square: 1,
  band: 2,
  unknown: 3,
};

const collator = new Intl.Collator('ru-RU', {
  numeric: true,
  sensitivity: 'base',
});

function isKnownScreenShape(value: string): value is KnownScreenShape {
  return (SCREEN_SHAPES as readonly string[]).includes(value);
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toKeyCount(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRevisions(raw: RawDevice): DeviceRevision[] {
  const sources = Array.isArray(raw.deviceSource) ? raw.deviceSource : [];
  const productionIds = Array.isArray(raw.productionId) ? raw.productionId : [];

  return sources.flatMap((source, index) => {
    if (typeof source !== 'number' || !Number.isFinite(source)) {
      return [];
    }

    const productionId = productionIds[index];
    return [
      {
        deviceSource: source,
        productionId:
          typeof productionId === 'number' && Number.isFinite(productionId)
            ? productionId
            : null,
      },
    ];
  });
}

export function normalizeDevice(raw: RawDevice): Device {
  return {
    id: raw.id,
    deviceName: raw.deviceName,
    alternativeDeviceNames: Array.isArray(raw.alternativeDeviceNames)
      ? raw.alternativeDeviceNames
      : [],
    chipset: raw.chipset,
    screenShape: isKnownScreenShape(raw.screenShape) ? raw.screenShape : 'unknown',
    screenWidth: toFiniteNumber(raw.screenWidth),
    screenHeight: toFiniteNumber(raw.screenHeight),
    screenRadius: toFiniteNumber(raw.screenRadius),
    physicalKeysCount: toKeyCount(raw.physicalKeysCount),
    osVersion: raw.osVersion,
    deviceImage: raw.deviceImage?.trim() || null,
    revisions: normalizeRevisions(raw),
  };
}

export function compareDevices(a: Device, b: Device, key: SortKey): number {
  switch (key) {
    case 'deviceName':
      return collator.compare(a.deviceName, b.deviceName);
    case 'screenShape':
      return (
        SHAPE_ORDER[a.screenShape] - SHAPE_ORDER[b.screenShape] ||
        collator.compare(a.deviceName, b.deviceName)
      );
    case 'resolution':
      return (
        a.screenWidth - b.screenWidth ||
        a.screenHeight - b.screenHeight ||
        collator.compare(a.deviceName, b.deviceName)
      );
    case 'physicalKeysCount':
      return a.physicalKeysCount - b.physicalKeysCount;
    case 'osVersion':
      return collator.compare(a.osVersion, b.osVersion);
    case 'chipset':
      return collator.compare(a.chipset, b.chipset);
    case 'revisions':
      return a.revisions.length - b.revisions.length;
  }
}

export function getDeviceSearchText(device: Device, shapeLabel = ''): string {
  const revisionParts = device.revisions.flatMap((revision) => [
    String(revision.deviceSource),
    revision.productionId === null ? '' : String(revision.productionId),
  ]);

  return [
    device.deviceName,
    device.id,
    ...device.alternativeDeviceNames,
    device.chipset,
    device.osVersion,
    device.screenShape,
    shapeLabel,
    ...revisionParts,
  ]
    .join(' ')
    .toLocaleLowerCase('ru-RU');
}
