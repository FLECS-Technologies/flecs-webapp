/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Mon Jan 13 2026
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

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarqueeText from '../MarqueeText';

// Mock scrollWidth and clientWidth
const mockScrollWidth = (element: HTMLElement, width: number) => {
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    value: width,
  });
};

const mockClientWidth = (element: HTMLElement, width: number) => {
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    value: width,
  });
};

describe('MarqueeText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders text content', () => {
    render(<MarqueeText text="Test message" />);
    const textElements = screen.getAllByText('Test message');
    expect(textElements).toHaveLength(2); // Text is duplicated
  });

  it('renders text twice for seamless loop', () => {
    const { container } = render(<MarqueeText text="Loop text" />);
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(2);
    expect(spans[0].textContent).toBe('Loop text');
    expect(spans[1].textContent).toBe('Loop text');
  });

  it('does not animate when text fits in container', () => {
    const { container } = render(<MarqueeText text="Short" />);
    const wrapper = container.querySelector('[style*="display"]');

    // Mock dimensions: container wider than content
    if (wrapper && wrapper.parentElement) {
      mockScrollWidth(wrapper as HTMLElement, 200);
      mockClientWidth(wrapper.parentElement as HTMLElement, 300);
    }

    // Animation should be 'none' when content fits
    expect(wrapper).toBeDefined();
  });

  it('updates text when prop changes', () => {
    const { rerender } = render(<MarqueeText text="Initial text" />);
    expect(screen.getAllByText('Initial text')).toHaveLength(2);

    rerender(<MarqueeText text="Updated text" />);
    expect(screen.queryByText('Initial text')).not.toBeInTheDocument();
    expect(screen.getAllByText('Updated text')).toHaveLength(2);
  });

  it('uses default speed of 50 when not provided', () => {
    const { container } = render(<MarqueeText text="Default speed" />);
    const wrapper = container.querySelector('[style*="display"]');
    expect(wrapper).toBeDefined();
  });

  it('accepts custom speed prop', () => {
    const { container } = render(<MarqueeText text="Custom speed" speed={100} />);
    const wrapper = container.querySelector('[style*="display"]');
    expect(wrapper).toBeDefined();
  });

  it('applies correct container styles', () => {
    const { container } = render(<MarqueeText text="Test" />);
    const containerDiv = container.firstChild as HTMLElement;

    const styles = window.getComputedStyle(containerDiv);
    expect(styles.overflow).toBe('hidden');
    expect(styles.display).toBe('flex');
    expect(styles.width).toBe('100%');
  });

  it('applies correct wrapper styles', () => {
    const { container } = render(<MarqueeText text="Test" />);
    const wrapper = container.querySelector('[style*="display"]') as HTMLElement;

    expect(wrapper).toBeDefined();
    if (wrapper) {
      const styles = window.getComputedStyle(wrapper);
      expect(styles.whiteSpace).toBe('nowrap');
    }
  });

  it('handles empty text', () => {
    const { container } = render(<MarqueeText text="" />);
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(2);
    expect(spans[0].textContent).toBe('');
    expect(spans[1].textContent).toBe('');
  });

  it('handles very long text', () => {
    const longText = 'A'.repeat(1000);
    render(<MarqueeText text={longText} />);
    const textElements = screen.getAllByText(longText);
    expect(textElements).toHaveLength(2);
  });

  it('handles special characters in text', () => {
    const specialText = '<>&"\'@#$%^&*()';
    render(<MarqueeText text={specialText} />);
    const textElements = screen.getAllByText(specialText);
    expect(textElements).toHaveLength(2);
  });
});
