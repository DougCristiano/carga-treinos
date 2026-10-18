export function PageHeader({ title, subtitle, actions, children }) {
  return (
    <header
      className="sticky z-20 bg-bg/95 backdrop-blur border-b border-line/60"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="gutter pt-4 pb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {subtitle && <p className="text-sm text-muted first-letter:uppercase truncate">{subtitle}</p>}
          <h1 className="font-display text-[32px] leading-[1.05] font-bold tracking-tight truncate">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-1 flex-none">{actions}</div>}
      </div>
      {children && <div className="gutter pb-3">{children}</div>}
    </header>
  );
}
