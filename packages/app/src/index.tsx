import { Box, CssBaseline } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppNav from './AppNav';
import FabricPage from './Fabric';
import { StoreContext, useStoreData } from './Store';

function Root() {
  return (
    <StoreContext value={useStoreData()}>
      <Box>
        <AppNav />
        <FabricPage />
      </Box>
    </StoreContext>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline />
    <Root />
  </StrictMode>
);
