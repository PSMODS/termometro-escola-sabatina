import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Settings, SlidersHorizontal, Maximize, Minimize, Hourglass, Download } from 'lucide-react';
import { useThermometerData } from '../hooks/useThermometerData';
import SettingsModal from './SettingsModal';
import LayoutSettingsModal from './LayoutSettingsModal';
import { LayoutConfig, defaultLayoutConfig } from '../lib/layout';
import { MetricData, normalizeMetricData } from '../lib/metrics';

const face0_25 = new URL('../../Faces/0-25.png', import.meta.url).href;
const face26_50 = new URL('../../Faces/26-50.png', import.meta.url).href;
const face51_75 = new URL('../../Faces/51-75.png', import.meta.url).href;
const face76_100 = new URL('../../Faces/76-100.png', import.meta.url).href;
const escolaSabatinaLogo = new URL('../../Faces/escola-sabatina-logo.png', import.meta.url).href;
const faces = [
  { img: face0_25, bg: 'bg-red-500' },
  { img: face26_50, bg: 'bg-orange-500' },
  { img: face51_75, bg: 'bg-yellow-400' },
  { img: face76_100, bg: 'bg-green-500' },
];
const RESULT_REVEAL_DELAY_MS = 900;
const PDF_CAPTURE_WIDTH = 1600;
const PDF_CAPTURE_HEIGHT = Math.round(PDF_CAPTURE_WIDTH / (297 / 210));
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeLayoutConfig = (config: Partial<LayoutConfig> | null | undefined): LayoutConfig => {
  const merged = { ...defaultLayoutConfig, ...(config ?? {}) };

  return {
    ...merged,
    titleSize: clamp(Number(merged.titleSize) || defaultLayoutConfig.titleSize, 18, 30),
    textSize: clamp(Number(merged.textSize) || defaultLayoutConfig.textSize, 12, 20),
    iconSize: clamp(Number(merged.iconSize) || defaultLayoutConfig.iconSize, 18, 30),
    spacingScale: clamp(Number(merged.spacingScale) || defaultLayoutConfig.spacingScale, 0.75, 1.2),
    leftPanelWidth: clamp(Number(merged.leftPanelWidth) || defaultLayoutConfig.leftPanelWidth, 52, 68),
    resultScale: clamp(Number(merged.resultScale) || defaultLayoutConfig.resultScale, 0.85, 1.05),
    showFooterSummary: Boolean(merged.showFooterSummary),
    showPresentationCards: Boolean(merged.showPresentationCards),
    stackLeftCards: Boolean(merged.stackLeftCards),
  };
};

const getFaceIndex = (percentage: number) => (
  percentage <= 25 ? 0 : percentage <= 50 ? 1 : percentage <= 75 ? 2 : 3
);

const getPerformanceLabel = (percentage: number) => {
  if (percentage <= 25) return 'Abaixo do esperado';
  if (percentage <= 50) return 'Em progresso';
  if (percentage <= 75) return 'Bom resultado';
  return 'Excelente resultado';
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const useAnimatedNumber = (value: number, duration = 800, decimals = 0, immediate = false) => {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (immediate) {
      setDisplay(value);
      return;
    }

    let start: number | null = null;
    const initial = display;
    const delta = value - initial;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const next = initial + delta * p;
      const rounded = Number(next.toFixed(decimals));
      setDisplay(rounded);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, decimals, immediate]);
  return display;
};

interface SlideFieldConfig {
  key: keyof MetricData;
  label: string;
  placeholder: string;
  prefix?: string;
}

interface SlideConfig {
  title: string;
  pdfTitle: string;
  description: string;
  percentageLabel: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  percentage: number;
  fields: SlideFieldConfig[];
}



