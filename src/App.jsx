import { useCallback, useEffect, useState } from 'react';
import { useStore } from './store/StoreProvider.jsx';
import { TabBar, TABS } from './components/TabBar.jsx';
import { Toast } from './components/ui.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Workout from './pages/Workout.jsx';
import Library from './pages/Library.jsx';
import Stats from './pages/Stats.jsx';

const ROUTES = TABS.map((t) => t.id);

function readHash() {
  const h = window.location.hash.replace('#', '');
  return ROUTES.includes(h) ? h : 'inicio';
}

/** Roteamento por hash: compatível com GitHub Pages sem configuração extra. */
function useHashRoute() {
  const [route, setRoute] = useState(readHash);
  useEffect(() => {
    const onHash = () => setRoute(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = useCallback((id) => {
    if (window.location.hash !== `#${id}`) {
      try {
        window.history.pushState(null, '', `#${id}`);
      } catch {
        /* alguns ambientes bloqueiam history */
      }
    }
    setRoute(id);
    window.scrollTo({ top: 0 });
  }, []);
  return [route, navigate];
}

export default function App() {
  const [route, navigate] = useHashRoute();
  const { state, toast } = useStore();

  const pages = {
    inicio: <Dashboard navigate={navigate} />,
    treino: <Workout navigate={navigate} />,
    exercicios: <Library />,
    evolucao: <Stats navigate={navigate} />,
  };

  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-xl" style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
        {pages[route]}
      </main>
      <Toast toast={toast} />
      <TabBar route={route} onNavigate={navigate} activeWorkout={!!state.active} />
    </div>
  );
}
