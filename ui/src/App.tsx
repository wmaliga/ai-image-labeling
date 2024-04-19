import React, { useRef, useState } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Alert, Box, Button, Chip, TextField } from '@mui/material'

import { ReactComponent as LogoSvg } from './logo.svg';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || '';

type AwsRekognitionBoundingBox = {
  Left: number;
  Top: number;
  Width: number;
  Height: number;
}

type AwsRekognitionInstance = {
  BoundingBox: AwsRekognitionBoundingBox;
  Confidence: number;
}

type AwsRekognitionLabel = {
  Name: string;
  Confidence: number;
  Instances: AwsRekognitionInstance[];
}

export type AwsRekognitionResponse = {
  Labels: AwsRekognitionLabel[];
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

const InstanceBox = (props: {
  label: AwsRekognitionLabel;
  instance: AwsRekognitionInstance;
}): React.JSX.Element => {
  const { label, instance } = props;
  const name = label.Name;
  const box = instance.BoundingBox;

  return (
    <Box
      sx={{
        border: '1px solid red',
        position: 'absolute',
        left: `${Math.round(box.Left * 100)}%`,
        top: `${Math.round(box.Top * 100)}%`,
        width: `${Math.round(box.Width * 100)}%`,
        height: `${Math.round(box.Height * 100)}%`,
      }}>
      <Box
        className="App-description"
        sx={{ position: 'absolute', right: 0 }}>
        {`${Math.round(instance.Confidence)}%`}
      </Box>
      <Box
        className="App-description"
        sx={{ position: 'absolute', left: 0 }}>
        {name.toUpperCase()}
      </Box>
    </Box>
  )
}

const ImageComponent = (props: {
  processing: boolean;
  response?: AwsRekognitionResponse;
  processFile: (file: File) => void;
}): React.JSX.Element => {
  const [file, setFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement | null>(null);

  const { processing, response, processFile } = props;

  return (
    <Box className="App-content">
      <Box pb={1} className="App-frame">
        {file
          ? <img className="App-image" alt="Uploaded" src={URL.createObjectURL(file)}/>
          : <LogoSvg className="App-logo"/>}
        {(response?.Labels || [])
          .map(label => label.Instances.map(instance => [label, instance] as const))
          .flat(1)
          .map(([label, instance]) =>
            <InstanceBox
              key={`${label}-${instance.BoundingBox.Left}`}
              label={label}
              instance={instance}/>
          )
        }
      </Box>
      <Box className="App-labels">
        {(response?.Labels || []).map(label =>
          <Box pr={1} key={label.Name}><Chip label={`${label.Name} ${Math.round(label.Confidence)}%`}/></Box>
        )}
      </Box>
      <Box className="App-buttons">
        <Button
          sx={{ padding: 1 }}
          variant="outlined"
          disabled={processing}
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
          disabled={processing || !file}
          onClick={() => file && processFile(file)}>
          Process
        </Button>
      </Box>
    </Box>
  )
}

const App = (): React.JSX.Element => {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
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
    setProcessing(true);
    setError('');
    setResponse(undefined);

    try {
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
    } catch (error) {
      error instanceof Error && setError(error.message);
    }

    setProcessing(false);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box className="App">
        <Box className="App-container">
          <Box className="App-header">
            {processing && <Alert severity="info">Processing image...</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
          {token
            ? <ImageComponent processing={processing} response={response} processFile={processFile}/>
            : <TokenForm setToken={setToken}/>}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
