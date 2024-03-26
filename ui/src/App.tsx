import React, { useState } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button, TextField } from '@mui/material'

import { ReactComponent as LogoSvg } from './logo.svg';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = (): React.JSX.Element => {
  const [token, setToken] = useState<string>('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box className="App">
        <Box className="App-container">
          <LogoSvg className="App-logo"/>
          <TextField
            label="Provide API token"
            margin="normal"
            value={token}
            onChange={event => setToken(event.target.value)}
          />
          <Button variant="contained" disabled={!token}>Start</Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
