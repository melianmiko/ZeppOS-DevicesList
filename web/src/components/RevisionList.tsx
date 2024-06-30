import { Badge, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { DeviceRevision } from '../types';

interface RevisionListProps {
  revisions: DeviceRevision[];
}

export function RevisionList({ revisions }: RevisionListProps) {
  const { t } = useTranslation();

  if (revisions.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }

  return (
    <Group gap={6} wrap="wrap" maw={310}>
      {revisions.map((revision, index) => (
        <Group
          key={`${revision.deviceSource}-${revision.productionId ?? 'null'}-${index}`}
          gap={3}
          wrap="nowrap"
          title={t('revisions.itemTitle', {
            source: revision.deviceSource,
            production: revision.productionId ?? t('revisions.notSpecified'),
          })}
        >
          <Badge variant="light" color="gray" size="sm" radius="sm" tt="none" fw={600}>
            {revision.deviceSource}
          </Badge>
          {revision.productionId !== null && (
            <>
              <Text size="xs" c="dimmed" aria-hidden="true">
                →
              </Text>
              <Badge variant="light" color="teal" size="sm" radius="sm" tt="none" fw={600}>
                {revision.productionId}
              </Badge>
            </>
          )}
        </Group>
      ))}
    </Group>
  );
}
