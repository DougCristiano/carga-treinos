/**
 * Dados iniciais (JSON puro, separado da interface).
 * Exercícios com `media: { type: 'db', id }` usam as fotos da base aberta
 * free-exercise-db. Edite livremente: o app só lê este arquivo na
 * primeira abertura (ou ao restaurar os dados de fábrica).
 */
export const SEED_EXERCISES = [
  { id: 'supino-reto', name: 'Supino reto com barra', muscle: 'Peito', media: { type: 'db', id: 'Barbell_Bench_Press_-_Medium_Grip' }, notes: 'Escápulas encaixadas, desça a barra até a linha do peito.' },
  { id: 'supino-inclinado', name: 'Supino inclinado com halteres', muscle: 'Peito', media: { type: 'db', id: 'Incline_Dumbbell_Press' }, notes: 'Banco a 30°. Controle a descida.' },
  { id: 'voador', name: 'Voador (peck deck)', muscle: 'Peito', media: { type: 'db', id: 'Butterfly' }, notes: '' },
  { id: 'desenvolvimento', name: 'Desenvolvimento com halteres', muscle: 'Ombros', media: { type: 'db', id: 'Dumbbell_Shoulder_Press' }, notes: '' },
  { id: 'elevacao-lateral', name: 'Elevação lateral', muscle: 'Ombros', media: { type: 'db', id: 'Side_Lateral_Raise' }, notes: 'Cotovelos levemente flexionados, sobe até a altura do ombro.' },
  { id: 'triceps-corda', name: 'Tríceps na polia com corda', muscle: 'Tríceps', media: { type: 'db', id: 'Triceps_Pushdown_-_Rope_Attachment' }, notes: 'Abra a corda no final do movimento.' },
  { id: 'puxada-frente', name: 'Puxada frontal aberta', muscle: 'Costas', media: { type: 'db', id: 'Wide-Grip_Lat_Pulldown' }, notes: 'Puxe com os cotovelos, peito para cima.' },
  { id: 'remada-baixa', name: 'Remada baixa na polia', muscle: 'Costas', media: { type: 'db', id: 'Seated_Cable_Rows' }, notes: '' },
  { id: 'remada-curvada', name: 'Remada curvada com barra', muscle: 'Costas', media: { type: 'db', id: 'Bent_Over_Barbell_Row' }, notes: 'Coluna neutra durante toda a série.' },
  { id: 'rosca-direta', name: 'Rosca direta com barra', muscle: 'Bíceps', media: { type: 'db', id: 'Barbell_Curl' }, notes: '' },
  { id: 'rosca-martelo', name: 'Rosca martelo alternada', muscle: 'Bíceps', media: { type: 'db', id: 'Alternate_Hammer_Curl' }, notes: '' },
  { id: 'agachamento', name: 'Agachamento livre', muscle: 'Quadríceps', media: { type: 'db', id: 'Barbell_Squat' }, notes: 'Desça até a coxa paralela ao chão.' },
  { id: 'leg-press', name: 'Leg press 45°', muscle: 'Quadríceps', media: { type: 'db', id: 'Leg_Press' }, notes: '' },
  { id: 'extensora', name: 'Cadeira extensora', muscle: 'Quadríceps', media: { type: 'db', id: 'Leg_Extensions' }, notes: 'Segure 1 s no topo.' },
  { id: 'flexora', name: 'Mesa flexora', muscle: 'Posteriores', media: { type: 'db', id: 'Lying_Leg_Curls' }, notes: '' },
  { id: 'stiff', name: 'Stiff com barra', muscle: 'Posteriores', media: { type: 'db', id: 'Romanian_Deadlift' }, notes: '' },
  { id: 'panturrilha', name: 'Panturrilha em pé', muscle: 'Panturrilha', media: { type: 'db', id: 'Standing_Calf_Raises' }, notes: '' },
  { id: 'prancha', name: 'Prancha', muscle: 'Abdômen', media: { type: 'db', id: 'Plank' }, notes: 'Repetições = segundos.' },
];

