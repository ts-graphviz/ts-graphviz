import type { ReactNode } from 'react';

const interpolate = (message: string, values?: Record<string, unknown>) =>
  message.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values?.[key] ?? `{${key}}`),
  );

export function translate(
  { message }: { message: string; id?: string },
  values?: Record<string, unknown>,
): string {
  return interpolate(message, values);
}

export default function Translate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
