import { Group, Table, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconArrowsSort, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { SortDirection, SortKey } from '../types';

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'center' | 'right';
  tooltip?: string;
}

export function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
  tooltip,
}: SortableHeaderProps) {
  const { t } = useTranslation();
  const isActive = activeKey === sortKey;
  const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

  const labelNode = (
    <Group gap={4} wrap="nowrap" justify={justify}>
      <Text component="span" fw={600} size="sm">
        {label}
      </Text>
      {isActive ? (
        direction === 'asc' ? (
          <IconChevronUp size={14} stroke={2} aria-hidden="true" />
        ) : (
          <IconChevronDown size={14} stroke={2} aria-hidden="true" />
        )
      ) : (
        <IconArrowsSort size={14} stroke={1.5} opacity={0.35} aria-hidden="true" />
      )}
    </Group>
  );

  return (
    <Table.Th
      scope="col"
      style={{ textAlign: align }}
      aria-sort={
        isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <UnstyledButton
        onClick={() => onSort(sortKey)}
        aria-label={t('table.sortBy', { column: label })}
        w="100%"
      >
        {tooltip ? (
          <Tooltip label={tooltip} multiline w={260} withArrow>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </UnstyledButton>
    </Table.Th>
  );
}
