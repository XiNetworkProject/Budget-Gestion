import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

export const CardSkeleton = ({ lines = 3 }) => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="rounded" height={20} width="40%" sx={{ mb: 1 }} />
    <Stack spacing={1}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={14} />
      ))}
    </Stack>
  </Box>
);

export const GridSkeleton = ({ items = 6 }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
    {Array.from({ length: items }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={120} />
    ))}
  </Box>
);

export default { CardSkeleton, GridSkeleton };


