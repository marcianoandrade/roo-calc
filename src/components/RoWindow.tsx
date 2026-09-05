import type { ReactNode } from 'react';

interface RoWindowProps {
  title: string;
  /** Small, non-bold text shown at the right of the title bar (e.g. a count). */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** A classic Ragnarok Online client window: gradient title bar, bevelled body. */
export function RoWindow({ title, aside, className, children }: RoWindowProps) {
  return (
    <section className={`ro-window ${className ?? ''}`} aria-label={title}>
      <div className="ro-titlebar">
        <span>{title}</span>
        <span className="ro-titlebar-spacer" />
        {aside !== undefined && <span className="ro-titlebar-aside">{aside}</span>}
        <span className="ro-dot" aria-hidden="true" />
        <span className="ro-dot" aria-hidden="true" />
      </div>
      <div className="ro-body">{children}</div>
    </section>
  );
}
