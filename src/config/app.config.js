/**
 * Configuração central do app.
 *
 * Para trocar a data de vencimento da série, altere apenas `SERIES.dueDate`
 * (formato AAAA-MM-DD). A data também pode ser ajustada dentro do app,
 * em Início > Série atual > Editar; o valor do app tem prioridade até
 * você tocar em "Usar data do arquivo de configuração".
 */
export const SERIES = {
  label: 'Série atual',
  dueDate: '2026-11-15',
};

export const APP = {
  name: 'Carga',
  storageKey: 'carga.treinos.v1',
  defaultRestSeconds: 90,
};

/** Escala de esforço exibida ao finalizar um treino. */
export const EFFORT_SCALE = [
  { value: 1, label: 'Muito leve', hint: 'Daria para fazer tudo de novo' },
  { value: 2, label: 'Leve', hint: 'Sobrou bastante energia' },
  { value: 3, label: 'Moderado', hint: 'Exigiu, mas sob controle' },
  { value: 4, label: 'Difícil', hint: 'Perto do limite em várias séries' },
  { value: 5, label: 'Máximo', hint: 'Não sobrou nada no tanque' },
];
