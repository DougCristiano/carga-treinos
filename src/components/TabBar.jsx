import { Home, Play, Dumbbell, LineChart } from 'lucide-react';

export const TABS = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'treino', label: 'Treinar', icon: Play },
  { id: 'exercicios', label: 'Fichas', icon: Dumbbell },
  { id: 'evolucao', label: 'Evolução', icon: LineChart },
];

export function TabBar({ route, onNavigate, activeWorkout }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 inset-x-0 z-30 border-t border-line bg-surface/95 backdrop-blur"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <ul className="mx-auto max-w-xl grid grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = route === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-0.5 pt-2.5 pb-2 text-[12px] font-semibold transition-colors ${
                  active ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                <span className={`grid place-items-center h-7 w-12 rounded-full ${active ? 'bg-surface-2' : ''}`}>
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                </span>
                {label}
                {id === 'treino' && activeWorkout && (
                  <span className="absolute top-2 right-[calc(50%-22px)] h-2.5 w-2.5 rounded-full bg-red ring-2 ring-surface" aria-label="Treino em andamento" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
