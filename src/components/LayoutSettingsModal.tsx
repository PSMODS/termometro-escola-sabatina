import { RotateCcw, X } from 'lucide-react';
import { LayoutConfig, defaultLayoutConfig } from '../lib/layout';

interface LayoutSettingsModalProps {
  config: LayoutConfig;
  setConfig: (config: LayoutConfig) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function LayoutSettingsModal({
  config,
  setConfig,
  onClose,
  onReset,
}: LayoutSettingsModalProps) {
  const handleChange = (key: keyof LayoutConfig, value: number) => {
    setConfig({ ...config, [key]: value });
  };

  const handleToggle = (key: keyof LayoutConfig, value: boolean) => {
    setConfig({ ...config, [key]: value });
  };

  const applyPreset = (preset: 'compact' | 'default' | 'stage') => {
    if (preset === 'default') {
      setConfig(defaultLayoutConfig);
      return;
    }

    if (preset === 'compact') {
      setConfig({
        ...defaultLayoutConfig,
        titleSize: 22,
        textSize: 15,
        iconSize: 22,
        spacingScale: 0.85,
        leftPanelWidth: 64,
        resultScale: 0.92,
        showFooterSummary: true,
        showPresentationCards: false,
        showProjectsSlide: true,
        stackLeftCards: true,
      });
      return;
    }

    setConfig({
      ...defaultLayoutConfig,
      titleSize: 28,
      textSize: 18,
      iconSize: 28,
      spacingScale: 1.1,
      leftPanelWidth: 56,
      resultScale: 1.15,
      showFooterSummary: false,
      showPresentationCards: true,
      showProjectsSlide: true,
      stackLeftCards: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4 sm:p-5">
          <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Ajustes de Layout</h2>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
              title="Restaurar Padrões"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-4 sm:space-y-7 sm:p-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Presets</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                onClick={() => applyPreset('compact')}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-700"
              >
                Compacto
              </button>
              <button
                onClick={() => applyPreset('default')}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-700"
              >
                Padrão
              </button>
              <button
                onClick={() => applyPreset('stage')}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-700"
              >
                Palco
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Tamanho dos Títulos</label>
              <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">{config.titleSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="48"
              step="1"
              value={config.titleSize}
              onChange={(e) => handleChange('titleSize', Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Tamanho do Texto Secundário</label>
              <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">{config.textSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="32"
              step="1"
              value={config.textSize}
              onChange={(e) => handleChange('textSize', Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Tamanho dos Ícones</label>
              <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">{config.iconSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="40"
              step="1"
              value={config.iconSize}
              onChange={(e) => handleChange('iconSize', Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Espaçamentos</label>
              <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">{config.spacingScale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={config.spacingScale}
              onChange={(e) => handleChange('spacingScale', Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
            <p className="text-xs text-gray-500">Ajusta margens e preenchimentos proporcionalmente.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Largura da Coluna de Dados</label>
              <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">{config.leftPanelWidth}%</span>
            </div>
            <input
              type="range"
              min="52"
              max="72"
              step="1"
              value={config.leftPanelWidth}
              onChange={(e) => handleChange('leftPanelWidth', Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
            <p className="text-xs text-gray-500">
              Define quanto espaço a coluna da esquerda ocupa em relação ao painel de resultado.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Escala do Painel de Resultado</label>
              <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">{config.resultScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={config.resultScale}
              onChange={(e) => handleChange('resultScale', Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Exibição</h3>
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Mostrar Rodapé Resumo</p>
                <p className="text-xs text-gray-500">Exibe os chips com resumo geral na parte inferior.</p>
              </div>
              <input
                type="checkbox"
                checked={config.showFooterSummary}
                onChange={(e) => handleToggle('showFooterSummary', e.target.checked)}
                className="h-5 w-5 accent-blue-600"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Mostrar Cards na Tela Cheia</p>
                <p className="text-xs text-gray-500">Exibe os cards-resumo no modo apresentação.</p>
              </div>
              <input
                type="checkbox"
                checked={config.showPresentationCards}
                onChange={(e) => handleToggle('showPresentationCards', e.target.checked)}
                className="h-5 w-5 accent-blue-600"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Mostrar Slide de Projetos Sociais</p>
                <p className="text-xs text-gray-500">Exibe ou oculta o indicador Projetos Sociais na apresentação.</p>
              </div>
              <input
                type="checkbox"
                checked={config.showProjectsSlide}
                onChange={(e) => handleToggle('showProjectsSlide', e.target.checked)}
                className="h-5 w-5 accent-blue-600"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Cards da Esquerda Empilhados</p>
                <p className="text-xs text-gray-500">Mostra os cards da coluna esquerda um abaixo do outro.</p>
              </div>
              <input
                type="checkbox"
                checked={config.stackLeftCards}
                onChange={(e) => handleToggle('stackLeftCards', e.target.checked)}
                className="h-5 w-5 accent-blue-600"
              />
            </label>
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
