import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return <article className="card">{children}</article>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
}
