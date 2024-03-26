import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

test('renders start page', () => {
  render(<App />);

  const linkElement = screen.getByLabelText('Provide API token');
  expect(linkElement).toBeInTheDocument();
});
