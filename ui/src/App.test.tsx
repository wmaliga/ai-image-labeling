import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import App, { AwsRekognitionResponse } from './App';

const response: AwsRekognitionResponse = {
  Labels: [
    {
      Name: 'Sunflower', Confidence: 99, Instances: [
        {
          BoundingBox: { Left: 0, Top: 0, Width: 0, Height: 0 },
          Confidence: 98,
        }
      ]
    }
  ]
};

const inputText = (text: string, value: string) => {
  const input = screen.getByLabelText(text);
  fireEvent.change(input, { target: { value } });
}

const inputFile = (testId: string, file: File) => {
  const input = screen.getByTestId(testId);
  fireEvent.change(input, { target: { files: [file] } });
}

const clickButton = (text: string) => {
  const button = screen.getByText(text);
  fireEvent.click(button);
}

describe('application', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn();

    jest.spyOn(global, 'fetch');
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(response)
    })
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders start page', () => {
    render(<App/>);

    const tokenInput = screen.getByLabelText('Provide API token');
    expect(tokenInput).toBeInTheDocument();
  });

  test('opens image labeling', () => {
    render(<App/>);

    inputText('Provide API token', 'token');
    clickButton('Start');

    const uploadButton = screen.getByText('Upload file');
    expect(uploadButton).toBeInTheDocument();
  });

  test('uploads file', async () => {
    const file = new File(['data'], 'file.jpeg', { type: 'image/jpeg' });

    render(<App/>);

    inputText('Provide API token', 'token');
    clickButton('Start');
    inputFile('upload-input', file);
    clickButton('Process');

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/images'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'token',
          },
          body: JSON.stringify({
            file: {
              name: 'file.jpeg',
              data: 'ZGF0YQ=='
            }
          }),
        }),
      )
    );
  });

  test('displays labels', async () => {
    const file = new File(['data'], 'file.jpeg', { type: 'image/jpeg' });

    render(<App/>);

    inputText('Provide API token', 'token');
    clickButton('Start');
    inputFile('upload-input', file);
    clickButton('Process');

    await waitFor(() => {
      expect(screen.getByText('Sunflower 99%')).toBeInTheDocument();
      expect(screen.getByText('SUNFLOWER')).toBeInTheDocument();
      expect(screen.getByText('98%')).toBeInTheDocument();
    });
  });
});