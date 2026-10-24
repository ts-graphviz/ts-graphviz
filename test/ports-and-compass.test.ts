import { digraph, fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

describe('[SM-2] ports and compass points (#1641)', () => {
  it("rejects a port containing ':' instead of writing DOT Graphviz reads differently", () => {
    const g = digraph((g) => {
      g.edge([{ id: 'a', port: 'p:q' }, 'b']);
    });
    expect(() => toDot(g)).toThrow(
      expect.objectContaining({
        name: 'TypeError',
        code: 'TSG_ERR_INVALID_PORT',
      }),
    );
    const grouped = digraph((g) => {
      g.edge(['a', [{ id: 'b', port: 'x:' }]]);
    });
    expect(() => toDot(grouped)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_PORT' }),
    );
  });

  it('ignores a compass point that is not a keyword, as Graphviz does', () => {
    const g = fromDot('digraph { a:p:"" -> b:q:nx; c:p:ne -> d; }');
    const [first, second] = g.edges;
    expect(first.targets[0]).toMatchObject({ id: 'a', port: 'p' });
    expect(first.targets[0]).not.toHaveProperty('compass', expect.anything());
    expect(first.targets[1]).toMatchObject({ id: 'b', port: 'q' });
    expect(second.targets[0]).toMatchObject({ port: 'p', compass: 'ne' });
  });
});
