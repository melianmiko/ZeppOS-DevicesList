import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Device } from '../types';

interface ResolutionProps {
  device: Device;
}

export function Resolution({ device }: ResolutionProps) {
  const { t } = useTranslation();
  const hasRadius = device.screenShape !== 'round' && device.screenRadius > 0;

  return (
    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
      {t('table.resolutionValue', {
        width: device.screenWidth,
        height: device.screenHeight,
      })}
      {hasRadius && ` (${t('table.radius', { radius: device.screenRadius })})`}
    </Text>
  );
}
