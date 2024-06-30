export const en = {
  translation: {
    meta: {
      title: 'ZeppOS Devices — watch model catalog',
      description:
        'Catalog of ZeppOS watch models: displays, chipsets, buttons, and device revisions.',
    },
    header: {
      title: 'ZeppOS Devices',
      subtitle: 'Watch models, displays, chipsets, and device revisions',
      models_one: '{{count}} model',
      models_other: '{{count}} models',
      ofTotal: 'of {{total}}',
      themeToggle: 'Toggle color theme',
    },
    filters: {
      search: 'Search',
      searchPlaceholder: 'Name, id, chipset, revision…',
      shape: 'Shape',
      allShapes: 'All shapes',
      chipset: 'Chipset',
      allChipsets: 'All chipsets',
      osVersion: 'ZeppOS',
      allVersions: 'All versions',
      reset: 'Reset',
    },
    shapes: {
      round: 'Round',
      square: 'Square',
      band: 'Band',
      unknown: 'Unknown',
    },
    table: {
      photo: 'Photo',
      model: 'Model',
      shape: 'Shape',
      resolution: 'Resolution',
      physicalKeys: 'Buttons',
      osVersion: 'ZeppOS',
      chipset: 'Chipset',
      revisions: 'Revisions',
      resolutionValue: '{{width}} × {{height}} px',
      radius: 'R {{radius}} px',
      sortBy: 'Sort by "{{column}}"',
      revisionsTooltip:
        'deviceSource → productionId pairs. When productionId is null, only deviceSource is shown.',
      emptyTitle: 'Nothing found',
      emptyDescription: 'Try changing the search query or resetting the filters.',
      resetFilters: 'Reset filters',
      scrollHint: 'Scroll the table horizontally to see all specifications →',
      ariaLabel: 'ZeppOS watch model table',
    },
    revisions: {
      title: 'Revisions:',
      nullOmitted: '(null is omitted)',
      notSpecified: 'not specified',
      itemTitle: 'deviceSource: {{source}}, productionId: {{production}}',
    },
    footer: {
      source: 'Data source:',
      buildTime: 'As of the build time',
      shown: 'Showing {{visible}} of {{total}}',
    },
    deviceImage: {
      unavailable: 'Image unavailable: {{name}}',
      open: 'Open image: {{name}}',
    },
    language: {
      label: 'Interface language',
    },
  },
} as const;
