import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import App from './App';

test('renders start page', () => {
  render(<App/>);

  const tokenInput = screen.getByLabelText('Provide API token');
  expect(tokenInput).toBeInTheDocument();
});

test('opens image labeling', () => {
  render(<App/>);

  const tokenInput = screen.getByLabelText('Provide API token');
  fireEvent.change(tokenInput, { target: { value: 'token' } })

  const startButton = screen.getByText('Start');
  fireEvent.click(startButton);

  const todo = screen.getByText('TODO');
  expect(todo).toBeInTheDocument();
});