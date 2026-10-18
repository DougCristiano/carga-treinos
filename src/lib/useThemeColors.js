import { useEffect, useState } from 'react';

const TOKENS = ['ink', 'muted', 'line', 'surface', 'surface-2', 'red', 'blue', 'yellow', 'green'];

function read() {
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(TOKENS.map((t) => [t, cs.getPropertyValue(`--${t}`).trim()]));
}

/**
 * Cores do tema em valores concretos para os gráficos SVG (atributos SVG
 * não resolvem var()). Atualiza quando o tema claro/escuro muda.
 */
export function useThemeColors() {
  const [colors, setColors] = useState(read);
  useEffect(() => {
    const update = () => setColors(read());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', update);
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    return () => {
      mq.removeEventListener?.('change', update);
      obs.disconnect();
    };
  }, []);
  return colors;
}
