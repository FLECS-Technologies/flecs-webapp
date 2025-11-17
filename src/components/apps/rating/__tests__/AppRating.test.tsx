/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Aug 16 2022
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, expect } from 'vitest';
import AppRating from '../AppRating';

const mockApp = {
  id: 37,
  name: 'Node-RED',
  average_rating: '3.00',
  rating_count: 4,
  // ...other properties omitted for brevity
};

describe('AppRating', () => {
  beforeEach(() => {
    // No setup needed for now
  });

  it('renders AppRating component with correct rating and count', () => {
    render(<AppRating app={mockApp} />);
    // Check the rating value (should be 3)
    const rating = screen.getByRole('img', { name: /3 Stars/i });
    expect(rating).toBeInTheDocument();
    // Check the count text
    expect(screen.getByText('(4)')).toBeInTheDocument();
  });

  it('renders AppRating component with no app', () => {
    render(<AppRating />);
    // Should render a rating (default 0)
    const rating = screen.getByRole('img', { name: /0 Stars/i });
    expect(rating).toBeInTheDocument();
    // Should render count as undefined
    expect(screen.getByText('()')).toBeInTheDocument();
  });
});
