import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import App from './App';

describe('application', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn();

    jest.spyOn(global, 'fetch');
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({})
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

    const tokenInput = screen.getByLabelText('Provide API token');
    fireEvent.change(tokenInput, { target: { value: 'token' } });

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    const uploadButton = screen.getByText('Upload file');
    expect(uploadButton).toBeInTheDocument();
  });

  test('uploads file', async () => {
    const file = new File(['data'], 'file.jpeg', { type: 'image/jpeg' });

    render(<App/>);

    const tokenInput = screen.getByLabelText('Provide API token');
    fireEvent.change(tokenInput, { target: { value: 'token' } });

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    const uploadInput = screen.getByTestId('upload-input');
    fireEvent.change(uploadInput, { target: { files: [file] } });

    const processButton = screen.getByText('Process');
    fireEvent.click(processButton);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/images'),
        expect.objectContaining({
          method: 'POST',
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
});