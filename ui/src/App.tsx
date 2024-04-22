import React, { useRef, useState } from 'react';

import { Alert, Box, Button, Chip, TextField } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import './App.css';
import { ReactComponent as LogoSvg } from './logo.svg';

const PERCENT = 100;

const API_URL = process.env.REACT_APP_API_URL || '';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || '';

interface IAwsRekognitionBoundingBox {
  Left: number;
  Top: number;
  Width: number;
  Height: number;
}

interface IAwsRekognitionInstance {
  BoundingBox: IAwsRekognitionBoundingBox;
  Confidence: number;
}

interface IAwsRekognitionLabel {
  Name: string;
  Confidence: number;
  Instances: IAwsRekognitionInstance[];
}

export interface IAwsRekognitionResponse {
  Labels: IAwsRekognitionLabel[];
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
        onChange={(event) => setToken(event.target.value)}/>
      <Button
        variant="contained"
        disabled={!token}
        onClick={() => props.setToken(token)}>
        Start
      </Button>
    </>
  );
};

const InstanceBox = (props: {
  label: IAwsRekognitionLabel;
  instance: IAwsRekognitionInstance;
}): React.JSX.Element => {
  const { label, instance } = props;
  const name = label.Name;
  const box = instance.BoundingBox;

  return (
    <Box
      sx={{
        border: '1px solid red',
        position: 'absolute',
        left: `${Math.round(box.Left * PERCENT)}%`,
        top: `${Math.round(box.Top * PERCENT)}%`,
        width: `${Math.round(box.Width * PERCENT)}%`,
        height: `${Math.round(box.Height * PERCENT)}%`,
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
  );
};

const ImageComponent = (props: {
  processing: boolean;
  response?: IAwsRekognitionResponse;
  processFile: (file: File) => void;
}): React.JSX.Element => {
  const [file, setFile] = useState<File>();
  // tslint:disable-next-line:no-null-keyword
  const fileInput = useRef<HTMLInputElement | null>(null);

  const { processing, response, processFile } = props;

  return (
    <Box className="App-content">
      <Box pb={1} className="App-frame">
        {file
          ? <img className="App-image" alt="Uploaded" src={URL.createObjectURL(file)}/>
          : <LogoSvg className="App-logo"/>}
        {(response?.Labels || [])
          .map((label) => label.Instances.map((instance) => [label, instance] as const))
          .flat(1)
          .map(([label, instance]) =>
            <InstanceBox
              key={`${label.Name}-${instance.BoundingBox.Left}`}
              label={label}
              instance={instance}/>
          )
        }
      </Box>
      <Box className="App-labels">
        {(response?.Labels || []).map((label) =>
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
  );
};

export const App = (): React.JSX.Element => {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [response, setResponse] = useState<IAwsRekognitionResponse>();

  const fileToBase64 = async (file: File) => {
    const removePrefix = (base64: string | ArrayBuffer | null) =>
      typeof base64 === 'string' ? base64.split('base64,')[1] : '';

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(removePrefix(reader.result));
      reader.onerror = reject;
    });
  };

  const processFile = async (file: File) => {
    setProcessing(true);
    setError('');
    setResponse(undefined);

    try {
      const body = {
        file: {
          name: file.name,
          data: await fileToBase64(file),
        },
      };

      const result = await fetch(`${API_URL}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token,
        },
        body: JSON.stringify(body),
      });

      const resp = (await result.json()) as IAwsRekognitionResponse;
      setResponse(resp);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }

    setProcessing(false);
  };

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
};
