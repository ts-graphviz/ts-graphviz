// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GraphImage } from '.';

let live: Set<string>;
beforeEach(() => {
  let n = 0;
  live = new Set();
  URL.createObjectURL = vi.fn(() => {
    const url = `blob:test/${n++}`;
    live.add(url);
    return url;
  });
  URL.revokeObjectURL = vi.fn((url: string) => {
    live.delete(url);
  });
});

describe('GraphImage', () => {
  it('shows the SVG through a live object URL, also under StrictMode', async () => {
    render(
      <StrictMode>
        <GraphImage svg="<svg/>" />
      </StrictMode>,
    );
    const img = await screen.findByRole('img', { name: 'Rendered graph' });
    const src = img.getAttribute('src') ?? '';
    expect(live.has(src)).toBe(true);
    // StrictMode's extra effect run left nothing behind.
    expect(live.size).toBe(1);
  });

  it('revokes replaced and unmounted URLs', async () => {
    const { rerender, unmount } = render(<GraphImage svg="<svg>a</svg>" />);
    const first = (await screen.findByRole('img')).getAttribute('src');
    rerender(<GraphImage svg="<svg>b</svg>" />);
    await vi.waitFor(() =>
      expect(screen.getByRole('img').getAttribute('src')).not.toBe(first),
    );
    expect(live.has(first ?? '')).toBe(false);
    unmount();
    expect(live.size).toBe(0);
  });
});
