import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { TailBuffer } from './limits.js';

/** The tail a TailBuffer of `max` bytes must keep of `chunks`. */
function expectedTail(chunks: Uint8Array[], max: number): string {
  const all = Buffer.concat(chunks);
  return all.subarray(Math.max(0, all.byteLength - max)).toString('latin1');
}

function fill(chunks: Uint8Array[], max: number): TailBuffer {
  const tail = new TailBuffer(max);
  for (const chunk of chunks) tail.push(chunk);
  return tail;
}

/** `size` ASCII bytes, distinct from their neighbours. */
function ascii(size: number, seed = 0): Uint8Array {
  return Uint8Array.from({ length: size }, (_, i) => 32 + ((seed + i) % 95));
}

describe('TailBuffer', { tags: ['SM-4'] }, () => {
  it('keeps exactly the last max bytes, whatever the chunk sizes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 64 }),
        fc.array(fc.uint8Array({ max: 0x7f, maxLength: 160 }), {
          maxLength: 20,
        }),
        (max, chunks) => {
          expect(fill(chunks, max).toString()).toBe(expectedTail(chunks, max));
        },
      ),
      { numRuns: 1000 },
    );
  });

  it.each([
    ['a large chunk, then one byte', [64 * 1024 + 5, 1]],
    ['one byte, then a large chunk', [1, 64 * 1024]],
    ['a chunk of exactly max bytes, then one byte', [64 * 1024, 1]],
    ['chunks larger than max', [100 * 1024, 70 * 1024]],
    ['1 MiB in 3.5 KB chunks', Array.from({ length: 300 }, () => 3500)],
    ['1 MiB in 1 byte chunks', Array.from({ length: 1024 * 1024 }, () => 1)],
  ])('keeps the last 64 KiB of %s', (_, sizes) => {
    let seed = 0;
    const chunks = sizes.map((size) => {
      const chunk = ascii(size, seed);
      seed += size;
      return chunk;
    });
    const kept = new TailBuffer();
    for (const chunk of chunks) kept.push(chunk);
    const text = kept.toString();
    expect(text).toBe(expectedTail(chunks, 64 * 1024));
    expect(text.length).toBe(
      Math.min(
        64 * 1024,
        sizes.reduce((a, b) => a + b, 0),
      ),
    );
  });

  it('leaves out a UTF-8 character cut at the start, not as U+FFFD', () => {
    const euro = new TextEncoder().encode('€'); // 3 bytes
    for (const char of ['é', '€', '𝄞']) {
      const bytes = new TextEncoder().encode(`ab${char}xy`);
      const charEnd = bytes.byteLength - 2;
      const charStart = charEnd - new TextEncoder().encode(char).byteLength;
      for (let max = 1; max <= bytes.byteLength; max++) {
        const cut = bytes.byteLength - max;
        const expected =
          cut > charStart && cut < charEnd
            ? 'xy'
            : Buffer.from(bytes.subarray(cut)).toString('utf8');
        // in one chunk, and byte by byte
        expect(fill([bytes], max).toString(), `${char} ${max}`).toBe(expected);
        const single = Array.from(bytes, (byte) => Uint8Array.of(byte));
        expect(fill(single, max).toString(), `${char} ${max}`).toBe(expected);
      }
    }
    // A character cut in the middle of the kept bytes by a chunk boundary
    // is joined again.
    const tail = new TailBuffer(16);
    tail.push(euro.subarray(0, 1));
    tail.push(euro.subarray(1));
    expect(tail.toString()).toBe('€');
    // A whole character at the start is kept.
    const whole = new TailBuffer(5);
    whole.push(new TextEncoder().encode('abc€de'));
    expect(whole.toString()).toBe('€de');
  });

  it('decodes any UTF-8 tail as the bytes it keeps, wherever the buffer wraps', () => {
    // The kept bytes, without the continuation bytes of a character cut at
    // the start, decoded in one piece.
    const reference = (bytes: Uint8Array, max: number): string => {
      let tail = bytes.subarray(Math.max(0, bytes.byteLength - max));
      if (tail.byteLength < bytes.byteLength) {
        let skip = 0;
        while (
          skip < 3 &&
          skip < tail.byteLength &&
          (tail[skip] & 0xc0) === 0x80
        ) {
          skip++;
        }
        tail = tail.subarray(skip);
      }
      return new TextDecoder().decode(tail);
    };
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 32 }),
        fc.array(fc.string({ unit: 'binary', maxLength: 12 }), {
          maxLength: 12,
        }),
        (max, texts) => {
          const chunks = texts.map((text) => new TextEncoder().encode(text));
          const all = new Uint8Array(Buffer.concat(chunks));
          expect(fill(chunks, max).toString()).toBe(reference(all, max));
        },
      ),
      { numRuns: 2000 },
    );
  });

  it('keeps nothing with max 0', () => {
    expect(fill([ascii(10)], 0).toString()).toBe('');
  });
});