export default function ThermometerDisplay() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const slideCaptureRef = useRef<HTMLElement | null>(null);
  const [sessionId] = useState(() => {
    const storageKey = 'thermometer_session_id';
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      return stored;
    }

    const nextSessionId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `session_${Date.now()}`;

    localStorage.setItem(storageKey, nextSessionId);
    return nextSessionId;
  });
  const { data, setData, saveData, loading, exportData, importData } = useThermometerData(sessionId);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [percentDecimals, setPercentDecimals] = useState(() => {
    const saved = localStorage.getItem('thermometer_percent_decimals');
    const parsed = saved ? Number(saved) : 0;
    return parsed === 1 || parsed === 2 ? parsed : 0;
  });
  const [facesAnimating, setFacesAnimating] = useState(false);
  
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => {
    const saved = localStorage.getItem('thermometer_layout_config');
    if (!saved) {
      return normalizeLayoutConfig(defaultLayoutConfig);
    }

    try {
      return normalizeLayoutConfig(JSON.parse(saved));
    } catch {
      return normalizeLayoutConfig(defaultLayoutConfig);
    }
  });
  const applyLayoutConfig = (nextConfig: LayoutConfig) => {
    setLayoutConfig(normalizeLayoutConfig(nextConfig));
  };
  const normalizedData = normalizeMetricData(data);

  useEffect(() => {
    localStorage.setItem('thermometer_layout_config', JSON.stringify(layoutConfig));
  }, [layoutConfig]);

  useEffect(() => {
    localStorage.setItem('thermometer_percent_decimals', String(percentDecimals));
  }, [percentDecimals]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveData(data);
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, saveData]);

  const updateValue = (key: keyof MetricData, value: string) => {
    if (value === '') {
      setData((current) => ({ ...current, [key]: '' }));
      return;
    }

    const numValue = Number(value);
    setData((current) => ({
      ...current,
      [key]: Number.isFinite(numValue) ? numValue : 0,
    }));
  };

  const getPercentage = (value: number, total: number) => {
    if (!total) return 0;
    return (value / total) * 100;
  };

  useEffect(() => {
    if (isExportingPdf) {
      return;
    }

    setShowResult(false);
    setFacesAnimating(false);
  }, [currentSlide, isExportingPdf]);

  useEffect(() => {
    const syncPresentationMode = () => {
      setIsPresentationMode(document.fullscreenElement === rootRef.current);
    };

    document.addEventListener('fullscreenchange', syncPresentationMode);
    return () => document.removeEventListener('fullscreenchange', syncPresentationMode);
  }, []);

  
 
  const slides: SlideConfig[] = [
    {
      title: 'Membros da Igreja e Alunos Presentes',
      pdfTitle: 'Membros e Alunos Presentes',
      description: 'Total de membros da igreja e alunos presentes.',
      percentageLabel: 'Percentual de presen\u00e7a',
      primaryLabel: 'Alunos presentes',
      primaryValue: String(normalizedData.membersPresent),
      secondaryLabel: 'Membros da Igreja',
      secondaryValue: String(normalizedData.totalMembers),
      percentage: getPercentage(normalizedData.membersPresent, normalizedData.totalMembers),
      fields: [
        { key: 'totalMembers', label: 'Membros da Igreja', placeholder: '0' },
        { key: 'membersPresent', label: 'Alunos Presentes', placeholder: '0' },
      ],
    },
    {
      title: 'Estudaram a Lição',
      pdfTitle: 'Estudaram a Lição',
      description: 'Resumo gerado automaticamente a partir dos dados atuais do painel.',
      percentageLabel: 'Percentual de estudo',
      primaryLabel: 'Pessoas registradas',
      primaryValue: String(normalizedData.communion),
      secondaryLabel: 'Membros da Igreja',
      secondaryValue: String(normalizedData.totalMembers),
      percentage: getPercentage(normalizedData.communion, normalizedData.totalMembers),
      fields: [
        { key: 'communion', label: 'Estudaram a Lição', placeholder: '0' },
        { key: 'totalMembers', label: 'Membros da Igreja', placeholder: '0' },
      ],
    },
    {
      title: 'Participaram do PG (Pequeno Grupo)',
      pdfTitle: 'Participaram do PG',
      description: 'Resumo gerado automaticamente a partir dos dados atuais do painel.',
      percentageLabel: 'Percentual de participa\u00e7\u00e3o',
      primaryLabel: 'Participantes no PG',
      primaryValue: String(normalizedData.smallGroup),
      secondaryLabel: 'Membros da Igreja',
      secondaryValue: String(normalizedData.totalMembers),
      percentage: getPercentage(normalizedData.smallGroup, normalizedData.totalMembers),
      fields: [
        { key: 'smallGroup', label: 'Participaram do PG (Pequeno Grupo)', placeholder: '0' },
        { key: 'totalMembers', label: 'Membros da Igreja', placeholder: '0' },
      ],
    },
    {
      title: 'Deram Estudos Bíblicos',
      pdfTitle: 'Deram Estudos Bíblicos',
      description: 'Resumo gerado automaticamente a partir dos dados atuais do painel.',
      percentageLabel: 'Percentual de estudos',
      primaryLabel: 'Estudos bíblicos dados',
      primaryValue: String(normalizedData.biblicalStudies),
      secondaryLabel: 'Membros da Igreja',
      secondaryValue: String(normalizedData.totalMembers),
      percentage: getPercentage(normalizedData.biblicalStudies, normalizedData.totalMembers),
      fields: [
        { key: 'biblicalStudies', label: 'Deram Estudos Bíblicos', placeholder: '0' },
        { key: 'totalMembers', label: 'Membros da Igreja', placeholder: '0' },
      ],
    },
    {
      title: 'Ofertas',
      pdfTitle: 'Ofertas',
      description: 'Resumo gerado automaticamente a partir dos dados atuais do painel.',
      percentageLabel: 'Percentual atingido',
      primaryLabel: 'Oferta atual',
      primaryValue: formatCurrency(normalizedData.weeklyAverage),
      secondaryLabel: 'Alvo',
      secondaryValue: formatCurrency(normalizedData.weeklyGoal),
      percentage: getPercentage(normalizedData.weeklyAverage, normalizedData.weeklyGoal),
      fields: [
        { key: 'weeklyAverage', label: 'Ofertas (Atual)', placeholder: '0.00', prefix: 'R$' },
        { key: 'weeklyGoal', label: 'Ofertas (Alvo)', placeholder: '0.00', prefix: 'R$' },
      ],
    },
  ];

  const activeSlide = slides[currentSlide];
  const headerPercent = activeSlide.percentage;
  const headerAnimatedPercent = useAnimatedNumber(showResult ? headerPercent : 0, 800, percentDecimals, isExportingPdf);
  const headerFaceIndex = getFaceIndex(headerPercent);
  const displayPercent = isExportingPdf ? headerPercent : headerAnimatedPercent;
  const resultScale = layoutConfig.resultScale;
  const presentationSpacing = Math.max(layoutConfig.spacingScale, 0.75);
  const presentationSectionPadding = `${presentationSpacing * 2}rem`;
  const presentationBlockPadding = `${presentationSpacing * 1.5}rem`;
  const presentationCardPadding = `${presentationSpacing * 1.3}rem`;
  const presentationGap = `${presentationSpacing}rem`;
  const presentationLargeGap = `${presentationSpacing * 1.25}rem`;
  const presentationButtonPadding = `${presentationSpacing * 0.55}rem ${presentationSpacing * 0.95}rem`;
  const presentationIconSize = `${layoutConfig.iconSize}px`;
  const presentationNavButtonSize = `${Math.max(layoutConfig.iconSize + 18, 46)}px`;
  const presentationLabelSize = `${layoutConfig.textSize}px`;
  const presentationMetaSize = `${Math.max(layoutConfig.textSize * 0.75, 11)}px`;
  const presentationBodySize = `${Math.max(layoutConfig.textSize * 1.05, 16)}px`;
  const presentationButtonTextSize = `${Math.max(layoutConfig.textSize, 15)}px`;
  const presentationGridStyle = {
    '--layout-columns': `minmax(460px, ${layoutConfig.leftPanelWidth}fr) minmax(320px, ${100 - layoutConfig.leftPanelWidth}fr)`,
  } as CSSProperties;
  const goToSlide = (direction: 'prev' | 'next') => {
    setShowResult(false);
    setFacesAnimating(false);
    setCurrentSlide((current) =>
      direction === 'prev'
        ? Math.max(0, current - 1)
        : Math.min(slides.length - 1, current + 1)
    );
  };
  const prevSlide = () => goToSlide('prev');
  const nextSlide = () => goToSlide('next');
  const confettiRef = useRef<HTMLDivElement | null>(null);
  const progressFillClass =
    headerPercent <= 25
      ? 'from-red-500 to-red-600'
      : headerPercent <= 50
      ? 'from-orange-500 to-orange-600'
      : headerPercent <= 75
      ? 'from-yellow-400 to-yellow-500'
      : 'from-green-500 to-green-600';
  const progressTextClass =
    headerPercent <= 25
      ? 'text-red-600'
      : headerPercent <= 50
      ? 'text-orange-600'
      : headerPercent <= 75
      ? 'text-yellow-600'
      : 'text-green-600';

  const toggleShowResult = () => {
    setShowResult((current) => {
      if (!current) {
        setFacesAnimating(true);
        setTimeout(() => setFacesAnimating(false), RESULT_REVEAL_DELAY_MS);
      }

      return !current;
    });
  };

  const togglePresentationMode = async () => {
    try {
      if (document.fullscreenElement === rootRef.current) {
        await document.exitFullscreen();
        return;
      }

      await rootRef.current?.requestFullscreen();
    } catch (error) {
      console.error('Error toggling presentation mode:', error);
    }
  };

  const waitForSlidePaint = async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  };

  const createPdfCaptureClone = (sourceElement: HTMLElement) => {
    const clone = sourceElement.cloneNode(true) as HTMLElement;

    clone.style.position = 'fixed';
    clone.style.left = '-20000px';
    clone.style.top = '0';
    clone.style.width = `${PDF_CAPTURE_WIDTH}px`;
    clone.style.height = `${PDF_CAPTURE_HEIGHT}px`;
    clone.style.minHeight = `${PDF_CAPTURE_HEIGHT}px`;
    clone.style.maxHeight = `${PDF_CAPTURE_HEIGHT}px`;
    clone.style.margin = '0';
    clone.style.boxSizing = 'border-box';
    clone.style.overflow = 'hidden';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '-1';
    clone.style.flex = 'none';
    clone.style.transform = 'none';

    document.body.appendChild(clone);
    return clone;
  };

  const renderFieldInput = (field: SlideFieldConfig) => (
    <div
      key={field.key}
      className="rounded-[24px] border border-blue-100 bg-white/92 p-4 shadow-[0_18px_50px_-36px_rgba(37,99,235,0.55)]"
    >
      <label
        className="mb-3 block font-medium text-slate-500"
        style={{ fontSize: `${layoutConfig.textSize}px` }}
      >
        {field.label}
      </label>
      <div className="relative">
        {field.prefix && (
          <span
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400"
            style={{ fontSize: `${layoutConfig.textSize * 1.1}px` }}
          >
            {field.prefix}
          </span>
        )}
        <input
          type="number"
          value={data[field.key]}
          onChange={(e) => updateValue(field.key, e.target.value)}
          className={`w-full rounded-2xl border-2 border-blue-100 bg-slate-50 text-center font-bold text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
            field.prefix ? 'pl-14' : ''
          }`}
          style={{
            fontSize: `${layoutConfig.titleSize * 1.2}px`,
            padding: `${layoutConfig.spacingScale * 0.8}rem`,
          }}
          placeholder={field.placeholder}
        />
      </div>
    </div>
  );

  const emitConfetti = (container: HTMLDivElement) => {
    const count = window.innerWidth < 640 ? 60 : 120;
    const colors = ['#34d399', '#22d3ee', '#60a5fa', '#f472b6', '#f59e0b', '#ef4444', '#a78bfa'];
    const fragment = document.createDocumentFragment();
    type P = { el: HTMLDivElement; x: number; y: number; vx: number; vy: number; rot: number; vr: number; };
    const particles: P[] = [];
    const rect = container.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = rect.height / 4;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 6 + 4;
      el.style.position = 'absolute';
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background = colors[(Math.random() * colors.length) | 0];
      el.style.borderRadius = Math.random() < 0.5 ? '2px' : '50%';
      el.style.willChange = 'transform, opacity';
      el.style.pointerEvents = 'none';
      el.style.opacity = '1';
      el.style.transform = `translate3d(${originX}px, ${originY}px, 0) rotate(0deg)`;
      el.style.animation = `confettiFade 0.6s ease-out forwards`;
      el.style.animationDelay = `2.4s`;
      fragment.appendChild(el);
      const angle = (Math.random() * Math.PI * 2);
      const speed = 220 + Math.random() * 380;
      const vx = Math.cos(angle) * speed;
      const vy = -(500 + Math.random() * 500);
      const rot = Math.random() * 360;
      const vr = (Math.random() - 0.5) * 360;
      particles.push({ el, x: originX, y: originY, vx, vy, rot, vr });
    }
    container.appendChild(fragment);
    let rafId = 0;
    let last = performance.now();
    const g = 1200;
    const drag = 0.995;
    const duration = 3000;
    const start = last;
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      for (const p of particles) {
        p.vy += g * dt;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
      }
      if (now - start < duration) {
        rafId = requestAnimationFrame(step);
      } else {
        for (const p of particles) container.removeChild(p.el);
      }
    };
    rafId = requestAnimationFrame(step);
    setTimeout(() => cancelAnimationFrame(rafId), duration);
  };

  useEffect(() => {
    if (showResult && !facesAnimating && headerFaceIndex === 3 && confettiRef.current) {
      emitConfetti(confettiRef.current);
    }
  }, [showResult, facesAnimating, headerFaceIndex]);

  const downloadSlidesPdf = async () => {
    const originalSlide = currentSlide;
    const originalShowResult = showResult;

    try {
      setIsExportingPdf(true);

      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      setShowResult(true);
      await waitForSlidePaint();
      await document.fonts.ready;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const fileDate = new Date().toISOString().slice(0, 10);

      for (let index = 0; index < slides.length; index += 1) {
        setCurrentSlide(index);
        await waitForSlidePaint();

        const slideElement = slideCaptureRef.current;
        if (!slideElement) {
          throw new Error('Slide element not found for PDF capture.');
        }

        const captureClone = createPdfCaptureClone(slideElement);
        let canvas: HTMLCanvasElement;

        try {
          canvas = await html2canvas(captureClone, {
            backgroundColor: '#f8fbff',
            scale: 2,
            useCORS: true,
            width: PDF_CAPTURE_WIDTH,
            height: PDF_CAPTURE_HEIGHT,
            windowWidth: PDF_CAPTURE_WIDTH,
            windowHeight: PDF_CAPTURE_HEIGHT,
            scrollX: 0,
            scrollY: 0,
          });
        } finally {
          captureClone.remove();
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imageData = canvas.toDataURL('image/png');
        const margin = 8;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;
        const ratio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
        const imageWidth = canvas.width * ratio;
        const imageHeight = canvas.height * ratio;
        const imageX = (pageWidth - imageWidth) / 2;
        const imageY = (pageHeight - imageHeight) / 2;

        if (index > 0) {
          pdf.addPage();
        }

        pdf.setFillColor(248, 251, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.addImage(imageData, 'PNG', imageX, imageY, imageWidth, imageHeight, undefined, 'FAST');
      }

      pdf.save(`slides-termometro-escola-sabatina-${fileDate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setCurrentSlide(originalSlide);
      await waitForSlidePaint();
      setShowResult(originalShowResult);
      await waitForSlidePaint();
      setIsExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="w-full h-[100dvh] flex flex-col bg-blue-50 overflow-hidden font-sans text-gray-800">
      <style>{`
        @keyframes thermoPulse { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-2px) scale(1.02); } 100% { transform: translateY(0) scale(1);} }
        @keyframes heat { 0% { filter: saturate(1); } 50% { filter: saturate(1.2) brightness(1.03); } 100% { filter: saturate(1); } }
        .animate-thermo { animation: thermoPulse 2.4s ease-in-out infinite; }
        .animate-heat { animation: heat 2s ease-in-out infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%);} }
        .animate-marquee { animation: marquee 18s linear infinite; }
        .text-shadow-soft { text-shadow: 0 2px 6px rgba(0,0,0,0.25); }
        @keyframes facesFadeOut { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.85);} }
        .animate-faces-fade { animation: facesFadeOut 0.5s ease-in forwards; }
        @keyframes faceScaleIn { 0% { opacity: 0; transform: scale(0.6);} 60% { opacity: 1; transform: scale(1.05);} 100% { opacity: 1; transform: scale(1);} }
        .animate-faceScaleIn { animation: faceScaleIn 0.6s ease-out forwards; }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.35s ease-out forwards; }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spinSlow 1.2s linear infinite; }
        .ios-scroll { -webkit-overflow-scrolling: touch; }
        .mask-linear-fade { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes confettiFade { 0% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
      
      {!isPresentationMode && (
      <header className="flex-none border-b border-blue-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-2 shadow-inner ring-1 ring-blue-100">
              <img
                src={escolaSabatinaLogo}
                alt="Logo da Escola Sabatina"
                className="h-10 w-10 object-contain md:h-12 md:w-12"
              />
            </div>
            <div className="min-w-0">
              <h1
                className="truncate font-bold tracking-tight text-slate-900"
                style={{ fontSize: `${layoutConfig.titleSize}px` }}
              >
                Termômetro da Escola Sabatina
              </h1>
              <p className="hidden text-sm text-slate-500 lg:block">
                Painel em 5 slides com leitura rápida, resultado visual e exportação em PDF.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadSlidesPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:px-4"
              aria-label="Baixar PDF dos 5 slides"
              title="Baixar PDF dos 5 slides"
            >
              <Download className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-medium">{isExportingPdf ? 'Gerando PDF...' : 'Baixar PDF'}</span>
            </button>
            <button
              onClick={() => setLayoutOpen(true)}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-blue-600 md:px-4"
              aria-label="Ajustes de Layout"
              title="Ajustar tamanho e espaçamento"
            >
              <SlidersHorizontal className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-medium">Ajustes</span>
            </button>
            <button
              onClick={togglePresentationMode}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-blue-600 md:px-4"
              aria-label="Entrar no modo apresentação"
              title="Entrar no modo apresentação"
            >
              <Maximize className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-medium">Tela Cheia</span>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-blue-600 md:px-4"
              aria-label="Configurações"
            >
              <Settings className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-medium">Configurações</span>
            </button>
          </div>
        </div>
      </header>
      )}

      <main className="flex-1 min-h-0 overflow-hidden">
        <div className={`mx-auto flex h-full w-full ${isPresentationMode ? 'max-w-none px-0 py-0' : 'max-w-[1500px] px-4 py-3 md:px-8 md:py-4'} flex-col`}>
          <section ref={slideCaptureRef} className={`relative flex-1 overflow-hidden ${isPresentationMode ? 'rounded-none border-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] shadow-none' : 'rounded-[32px] border border-blue-100 bg-white/72 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur-xl'}`}>
            {isPresentationMode && (
              <button
                onClick={togglePresentationMode}
                className="absolute z-20 flex items-center rounded-full bg-white/90 text-slate-700 shadow-lg transition-colors hover:bg-white"
                style={{
                  top: presentationSectionPadding,
                  right: presentationSectionPadding,
                  gap: `${presentationSpacing * 0.5}rem`,
                  padding: presentationButtonPadding,
                  fontSize: presentationLabelSize,
                }}
              >
                <Minimize style={{ width: presentationIconSize, height: presentationIconSize }} />
                <span className="font-medium">Sair da Tela Cheia</span>
              </button>
            )}
            <div
              className="grid h-full min-h-0 grid-cols-1 lg:[grid-template-columns:var(--layout-columns)]"
              style={presentationGridStyle}
            >
              <div
                className={`flex flex-col ${isPresentationMode ? 'border-b-0 xl:border-r' : 'border-b border-blue-100 p-5 md:p-6 xl:border-b-0 xl:border-r'}`}
                style={isPresentationMode ? { padding: presentationSectionPadding } : undefined}
              >
                <div className="flex flex-col" style={isPresentationMode ? { gap: presentationGap } : undefined}>
                  <div
                    className="flex flex-wrap items-start justify-between gap-4"
                    style={isPresentationMode ? { gap: presentationGap } : undefined}
                  >
                    <div className="min-w-0">
                      <p
                        className="font-semibold uppercase tracking-[0.35em] text-blue-500"
                        style={{ fontSize: presentationMetaSize }}
                      >
                        Slide {currentSlide + 1} de {slides.length}
                      </p>
                      <h2
                        className="mt-3 font-black leading-tight text-slate-900"
                        style={{ fontSize: `${layoutConfig.titleSize * 1.25}px` }}
                      >
                        {activeSlide.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevSlide}
                        className="rounded-full border border-blue-100 p-3 text-blue-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
                        style={isPresentationMode ? { width: presentationNavButtonSize, height: presentationNavButtonSize } : undefined}
                        disabled={currentSlide === 0}
                      >
                        <ChevronLeft style={{ width: presentationIconSize, height: presentationIconSize }} />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="rounded-full border border-blue-100 p-3 text-blue-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
                        style={isPresentationMode ? { width: presentationNavButtonSize, height: presentationNavButtonSize } : undefined}
                        disabled={currentSlide === slides.length - 1}
                      >
                        <ChevronRight style={{ width: presentationIconSize, height: presentationIconSize }} />
                      </button>
                    </div>
                  </div>

                  {!isPresentationMode && (
                    <div className={`grid gap-3 ${layoutConfig.stackLeftCards ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                      {activeSlide.fields.map(renderFieldInput)}
                    </div>
                  )}

                </div>

                {isPresentationMode && layoutConfig.showPresentationCards && (
                  <div
                    className={`mt-4 grid ${layoutConfig.stackLeftCards ? 'grid-cols-1' : 'md:grid-cols-2'}`}
                    style={{ gap: presentationGap }}
                  >
                    <div
                      className="rounded-[28px] border border-blue-100 bg-slate-50/90"
                      style={{ padding: presentationCardPadding }}
                    >
                      <p className="font-medium text-slate-500" style={{ fontSize: presentationLabelSize }}>
                        {activeSlide.primaryLabel}
                      </p>
                      <div
                        className="mt-5 font-black text-slate-900"
                        style={{ fontSize: `${layoutConfig.titleSize * 1.45}px` }}
                      >
                        {activeSlide.primaryValue}
                      </div>
                    </div>
                    <div
                      className="rounded-[28px] border border-blue-100 bg-slate-50/90"
                      style={{ padding: presentationCardPadding }}
                    >
                      <p className="font-medium text-slate-500" style={{ fontSize: presentationLabelSize }}>
                        {activeSlide.secondaryLabel}
                      </p>
                      <div
                        className="mt-5 font-black text-slate-900"
                        style={{ fontSize: `${layoutConfig.titleSize * 1.2}px` }}
                      >
                        {activeSlide.secondaryValue}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`flex flex-col ${isPresentationMode ? '' : 'p-5 md:p-6'}`}
                style={isPresentationMode ? { padding: presentationSectionPadding } : undefined}
              >
                <div
                  className={`flex flex-1 flex-col rounded-[32px] border border-blue-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(239,246,255,0.92)_100%)] shadow-[0_24px_70px_-50px_rgba(37,99,235,0.55)] ${isPresentationMode ? '' : 'p-5 md:p-6'}`}
                  style={isPresentationMode ? { padding: presentationBlockPadding } : undefined}
                >
                  <div
                    className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
                    style={isPresentationMode ? { gap: presentationLargeGap } : undefined}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-500" style={{ fontSize: presentationLabelSize }}>
                        {activeSlide.percentageLabel}
                      </p>
                      <div className={`mt-2 font-black leading-none ${progressTextClass}`} style={{ fontSize: `${layoutConfig.titleSize * 2.15 * resultScale}px` }}>
                        {displayPercent.toFixed(percentDecimals)}%
                      </div>
                      <p className="mt-3 text-slate-500" style={{ fontSize: presentationBodySize }}>
                        {getPerformanceLabel(headerPercent)}
                      </p>
                    </div>

                    <div className="relative flex flex-1 items-center justify-center lg:max-w-[260px]" style={{ minHeight: `${170 * resultScale}px` }}>
                      <div ref={confettiRef} className="absolute inset-0 pointer-events-none" />
                      {!showResult && !facesAnimating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="grid grid-cols-2" style={{ gap: presentationGap }}>
                            {faces.map((face, index) => (
                              <div key={index} className="flex items-center justify-center">
                                <div className={`rounded-full ${face.bg} p-1 shadow-lg`} style={{ width: `${80 * resultScale}px`, height: `${80 * resultScale}px` }}>
                                  <img src={face.img} alt="Faixa de resultado" className="h-full w-full rounded-full bg-white object-cover" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(showResult || facesAnimating) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {facesAnimating ? (
                          <Hourglass className="animate-spin-slow text-blue-500" style={{ width: `${80 * resultScale}px`, height: `${80 * resultScale}px` }} />
                        ) : (
                          <div className={`flex flex-col items-center gap-4 ${isExportingPdf ? '' : 'animate-faceScaleIn'}`}>
                              <div className={`rounded-full ${faces[headerFaceIndex].bg} p-2 shadow-2xl ring-8 ring-white/80`} style={{ width: `${144 * resultScale}px`, height: `${144 * resultScale}px` }}>
                                <img
                                  src={faces[headerFaceIndex].img}
                                  alt="Resultado"
                                  className="h-full w-full rounded-full bg-white object-cover"
                                />
                              </div>
                              <div className={`font-black ${progressTextClass} drop-shadow-sm`} style={{ fontSize: `${36 * resultScale}px` }}>
                                {displayPercent.toFixed(percentDecimals)}%
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between font-medium text-slate-500" style={{ fontSize: presentationMetaSize }}>
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                    <div className="h-10 overflow-hidden rounded-full bg-slate-200 shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${progressFillClass} ${isExportingPdf ? '' : 'transition-[width] duration-700 ease-out animate-heat'}`}
                        style={{ width: `${Math.min(showResult ? displayPercent : 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
                    style={isPresentationMode ? { gap: presentationGap } : undefined}
                  >
                    <div
                      className="rounded-2xl bg-white/70 px-4 py-3 text-slate-500 shadow-sm"
                      style={isPresentationMode ? { padding: presentationCardPadding } : undefined}
                    >
                      <div className="font-medium" style={{ fontSize: presentationMetaSize }}>Leitura rápida</div>
                      <div className="mt-1" style={{ fontSize: presentationBodySize }}>
                        {activeSlide.primaryLabel}: <span className="font-bold text-slate-900">{activeSlide.primaryValue}</span>
                      </div>
                    </div>
                    <button
                      onClick={toggleShowResult}
                      className={`w-full rounded-full px-7 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] md:w-auto ${
                        showResult
                          ? 'bg-gradient-to-r from-slate-500 to-slate-600'
                          : 'animate-pulse-slow bg-gradient-to-r from-blue-600 to-blue-500'
                      }`}
                      style={isPresentationMode ? { padding: presentationButtonPadding, fontSize: presentationButtonTextSize } : undefined}
                    >
                      {showResult ? 'Ocultar Resultado' : 'Mostrar Resultado com Carinhas'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {!isPresentationMode && layoutConfig.showFooterSummary && (
      <footer className="flex-none border-t border-blue-100 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap gap-2 px-4 py-2 md:px-8">
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Membros da Igreja: <span className="font-bold text-slate-900">{normalizedData.totalMembers}</span>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Alunos Presentes: <span className="font-bold text-slate-900">{normalizedData.membersPresent}</span>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Estudaram a Lição: <span className="font-bold text-slate-900">{normalizedData.communion}</span>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Participaram do PG: <span className="font-bold text-slate-900">{normalizedData.smallGroup}</span>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Deram Estudos Bíblicos: <span className="font-bold text-slate-900">{normalizedData.biblicalStudies}</span>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Ofertas: <span className="font-bold text-slate-900">{formatCurrency(normalizedData.weeklyAverage)}</span> / {formatCurrency(normalizedData.weeklyGoal)}
          </div>
        </div>
      </footer>
      )}

      {settingsOpen && (
        <SettingsModal
          data={data}
          updateValue={updateValue}
          onClose={() => setSettingsOpen(false)}
          percentDecimals={percentDecimals}
          setPercentDecimals={setPercentDecimals}
          exportData={exportData}
          importData={importData}
        />
      )}

      {layoutOpen && (
        <LayoutSettingsModal
          config={layoutConfig}
          setConfig={applyLayoutConfig}
          onClose={() => setLayoutOpen(false)}
          onReset={() => setLayoutConfig(normalizeLayoutConfig(defaultLayoutConfig))}
        />
      )}
    </div>
  );
}
