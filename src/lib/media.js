import overrides from '../data/seedMediaOverrides.js';
import index from '../data/exerciseIndex.json';
import { MUSCLE_PT, EQUIPMENT_PT, PT_SEARCH_TERMS } from '../data/muscles.js';

/**
 * Base aberta de exercícios (domínio público):
 * https://github.com/yuhonas/free-exercise-db
 * Cada exercício tem duas fotos (início e fim do movimento); alternamos as
 * duas para simular um GIF demonstrativo.
 */
export const DB_IMAGE_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
export const DB_SOURCE_URL = 'https://github.com/yuhonas/free-exercise-db';

/**
 * Mídia de um exercício:
 *   { type: 'db',  id: 'Barbell_Squat' }      -> fotos da base aberta
 *   { type: 'url', url: 'https://...gif' }    -> imagem/GIF por URL
 *   null                                      -> sem mídia
 */
export function resolveMedia(media) {
  if (!media) return [];
  if (media.type === 'url' && media.url) return [media.url];
  if (media.type === 'db' && media.id) {
    if (overrides[media.id]) return overrides[media.id];
    return [`${DB_IMAGE_BASE}${media.id}/0.jpg`, `${DB_IMAGE_BASE}${media.id}/1.jpg`];
  }
  return [];
}

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ENTRIES = index.map(([id, name, muscle, equipment, images]) => ({
  id,
  name,
  muscle: MUSCLE_PT[muscle] || 'Corpo inteiro',
  equipment: EQUIPMENT_PT[equipment] || '',
  hasImages: images > 0,
  haystack: normalize(`${name} ${muscle} ${equipment}`),
}));

/** Converte a busca em português para termos em inglês da base. */
function expandQuery(query) {
  let q = normalize(query);
  const terms = [];
  for (const [pt, en] of PT_SEARCH_TERMS) {
    if (q.includes(pt)) {
      terms.push(en);
      q = q.replace(pt, ' ');
    }
  }
  q.split(' ')
    .filter((w) => w.length > 1)
    .forEach((w) => terms.push(w));
  return terms;
}

/** Busca na base aberta. Aceita termos em português ou inglês. */
export function searchExerciseDb(query, limit = 24) {
  const terms = expandQuery(query);
  if (!terms.length) return [];
  const scored = [];
  for (const e of ENTRIES) {
    if (!e.hasImages) continue;
    let score = 0;
    for (const t of terms) {
      if (e.haystack.includes(t)) score += t.length;
      else {
        score = -1;
        break;
      }
    }
    if (score > 0) scored.push([score - e.name.length / 100, e]);
  }
  return scored
    .sort((a, b) => b[0] - a[0])
    .slice(0, limit)
    .map(([, e]) => e);
}

/** Link para buscar GIFs do movimento na web (abre em nova aba). */
export function webGifSearchUrl(name) {
  const q = encodeURIComponent(`${name} exercício gif`);
  return `https://www.google.com/search?tbm=isch&q=${q}`;
}