/** Fichas de treino. `plate` define a cor do disco (anilha) da ficha. */
export const SEED_PLANS = [
  {
    id: 'treino-a',
    letter: 'A',
    name: 'Peito, ombros e tríceps',
    plate: 'red',
    items: [
      { exerciseId: 'supino-reto', sets: 4, reps: 10, load: 40, rest: 90 },
      { exerciseId: 'supino-inclinado', sets: 3, reps: 12, load: 18, rest: 75 },
      { exerciseId: 'voador', sets: 3, reps: 12, load: 35, rest: 60 },
      { exerciseId: 'desenvolvimento', sets: 3, reps: 10, load: 14, rest: 75 },
      { exerciseId: 'elevacao-lateral', sets: 3, reps: 15, load: 8, rest: 60 },
      { exerciseId: 'triceps-corda', sets: 3, reps: 12, load: 20, rest: 60 },
    ],
  },
  {
    id: 'treino-b',
    letter: 'B',
    name: 'Costas e bíceps',
    plate: 'blue',
    items: [
      { exerciseId: 'puxada-frente', sets: 4, reps: 10, load: 45, rest: 90 },
      { exerciseId: 'remada-baixa', sets: 3, reps: 12, load: 40, rest: 75 },
      { exerciseId: 'remada-curvada', sets: 3, reps: 10, load: 30, rest: 90 },
      { exerciseId: 'rosca-direta', sets: 3, reps: 10, load: 20, rest: 60 },
      { exerciseId: 'rosca-martelo', sets: 3, reps: 12, load: 10, rest: 60 },
    ],
  },
  {
    id: 'treino-c',
    letter: 'C',
    name: 'Pernas e abdômen',
    plate: 'yellow',
    items: [
      { exerciseId: 'agachamento', sets: 4, reps: 8, load: 50, rest: 120 },
      { exerciseId: 'leg-press', sets: 4, reps: 12, load: 120, rest: 90 },
      { exerciseId: 'extensora', sets: 3, reps: 12, load: 35, rest: 60 },
      { exerciseId: 'flexora', sets: 3, reps: 12, load: 30, rest: 60 },
      { exerciseId: 'stiff', sets: 3, reps: 10, load: 30, rest: 90 },
      { exerciseId: 'panturrilha', sets: 4, reps: 15, load: 40, rest: 45 },
      { exerciseId: 'prancha', sets: 3, reps: 40, load: 0, rest: 45 },
    ],
  },
];

/**
 * Histórico de exemplo (6 semanas) para os gráficos não abrirem vazios.
 * Marcado com `demo: true`; some automaticamente no primeiro treino real.
 */
export function buildDemoSessions(plans, exercises, now = new Date()) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const names = Object.fromEntries(exercises.map((e) => [e.id, e.name]));
  const sessions = [];
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 42);

  let rotation = 0;
  let count = 0;
  for (let i = 0; i < 42; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const dow = day.getDay();
    const trains = dow === 1 || dow === 3 || dow === 5 || (dow === 6 && rand() > 0.55);
    if (!trains || rand() < 0.1) continue;

    const plan = plans[rotation % plans.length];
    rotation += 1;
    count += 1;
    const progress = 1 + Math.min(i / 42, 1) * 0.14;
    const startedAt = new Date(day);
    startedAt.setHours(18 + Math.floor(rand() * 3), Math.floor(rand() * 60));

    const entries = plan.items.map((item) => {
      const step = item.load >= 40 ? 2.5 : 1;
      const load = item.load ? Math.round((item.load * progress) / step) * step : 0;
      return {
        exerciseId: item.exerciseId,
        name: names[item.exerciseId] || item.exerciseId,
        sets: Array.from({ length: item.sets }, (_, s) => ({
          load,
          reps: Math.max(1, item.reps - (s === item.sets - 1 && rand() > 0.5 ? 2 : 0) + (rand() > 0.85 ? 1 : 0)),
          done: true,
        })),
      };
    });

    const durationSec = 2700 + Math.floor(rand() * 1500);
    sessions.push({
      id: `demo_${count}`,
      demo: true,
      planId: plan.id,
      planName: plan.name,
      letter: plan.letter,
      plate: plan.plate,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date(startedAt.getTime() + durationSec * 1000).toISOString(),
      durationSec,
      effort: Math.min(5, Math.max(2, Math.round(2.6 + rand() * 2.2 + (plan.letter === 'C' ? 0.6 : 0)))),
      entries,
    });
  }
  return sessions;
}
