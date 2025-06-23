// src/App.tsx
import React from 'react';
import AppRouter from './router';
import { OutlineProvider } from './contexts/OutlineContext';

function App() {
  return (
    <OutlineProvider>
      <AppRouter />
    </OutlineProvider>
  );
}

export default App;
