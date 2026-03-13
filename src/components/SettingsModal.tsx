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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2">
              Geral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  👥 Membros da Igreja
                </label>
                <input
                  type="number"
                  value={data.totalMembers}
                  onChange={(e) => updateValue('totalMembers', e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
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
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        percentDecimals === num
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Entry */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2">
              Dados do Termômetro
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  📖 Estudaram a Lição
                </label>
                <input
                  type="number"
                  value={data.communion}
                  onChange={(e) => updateValue('communion', e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  🙋 Alunos Presentes
                </label>
                <input
                  type="number"
                  value={data.membersPresent}
                  onChange={(e) => updateValue('membersPresent', e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  🏠 Participaram do PG (Pequeno Grupo)
                </label>
                <input
                  type="number"
                  value={data.smallGroup}
                  onChange={(e) => updateValue('smallGroup', e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  📚 Deram Estudos Bíblicos
                </label>
                <input
                  type="number"
                  value={data.biblicalStudies}
                  onChange={(e) => updateValue('biblicalStudies', e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    💰 Ofertas (Alvo)
                  </label>
                  <input
                    type="number"
                    value={data.weeklyGoal}
                    onChange={(e) => updateValue('weeklyGoal', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    💰 Ofertas (Atual)
                  </label>
                  <input
                    type="number"
                    value={data.weeklyAverage}
                    onChange={(e) => updateValue('weeklyAverage', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2">
              Gerenciamento de Dados
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={exportData}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                📥 Exportar Dados (JSON)
              </button>
              <label className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer">
                📤 Importar Dados (JSON)
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
            </div>
            <p className="text-sm text-gray-600">
              Use arquivos JSON para salvar e carregar dados do termômetro. Útil para backup ou compartilhamento.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
