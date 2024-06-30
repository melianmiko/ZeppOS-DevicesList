import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconClock,
  IconMoodEmpty,
  IconMoon,
  IconSearch,
  IconSun,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DeviceImage } from './components/DeviceImage';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Resolution } from './components/Resolution';
import { RevisionList } from './components/RevisionList';
import { SortableHeader } from './components/SortableHeader';
import { devices } from './data/devices';
import { compareDevices, getDeviceSearchText } from './lib/devices';
import {
  SCREEN_SHAPES,
  type ScreenShape,
  type SortDirection,
  type SortKey,
} from './types';

const SHAPE_LABEL_KEYS: Record<ScreenShape, string> = {
  round: 'shapes.round',
  square: 'shapes.square',
  band: 'shapes.band',
  unknown: 'shapes.unknown',
};

const shapeColors: Record<ScreenShape, string> = {
  round: 'teal',
  square: 'blue',
  band: 'violet',
  unknown: 'gray',
};

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) =>
    a.localeCompare(b, 'ru-RU', { numeric: true, sensitivity: 'base' }),
  );
}

const chipsetOptions = uniqueSorted(devices.map((device) => device.chipset)).map(
  (chipset) => ({ value: chipset, label: chipset }),
);

const osOptions = uniqueSorted(devices.map((device) => device.osVersion)).map(
  (version) => ({ value: version, label: version }),
);

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const [query, setQuery] = useState('');
  const [shape, setShape] = useState<string | null>(null);
  const [chipset, setChipset] = useState<string | null>(null);
  const [osVersion, setOsVersion] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({
    key: 'deviceName',
    direction: 'asc',
  });

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? 'en';
    document.title = t('meta.title');

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('meta.description'));
  }, [i18n.resolvedLanguage, t]);

  const shapeOptions = useMemo(
    () =>
      SCREEN_SHAPES.filter((shapeValue) =>
        devices.some((device) => device.screenShape === shapeValue),
      ).map((shapeValue) => ({
        value: shapeValue,
        label: t(SHAPE_LABEL_KEYS[shapeValue]),
      })),
    [t],
  );

  const hasActiveFilters = Boolean(
    query.trim() || shape || chipset || osVersion,
  );

  const visibleDevices = useMemo(() => {
    const tokens = query
      .trim()
      .toLocaleLowerCase('ru-RU')
      .split(/\s+/)
      .filter(Boolean);

    const filtered = devices.filter((device) => {
      if (shape && device.screenShape !== shape) {
        return false;
      }

      if (chipset && device.chipset !== chipset) {
        return false;
      }

      if (osVersion && device.osVersion !== osVersion) {
        return false;
      }

      if (tokens.length === 0) {
        return true;
      }

      const searchText = getDeviceSearchText(
        device,
        t(SHAPE_LABEL_KEYS[device.screenShape]),
      );
      return tokens.every((token) => searchText.includes(token));
    });

    return filtered.sort((a, b) => {
      const result = compareDevices(a, b, sort.key);
      return sort.direction === 'asc' ? result : -result;
    });
  }, [query, shape, chipset, osVersion, sort, t]);

  const handleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? {
            key,
            direction: current.direction === 'asc' ? 'desc' : 'asc',
          }
        : { key, direction: 'asc' },
    );
  };

  const resetFilters = () => {
    setQuery('');
    setShape(null);
    setChipset(null);
    setOsVersion(null);
  };

  return (
    <Box
      py={{ base: 'md', sm: 'xl' }}
      style={{ minHeight: '100vh', background: 'var(--mantine-color-body)' }}
    >
      <Container size="xl">
        <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
          <Group gap="md" align="center" wrap="nowrap">
            <ThemeIcon size={48} radius="md" variant="filled" visibleFrom="xs">
              <IconClock size={28} stroke={1.5} />
            </ThemeIcon>
            <div>
              <Title order={1} fz={{ base: 26, sm: 34 }} lh={1.15}>
                {t('header.title')}
              </Title>
              <Text c="dimmed" size="sm" mt={4}>
                {t('header.subtitle')}
              </Text>
            </div>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Badge variant="light" size="lg" radius="md" visibleFrom="sm">
              {t('header.models', { count: visibleDevices.length })}
              {visibleDevices.length !== devices.length
                ? ` ${t('header.ofTotal', { total: devices.length })}`
                : ''}
            </Badge>
            <LanguageSwitcher />
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={() =>
                setColorScheme(
                  computedColorScheme === 'dark' ? 'light' : 'dark',
                )
              }
              aria-label={t('header.themeToggle')}
              title={t('header.themeToggle')}
            >
              {computedColorScheme === 'dark' ? (
                <IconSun size={19} stroke={1.5} />
              ) : (
                <IconMoon size={19} stroke={1.5} />
              )}
            </ActionIcon>
          </Group>
        </Group>

        <Paper withBorder radius="lg" p="md" mt="xl" shadow="sm">
          <Group align="flex-end" gap="sm" wrap="wrap">
            <TextInput
              label={t('filters.search')}
              placeholder={t('filters.searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              leftSection={<IconSearch size={16} stroke={1.5} />}
              style={{ flex: '1 1 260px', minWidth: 220 }}
            />
            <Select
              label={t('filters.shape')}
              placeholder={t('filters.allShapes')}
              data={shapeOptions}
              value={shape}
              onChange={setShape}
              clearable
              w={{ base: '100%', xs: 170 }}
            />
            <Select
              label={t('filters.chipset')}
              placeholder={t('filters.allChipsets')}
              data={chipsetOptions}
              value={chipset}
              onChange={setChipset}
              clearable
              w={{ base: '100%', xs: 170 }}
            />
            <Select
              label={t('filters.osVersion')}
              placeholder={t('filters.allVersions')}
              data={osOptions}
              value={osVersion}
              onChange={setOsVersion}
              clearable
              w={{ base: '100%', xs: 160 }}
            />
            <Button
              variant="light"
              color="gray"
              leftSection={<IconX size={16} stroke={1.5} />}
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              w={{ base: '100%', xs: 'auto' }}
            >
              {t('filters.reset')}
            </Button>
          </Group>
        </Paper>

        <Paper withBorder radius="lg" mt="md" shadow="sm" style={{ overflow: 'hidden' }}>
          <Text size="xs" c="dimmed" px="sm" pt="sm" hiddenFrom="md">
            {t('table.scrollHint')}
          </Text>
          <Table.ScrollContainer minWidth={1180}>
            <Table
              highlightOnHover
              verticalSpacing="sm"
              horizontalSpacing="md"
              stickyHeader
              aria-label={t('table.ariaLabel')}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th scope="col" style={{ width: 88, textAlign: 'center' }}>
                    {t('table.photo')}
                  </Table.Th>
                  <SortableHeader
                    label={t('table.model')}
                    sortKey="deviceName"
                    activeKey={sort.key}
                    direction={sort.direction}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={t('table.shape')}
                    sortKey="screenShape"
                    activeKey={sort.key}
                    direction={sort.direction}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={t('table.resolution')}
                    sortKey="resolution"
                    activeKey={sort.key}
                    direction={sort.direction}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={t('table.physicalKeys')}
                    sortKey="physicalKeysCount"
                    activeKey={sort.key}
                    direction={sort.direction}
                    onSort={handleSort}
                    align="center"
                  />
                  <SortableHeader
                    label={t('table.osVersion')}
                    sortKey="osVersion"
                    activeKey={sort.key}
                    direction={sort.direction}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={t('table.chipset')}
                    sortKey="chipset"
                    activeKey={sort.key}
                    direction={sort.direction}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={t('table.revisions')}
                    sortKey="revisions"
                    activeKey={sort.key}
                    direction={sort.direction}
                    onSort={handleSort}
                    tooltip={t('table.revisionsTooltip')}
                  />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visibleDevices.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Stack align="center" gap="xs" py="xl">
                        <ThemeIcon variant="light" color="gray" size={48} radius="xl">
                          <IconMoodEmpty size={26} stroke={1.5} />
                        </ThemeIcon>
                        <Text fw={600}>{t('table.emptyTitle')}</Text>
                        <Text size="sm" c="dimmed" ta="center">
                          {t('table.emptyDescription')}
                        </Text>
                        <Button variant="light" size="xs" mt={4} onClick={resetFilters}>
                          {t('table.resetFilters')}
                        </Button>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  visibleDevices.map((device) => (
                    <Table.Tr key={device.id}>
                      <Table.Td>
                        <DeviceImage
                          src={device.deviceImage}
                          alt={`${device.deviceName} (${device.id})`}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {device.deviceName}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          ({device.id})
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={shapeColors[device.screenShape]}
                          radius="sm"
                          size="sm"
                          tt="none"
                        >
                          {t(SHAPE_LABEL_KEYS[device.screenShape])}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Resolution device={device} />
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Text size="sm">{device.physicalKeysCount}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" ff="monospace">
                          {device.osVersion}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="outline" color="gray" radius="sm" size="sm" tt="lowercase">
                          {device.chipset}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <RevisionList revisions={device.revisions} />
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Group
            justify="space-between"
            align="center"
            gap="sm"
            p="sm"
            style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
          >
            <Group gap={6} align="center">
              <Text size="xs" c="dimmed">
                {t('revisions.title')}
              </Text>
              <Badge variant="light" color="gray" size="sm" radius="sm" tt="none">
                deviceSource
              </Badge>
              <Text size="xs" c="dimmed" aria-hidden="true">
                →
              </Text>
              <Badge variant="light" color="teal" size="sm" radius="sm" tt="none">
                productionId
              </Badge>
              <Text size="xs" c="dimmed">
                {t('revisions.nullOmitted')}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {t('footer.shown', {
                visible: visibleDevices.length,
                total: devices.length,
              })}
            </Text>
          </Group>
        </Paper>

        <Group justify="space-between" align="center" mt="lg" gap="xs" wrap="wrap">
          <Text size="xs" c="dimmed">
            {t('footer.source')}{' '}
            <Anchor
              href="https://github.com/melianmiko/ZeppOS-DevicesList"
              target="_blank"
              rel="noreferrer"
              size="xs"
            >
              zepp_devices.json
            </Anchor>
          </Text>
          <Text size="xs" c="dimmed">
            {t('footer.buildTime')}
          </Text>
        </Group>
      </Container>
    </Box>
  );
}
