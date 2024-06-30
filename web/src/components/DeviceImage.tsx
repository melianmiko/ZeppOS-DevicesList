import { useEffect, useState } from 'react';
import { Anchor, Box, Image, ThemeIcon } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface DeviceImageProps {
  src: string | null;
  alt: string;
}

const FRAME_SIZE = 68;

export function DeviceImage({ src, alt }: DeviceImageProps) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <Box
        w={FRAME_SIZE}
        h={FRAME_SIZE}
        bg="var(--mantine-color-default)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--mantine-radius-md)',
        }}
        aria-label={t('deviceImage.unavailable', { name: alt })}
      >
        <ThemeIcon variant="light" color="gray" size="lg" radius="md">
          <IconPhoto size={20} stroke={1.5} />
        </ThemeIcon>
      </Box>
    );
  }

  return (
    <Anchor
      href={src}
      target="_blank"
      rel="noreferrer"
      underline="never"
      aria-label={t('deviceImage.open', { name: alt })}
      style={{ display: 'block' }}
    >
      <Box
        w={FRAME_SIZE}
        h={FRAME_SIZE}
        p={4}
        bg="var(--mantine-color-default)"
        style={{ borderRadius: 'var(--mantine-radius-md)' }}
      >
        <Image
          src={src}
          alt={alt}
          w="100%"
          h="100%"
          fit="contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </Box>
    </Anchor>
  );
}
