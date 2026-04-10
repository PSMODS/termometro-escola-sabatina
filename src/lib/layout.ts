export interface LayoutConfig {
  titleSize: number;
  textSize: number;
  iconSize: number;
  spacingScale: number;
  leftPanelWidth: number;
  resultScale: number;
  showFooterSummary: boolean;
  showPresentationCards: boolean;
  showProjectsSlide: boolean;
  stackLeftCards: boolean;
}

export const defaultLayoutConfig: LayoutConfig = {
  titleSize: 22,
  textSize: 15,
  iconSize: 22,
  spacingScale: 0.9,
  leftPanelWidth: 58,
  resultScale: 0.95,
  showFooterSummary: true,
  showPresentationCards: true,
  showProjectsSlide: true,
  stackLeftCards: false,
};
