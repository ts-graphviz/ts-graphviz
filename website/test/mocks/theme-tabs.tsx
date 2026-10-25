import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';

type ItemProps = {
  value: string;
  label?: string;
  default?: boolean;
  children: ReactNode;
};

/** Like @theme/Tabs: a tab list, and only the selected item rendered. */
export default function Tabs({
  children,
}: {
  children: ReactNode;
  className?: string;
  lazy?: boolean;
}) {
  const items = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<ItemProps>[];
  const [selected, setSelected] = useState(
    (items.find((item) => item.props.default) ?? items[0])?.props.value,
  );
  return (
    <div>
      <div role="tablist">
        {items.map((item) => (
          <button
            key={item.props.value}
            type="button"
            role="tab"
            aria-selected={item.props.value === selected}
            onClick={() => setSelected(item.props.value)}
          >
            {item.props.label ?? item.props.value}
          </button>
        ))}
      </div>
      {items.find((item) => item.props.value === selected)}
    </div>
  );
}
