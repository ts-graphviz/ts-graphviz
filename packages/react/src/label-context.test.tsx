import { createContext, type ReactNode, use, useId } from 'react';
import { Digraph as DigraphModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Node } from './components/Node.js';
import { fromElement } from './fromElement.js';
import {
  createLabelContext,
  htmlLikeFromElement,
  readLabelContext,
} from './htmlLikeFromElement.js';

const Accent = createLabelContext('black');

function Text({ children }: { children?: ReactNode }) {
  return <dot:font color={readLabelContext(Accent)}>{children}</dot:font>;
}

describe('label context', () => {
  it('gives the default value where no provider is above', () => {
    expect(htmlLikeFromElement(<Text>a</Text>).value).toBe(
      '<font color="black">a</font>',
    );
  });

  it('gives the value of the nearest provider above the component', () => {
    const label = htmlLikeFromElement(
      <Accent.Provider value="red">
        <Text>a</Text>
        <Accent.Provider value="blue">
          <dot:b>
            <Text>b</Text>
          </dot:b>
        </Accent.Provider>
        <Text>c</Text>
      </Accent.Provider>,
    );
    expect(label.value).toBe(
      '<font color="red">a</font><b><font color="blue">b</font></b><font color="red">c</font>',
    );
  });

  it('writes a provider as its children only', () => {
    expect(
      htmlLikeFromElement(
        <dot:b>
          <Accent.Provider value="red">x</Accent.Provider>
        </dot:b>,
      ).value,
    ).toBe('<b>x</b>');
    expect(htmlLikeFromElement(<Accent.Provider value="red" />).value).toBe('');
  });

  it('keeps contexts apart', () => {
    const Size = createLabelContext(10);
    const Both = () => (
      <dot:font
        color={readLabelContext(Accent)}
        point-size={readLabelContext(Size)}
      />
    );
    expect(
      htmlLikeFromElement(
        <Size.Provider value={20}>
          <Both />
        </Size.Provider>,
      ).value,
    ).toBe('<font color="black" point-size="20"></font>');
  });

  it('gives a provided undefined, not the default value', () => {
    const Optional = createLabelContext<string | undefined>('default');
    const Shows = () => <dot:b>{String(readLabelContext(Optional))}</dot:b>;
    expect(
      htmlLikeFromElement(
        <Optional.Provider value={undefined}>
          <Shows />
        </Optional.Provider>,
      ).value,
    ).toBe('<b>undefined</b>');
  });

  it('ends a provider where a component under it throws', () => {
    const Throws = () => {
      throw new Error('label component');
    };
    expect(() =>
      htmlLikeFromElement(
        <Accent.Provider value="red">
          <Throws />
        </Accent.Provider>,
      ),
    ).toThrow('label component');
    expect(htmlLikeFromElement(<Text>a</Text>).value).toBe(
      '<font color="black">a</font>',
    );
  });

  it('starts a label converted inside another with no providers', () => {
    const Inner = () => (
      <dot:td title={htmlLikeFromElement(<Text>in</Text>).value}>
        <Text>out</Text>
      </dot:td>
    );
    expect(
      htmlLikeFromElement(
        <Accent.Provider value="red">
          <Inner />
        </Accent.Provider>,
      ).value,
    ).toBe(
      '<td title="&lt;font color=&quot;black&quot;&gt;in&lt;/font&gt;"><font color="red">out</font></td>',
    );
  });

  it('reaches the components of a label prop', async () => {
    const container = new DigraphModel();
    await fromElement(
      <Node
        id="a"
        label={
          <Accent.Provider value="red">
            <Text>a</Text>
          </Accent.Provider>
        }
      />,
      { container },
    );
    expect(container.getNodes('a')[0]?.attributes.get('label')).toMatchObject({
      value: '<font color="red">a</font>',
    });
  });

  it('counts a provider toward maxDepth', () => {
    const label = (
      <Accent.Provider value="red">
        <Accent.Provider value="blue">
          <dot:b />
        </Accent.Provider>
      </Accent.Provider>
    );
    expect(() => htmlLikeFromElement(label, { maxDepth: 2 })).toThrow(
      RangeError,
    );
    expect(htmlLikeFromElement(label, { maxDepth: 3 }).value).toBe('<b></b>');
  });

  describe('readLabelContext()', () => {
    it('throws while no label is converted', () => {
      expect(() => readLabelContext(Accent)).toThrow(
        /only by a component of a label/,
      );
    });

    it('throws in a component React renders', async () => {
      const Reads = () => <Node id={readLabelContext(Accent)} />;
      await expect(
        fromElement(<Reads />, { container: new DigraphModel() }),
      ).rejects.toThrow(/only by a component of a label/);
    });

    it('rejects what createLabelContext did not make', () => {
      for (const context of [
        null,
        {},
        { Provider: () => null },
        Object.create(Accent),
        createContext('react'),
      ]) {
        const Reads = (): null => readLabelContext(context as never);
        expect(() => htmlLikeFromElement(<Reads />)).toThrow(
          new TypeError(
            'readLabelContext takes a context made by createLabelContext.',
          ),
        );
      }
    });
  });

  it('fails when React renders a provider', async () => {
    await expect(
      fromElement(
        <Accent.Provider value="red">
          <Node id="a" />
        </Accent.Provider>,
        { container: new DigraphModel() },
      ),
    ).rejects.toThrow(/rendered by React/);
  });
});

describe('React hooks in a component of a label', () => {
  const Theme = createContext('none');
  const Themed = () => <dot:b>{use(Theme)}</dot:b>;

  it('are those of the component the label prop is rendered in', async () => {
    const container = new DigraphModel();
    await fromElement(
      <Theme value="dark">
        <Node id="a" label={<Themed />} />
      </Theme>,
      { container },
    );
    expect(container.getNodes('a')[0]?.attributes.get('label')).toMatchObject({
      value: '<b>dark</b>',
    });
  });

  it('cannot be given a React provider inside the label', () => {
    expect(() =>
      htmlLikeFromElement(
        <Theme value="dark">
          <dot:b />
        </Theme>,
      ),
    ).toThrow(TypeError);
  });

  it('fail where no component is rendering', () => {
    const WithId = () => <dot:b>{useId()}</dot:b>;
    expect(() => htmlLikeFromElement(<WithId />)).toThrow();
  });
});
