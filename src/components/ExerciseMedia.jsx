import { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { resolveMedia } from '../lib/media.js';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Mostra a demonstração do exercício. Fotos da base aberta alternam entre
 * posição inicial e final (efeito GIF). URLs de GIF tocam normalmente.
 */
export function ExerciseMedia({ media, alt, animate = true, className = '', rounded = 'rounded-xl', iconSize = 28 }) {
  const urls = resolveMedia(media);
  const [frame, setFrame] = useState(0);
  const [failed, setFailed] = useState(false);
  const key = urls.join('|');

  useEffect(() => {
    setFailed(false);
    setFrame(0);
  }, [key]);

  useEffect(() => {
    if (!animate || urls.length < 2 || reducedMotion()) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % urls.length), 900);
    return () => clearInterval(t);
  }, [animate, key, urls.length]);

  if (!urls.length || failed) {
    return (
      <div className={`bg-surface-2 text-muted grid place-items-center ${rounded} ${className}`} role="img" aria-label={failed ? 'Imagem indisponível' : 'Sem imagem'}>
        <Dumbbell size={iconSize} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-white ${rounded} ${className}`}>
      {urls.map((u, i) => (
        <img
          key={u}
          src={u}
          alt={i === 0 ? alt : ''}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
          style={{ opacity: i === frame ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
