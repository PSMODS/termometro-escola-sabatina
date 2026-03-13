export interface LayoutConfig {
  titleSize: number;
  textSize: number;
  iconSize: number;
  spacingScale: number;
  leftPanelWidth: number;
  resultScale: number;
  showFooterSummary: boolean;
  showPresentationCards: boolean;
  stackLeftCards: boolean;
}

export const defaultLayoutConfig: LayoutConfig = {
  titleSize: 24,
  textSize: 16,
  iconSize: 24,
  spacingScale: 1,
  leftPanelWidth: 60,
  resultScale: 1,
  showFooterSummary: true,
  showPresentationCards: true,
  stackLeftCards: false,
};
