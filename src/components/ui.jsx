import { useEffect, useRef, useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';

/** Disco de anilha com a letra da ficha. */
export function Plate({ letter, plate = 'black', size = 44, className = '', children }) {
  return (
    <span
      className={`plate num font-bold ${className}`}
      data-plate={plate}
      style={{ width: size, height: size, fontSize: size * 0.46 }}
      aria-hidden="true"
    >
      {children ?? letter}
    </span>
  );
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors disabled:opacity-45 disabled:pointer-events-none select-none';
  const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-4 text-[15px]', lg: 'h-14 px-5 text-lg' };
  const variants = {
    primary: 'bg-red text-white hover:brightness-110 active:brightness-95',
    dark: 'bg-ink text-bg hover:opacity-90',
    ghost: 'bg-transparent text-ink hover:bg-surface-2',
    outline: 'border border-line bg-surface text-ink hover:bg-surface-2',
    success: 'bg-green text-white hover:brightness-110',
    danger: 'bg-transparent text-red border border-red/40 hover:bg-red/10',
  };
  return <button type="button" className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

export function IconButton({ label, className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center h-10 w-10 rounded-full text-muted hover:text-ink hover:bg-surface-2 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Controle segmentado (abas internas). */
export function Segmented({ options, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex p-1 rounded-xl bg-surface-2 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-8 px-3 rounded-lg text-sm font-semibold transition-colors ${
            value === o.value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Painel deslizante (bottom sheet no celular, modal centralizado no desktop). */
export function Sheet({ open, onClose, title, children, footer, wide = false }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`sheet-in relative w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} max-h-[92dvh] flex flex-col bg-bg rounded-t-2xl sm:rounded-2xl outline-none`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <header className="gutter flex items-center justify-between gap-3 pt-4 pb-3 border-b border-line">
          <h2 className="font-display text-2xl font-semibold leading-tight">{title}</h2>
          <IconButton label="Fechar" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </header>
        <div className="gutter flex-1 overflow-y-auto py-4">{children}</div>
        {footer && <footer className="gutter py-3 border-t border-line flex gap-2">{footer}</footer>}
      </div>
    </div>
  );
}

/** Botão destrutivo com confirmação embutida (sem window.confirm). */
export function ConfirmButton({ label, confirmLabel = 'Confirmar', question = 'Tem certeza?', onConfirm, icon, size = 'sm', variant = 'danger', className = '' }) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <Button variant={variant} size={size} className={className} onClick={() => setAsking(true)}>
        {icon}
        {label}
      </Button>
    );
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group">
      <span className="text-sm text-muted">{question}</span>
      <Button variant="ghost" size="sm" onClick={() => setAsking(false)}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}

/** Campo numérico com botões − e +. */
export function Stepper({ id, value, onChange, step = 1, min = 0, unit, label, compact = false }) {
  const num = Number(value) || 0;
  const set = (v) => onChange(Math.max(min, Math.round(v * 100) / 100));
  return (
    <div className="flex items-center gap-1 min-w-0">
      <button
        type="button"
        aria-label={`Diminuir ${label}`}
        onClick={() => set(num - step)}
        className={`${compact ? 'h-9 w-8' : 'h-11 w-10'} rounded-lg bg-surface-2 text-ink grid place-items-center hover:brightness-95`}
      >
        <Minus size={16} />
      </button>
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value === '' ? '' : num}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          onFocus={(e) => e.target.select()}
          className={`num w-full ${compact ? 'h-9 text-lg' : 'h-11 text-xl'} text-center font-semibold bg-surface border border-line rounded-lg focus:border-blue outline-none`}
        />
        {unit && <span className="pointer-events-none absolute right-1.5 bottom-0.5 text-[10px] text-muted">{unit}</span>}
      </label>
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        onClick={() => set(num + step)}
        className={`${compact ? 'h-9 w-8' : 'h-11 w-10'} rounded-lg bg-surface-2 text-ink grid place-items-center hover:brightness-95`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      key={toast.id}
      className="sheet-in fixed left-1/2 -translate-x-1/2 z-[60] max-w-[calc(100%-32px)] bg-ink text-bg px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg"
      style={{ bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}
    >
      {toast.message}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-2">
      <h2 className="font-display text-xl font-semibold leading-none">{children}</h2>
      {action}
    </div>
  );
}

export function Empty({ icon, title, children, action }) {
  return (
    <div className="card p-6 text-center flex flex-col items-center gap-2">
      {icon && <div className="text-muted">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {children && <p className="text-sm text-muted max-w-xs">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
