export const ru = {
  translation: {
    meta: {
      title: 'ZeppOS Devices — каталог моделей часов',
      description:
        'Каталог моделей часов ZeppOS: экраны, чипсеты, кнопки и ревизии устройств.',
    },
    header: {
      title: 'ZeppOS Devices',
      subtitle: 'Модели часов, экраны, чипсеты и ревизии устройств',
      models_one: '{{count}} модель',
      models_few: '{{count}} модели',
      models_many: '{{count}} моделей',
      models_other: '{{count}} модели',
      ofTotal: 'из {{total}}',
      themeToggle: 'Переключить цветовую тему',
    },
    filters: {
      search: 'Поиск',
      searchPlaceholder: 'Название, id, чипсет, ревизия…',
      shape: 'Форма',
      allShapes: 'Все формы',
      chipset: 'Чипсет',
      allChipsets: 'Все чипсеты',
      osVersion: 'ZeppOS',
      allVersions: 'Все версии',
      reset: 'Сбросить',
    },
    shapes: {
      round: 'Круглые',
      square: 'Квадратные',
      band: 'Браслет',
      unknown: 'Неизвестно',
    },
    table: {
      photo: 'Фото',
      model: 'Модель',
      shape: 'Форма',
      resolution: 'Разрешение',
      physicalKeys: 'Кол-во кнопок',
      osVersion: 'ZeppOS',
      chipset: 'Чипсет',
      revisions: 'Ревизии',
      resolutionValue: '{{width}} × {{height}} px',
      radius: 'R {{radius}} px',
      sortBy: 'Сортировать по столбцу «{{column}}»',
      revisionsTooltip:
        'Пары deviceSource → productionId. Если productionId равен null, выводится только deviceSource.',
      emptyTitle: 'Ничего не найдено',
      emptyDescription: 'Попробуйте изменить запрос или сбросить фильтры.',
      resetFilters: 'Сбросить фильтры',
      scrollHint:
        'Прокрутите таблицу горизонтально, чтобы увидеть все характеристики →',
      ariaLabel: 'Таблица моделей часов ZeppOS',
    },
    revisions: {
      title: 'Ревизии:',
      nullOmitted: '(null не выводится)',
      notSpecified: 'не указан',
      itemTitle: 'deviceSource: {{source}}, productionId: {{production}}',
    },
    footer: {
      source: 'Источник данных:',
      buildTime: 'Актуально на момент сборки приложения',
      shown: 'Показано {{visible}} из {{total}}',
    },
    deviceImage: {
      unavailable: 'Изображение недоступно: {{name}}',
      open: 'Открыть изображение: {{name}}',
    },
    language: {
      label: 'Язык интерфейса',
    },
  },
} as const;
