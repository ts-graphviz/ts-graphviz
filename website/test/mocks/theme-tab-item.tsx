import type { ReactNode } from 'react';

export default function TabItem({
  children,
}: {
  value: string;
  label?: string;
  default?: boolean;
  children: ReactNode;
}) {
  return <div role="tabpanel">{children}</div>;
}
