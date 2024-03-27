import React, { useState } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button, TextField, Typography } from '@mui/material'

import { ReactComponent as LogoSvg } from './logo.svg';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const TokenForm = (props: {
  setToken: (token: string) => void;
}): React.JSX.Element => {
  const [token, setToken] = useState<string>('');

  return (
    <>
      <LogoSvg className="App-logo"/>
      <TextField
        label="Provide API token"
        margin="normal"
        value={token}
        onChange={event => setToken(event.target.value)}/>
      <Button
        variant="contained"
        disabled={!token}
        onClick={() => props.setToken(token)}>
        Start
      </Button>
    </>
  )
}

const ImageLabeling = (): React.JSX.Element => {
  return (
    <>
      <Typography>TODO</Typography>
    </>
  )
}

const App = (): React.JSX.Element => {
  const [token, setToken] = useState<string>('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box className="App">
        <Box className="App-container">
          {token
            ? <ImageLabeling/>
            : <TokenForm setToken={setToken}/>}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
