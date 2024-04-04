import React, { useRef, useState } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button, ButtonGroup, Chip, TextField } from '@mui/material'

import { ReactComponent as LogoSvg } from './logo.svg';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || '';

type AwsRekognitionLabel = {
  Name: string,
  Confidence: number,
}

export type AwsRekognitionResponse = {
  Labels: AwsRekognitionLabel[],
}

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const TokenForm = (props: {
  setToken: (token: string) => void;
}): React.JSX.Element => {
  const [token, setToken] = useState<string>(API_TOKEN);

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

const ImageComponent = (props: {
  response?: AwsRekognitionResponse;
  processFile: (file: File) => void;
}): React.JSX.Element => {
  const [file, setFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement | null>(null);

  const { response, processFile } = props;

  return (
    <>
      <Box pb={1}>
        {file
          ? <img alt="Uploaded" src={URL.createObjectURL(file)}/>
          : <LogoSvg className="App-logo"/>}
      </Box>
      <Box pb={2} display="flex" justifyContent="flex-end">
        {(response?.Labels || []).map(label =>
          <Box pr={1} key={label.Name}><Chip label={`${label.Name} ${Math.round(label.Confidence)}%`}/></Box>
        )}
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
          onClick={() => file && processFile(file)}>
          Process
        </Button>
      </ButtonGroup>
    </>
  )
}

const App = (): React.JSX.Element => {
  const [token, setToken] = useState<string>('');
  const [response, setResponse] = useState<AwsRekognitionResponse>();

  const fileToBase64 = async (file: File) => {
    const removePrefix = (base64: string | ArrayBuffer | null) =>
      typeof base64 === 'string' ? base64.split('base64,')[1] : '';

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(removePrefix(reader.result));
      reader.onerror = reject;
    });
  }

  const processFile = async (file: File) => {
    const body = {
      file: {
        name: file.name,
        data: await fileToBase64(file),
      }
    }

    const result = await fetch(`${API_URL}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': token,
      },
      body: JSON.stringify(body),
    });

    const response = (await result.json()) as AwsRekognitionResponse;
    setResponse(response);

    console.log(response);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box className="App">
        <Box className="App-container">
          {token
            ? <ImageComponent response={response} processFile={processFile}/>
            : <TokenForm setToken={setToken}/>}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
