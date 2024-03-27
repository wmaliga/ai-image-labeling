import React, { useRef, useState } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button, ButtonGroup, TextField } from '@mui/material'

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

const ImageLabeling = (props: {
  processFile: (file: File) => void;
}): React.JSX.Element => {
  const [file, setFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <Box p={1}>
        {file
          ? <img alt="Uploaded" src={URL.createObjectURL(file)}/>
          : <LogoSvg className="App-logo"/>}
      </Box>
      <ButtonGroup>
        <Button
          variant="outlined"
          onClick={() => fileInput?.current?.click()}>
          Upload file
        </Button>
        <input
          type="file"
          data-testid="upload-input"
          ref={fileInput}
          style={{ display: 'none' }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0])}/>
        <Button
          variant="outlined"
          disabled={!file}
          onClick={() => file && props.processFile(file)}>
          Process
        </Button>
      </ButtonGroup>
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
            ? <ImageLabeling processFile={file => alert(`Processing: ${file.name}`)}/>
            : <TokenForm setToken={setToken}/>}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
