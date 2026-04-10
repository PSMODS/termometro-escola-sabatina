import { useState } from 'react';
import { X } from 'lucide-react';
import { MetricData } from '../lib/metrics';

interface SettingsModalProps {
  data: MetricData;
  updateValue: (key: keyof MetricData, value: string) => void;
  onClose: () => void;
  percentDecimals: number;
  setPercentDecimals: (value: number) => void;
  exportData: () => void;
  importData: (file: File) => void;
}

export default function SettingsModal({
  data,
  updateValue,
  onClose,
  percentDecimals,
  setPercentDecimals,
  exportData,
  importData,
}: SettingsModalProps) {
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'success' | 'error'>('idle');

  const toNumber = (value: MetricData[keyof MetricData]) => (value === '' ? 0 : Number(value));
  const formatValue = (value: MetricData[keyof MetricData]) => (value === '' ? '0' : String(value));
  const formatCurrency = (value: MetricData['weeklyAverage'] | MetricData['weeklyGoal']) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value === '' ? 0 : Number(value));
  const formatPercent = (current: number, total: number) => {
    if (!total) return `0.${'0'.repeat(percentDecimals)}%`.replace('.%', '%');
    return `${((current / total) * 100).toFixed(percentDecimals)}%`;
  };

  const buildWhatsappSummary = () => [
    'Termometro da Escola Sabatina',
    '',
    `Membros matriculados: ${formatValue(data.totalMembers)}`,
    `Membros presentes: ${formatValue(data.membersPresent)} (${formatPercent(toNumber(data.membersPresent), toNumber(data.totalMembers))})`,
    `Estudos diarios: ${formatValue(data.communion)} (${formatPercent(toNumber(data.communion), toNumber(data.totalMembers))})`,
    `Estudos biblicos: ${formatValue(data.biblicalStudies)} (${formatPercent(toNumber(data.biblicalStudies), toNumber(data.totalMembers))})`,
    `Projetos sociais: ${formatValue(data.projects)} (${formatPercent(toNumber(data.projects), toNumber(data.totalMembers))})`,
    `Pequenos grupos: ${formatValue(data.smallGroup)} (${formatPercent(toNumber(data.smallGroup), toNumber(data.totalMembers))})`,
    `Ofertas atual: ${formatCurrency(data.weeklyAverage)} (${formatPercent(toNumber(data.weeklyAverage), toNumber(data.weeklyGoal))})`,
    `Ofertas meta: ${formatCurrency(data.weeklyGoal)}`,
  ].join('\n');

  const copyWhatsappSummary = async () => {
    try {
      await navigator.clipboard.writeText(buildWhatsappSummary());
      setCopyFeedback('success');
    } catch (error) {
      console.error('Error copying WhatsApp summary:', error);
      setCopyFeedback('error');
    }

    window.setTimeout(() => {
      setCopyFeedback('idle');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4 md:p-6">
          <h2 className="text-2xl font-bold text-gray-800">Configuracoes</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <div className="space-y-4">
            <h3 className="border-b border-blue-100 pb-2 text-lg font-semibold text-blue-900">
              Geral
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Membros Matriculados
                </label>
                <input
                  type="number"
                  value={data.totalMembers}
                  onChange={(e) => updateValue('totalMembers', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Casas Decimais (%)
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPercentDecimals(num)}
                      className={`flex-1 rounded-lg border py-2 transition-all ${
                        percentDecimals === num
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b border-blue-100 pb-2 text-lg font-semibold text-blue-900">
              Dados do Termometro
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Estudos Diarios
                </label>
                <input
                  type="number"
                  value={data.communion}
                  onChange={(e) => updateValue('communion', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Membros Presentes
                </label>
                <input
                  type="number"
                  value={data.membersPresent}
                  onChange={(e) => updateValue('membersPresent', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Pequenos Grupos
                </label>
                <input
                  type="number"
                  value={data.smallGroup}
                  onChange={(e) => updateValue('smallGroup', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Estudos Biblicos
                </label>
                <input
                  type="number"
                  value={data.biblicalStudies}
                  onChange={(e) => updateValue('biblicalStudies', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  Projetos Sociais
                </label>
                <input
                  type="number"
                  value={data.projects}
                  onChange={(e) => updateValue('projects', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Ofertas (Meta)
                  </label>
                  <input
                    type="number"
                    value={data.weeklyGoal}
                    onChange={(e) => updateValue('weeklyGoal', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Ofertas (Atual)
                  </label>
                  <input
                    type="number"
                    value={data.weeklyAverage}
                    onChange={(e) => updateValue('weeklyAverage', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b border-blue-100 pb-2 text-lg font-semibold text-blue-900">
              Gerenciamento de Dados
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={exportData}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white shadow-lg shadow-green-200 transition-colors hover:bg-green-700"
              >
                Exportar Dados (JSON)
              </button>
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700">
                Importar Dados (JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      importData(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={copyWhatsappSummary}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700 sm:col-span-2"
              >
                {copyFeedback === 'success' ? 'Lista copiada para WhatsApp' : 'Copiar Lista para WhatsApp'}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Use arquivos JSON para salvar e carregar dados do termometro. Util para backup ou compartilhamento.
            </p>
            {copyFeedback === 'error' && (
              <p className="text-sm font-medium text-red-600">
                Nao foi possivel copiar automaticamente. Tente novamente.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
