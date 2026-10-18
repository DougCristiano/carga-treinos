import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Eraser } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { SERIES } from '../config/app.config.js';
import { downloadJSON } from '../lib/storage.js';
import { formatDateBR } from '../lib/dates.js';
import { Sheet, Button, ConfirmButton } from './ui.jsx';

export function SettingsSheet({ open, onClose }) {
  const { state, series, actions, notify } = useStore();
  const [date, setDate] = useState(series.dueDate);
  const [label, setLabel] = useState(series.label);
  const [rest, setRest] = useState(state.settings.restSeconds);
  const [importError, setImportError] = useState('');
  const fileRef = useRef(null);
  const hasDemo = state.sessions.some((s) => s.demo);

  const save = () => {
    actions.updateSettings({
      seriesDueDate: date && date !== SERIES.dueDate ? date : null,
      seriesLabel: label && label !== SERIES.label ? label : null,
      restSeconds: Math.max(0, Number(rest) || 0),
    });
    notify('Configurações salvas');
    onClose();
  };

  const exportData = () => {
    const { active, ...data } = state;
    try {
      downloadJSON(data, `carga-backup-${new Date().toISOString().slice(0, 10)}.json`);
      notify('Backup exportado');
    } catch {
      notify('Não foi possível gerar o arquivo neste navegador');
    }
  };

  const importData = async (file) => {
    setImportError('');
    try {
      const data = JSON.parse(await file.text());
      actions.importData(data);
      notify('Backup importado');
      onClose();
    } catch (e) {
      setImportError(e.message?.startsWith('Arquivo') ? e.message : 'Arquivo inválido: use um backup .json exportado pelo Carga.');
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Configurações"
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={save}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="font-display text-lg font-semibold mb-1">Série atual</legend>
          <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="cfg-label">
            Nome
            <input id="cfg-label" className="field" value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="cfg-date">
            Data de vencimento
            <input id="cfg-date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <p className="text-xs text-muted">
            Padrão do arquivo <code>src/config/app.config.js</code>: {formatDateBR(SERIES.dueDate)}.{' '}
            {!series.fromConfig && (
              <button type="button" className="underline font-semibold text-ink" onClick={() => setDate(SERIES.dueDate)}>
                Usar data do arquivo de configuração
              </button>
            )}
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-display text-lg font-semibold mb-1">Treino</legend>
          <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="cfg-rest">
            Descanso padrão entre séries (segundos)
            <input id="cfg-rest" type="number" inputMode="numeric" min="0" className="field num text-lg" value={rest} onChange={(e) => setRest(e.target.value)} />
          </label>
          <p className="text-xs text-muted">Usado quando o exercício da ficha não tem descanso próprio.</p>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-display text-lg font-semibold mb-1">Seus dados</legend>
          <p className="text-sm text-muted">Tudo fica salvo apenas neste navegador. Exporte um backup para trocar de aparelho.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={exportData}>
              <Download size={16} /> Exportar
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Importar
            </Button>
          </div>
          <input
            ref={fileRef}
            id="cfg-import"
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
          />
          {importError && <p className="text-sm text-red">{importError}</p>}
          {hasDemo && (
            <ConfirmButton
              variant="outline"
              size="md"
              icon={<Eraser size={16} />}
              label="Apagar treinos de exemplo"
              question="Apagar o histórico de exemplo?"
              confirmLabel="Apagar"
              onConfirm={() => {
                actions.clearDemo();
                notify('Exemplos apagados');
              }}
            />
          )}
          <ConfirmButton
            size="md"
            icon={<RotateCcw size={16} />}
            label="Restaurar dados de fábrica"
            question="Isso apaga fichas, exercícios e histórico."
            confirmLabel="Restaurar"
            onConfirm={() => {
              actions.resetAll();
              notify('Dados restaurados');
              onClose();
            }}
          />
        </fieldset>
      </div>
    </Sheet>
  );
}
