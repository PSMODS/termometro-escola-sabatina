export type MetricValue = number | '';

export interface MetricData {
  communion: MetricValue;
  membersPresent: MetricValue;
  smallGroup: MetricValue;
  biblicalStudies: MetricValue;
  projects: MetricValue;
  totalMembers: MetricValue;
  weeklyAverage: MetricValue;
  weeklyGoal: MetricValue;
}

export interface NormalizedMetricData {
  communion: number;
  membersPresent: number;
  smallGroup: number;
  biblicalStudies: number;
  projects: number;
  totalMembers: number;
  weeklyAverage: number;
  weeklyGoal: number;
}

export const emptyMetricData: MetricData = {
  communion: '',
  membersPresent: '',
  smallGroup: '',
  biblicalStudies: '',
  projects: '',
  totalMembers: '',
  weeklyAverage: '',
  weeklyGoal: '',
};

const toNumber = (value: MetricValue | null | undefined): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const getMetricNumber = (value: MetricValue): number => toNumber(value);

export const normalizeMetricData = (data: MetricData): NormalizedMetricData => ({
  communion: toNumber(data.communion),
  membersPresent: toNumber(data.membersPresent),
  smallGroup: toNumber(data.smallGroup),
  biblicalStudies: toNumber(data.biblicalStudies),
  projects: toNumber(data.projects),
  totalMembers: toNumber(data.totalMembers),
  weeklyAverage: toNumber(data.weeklyAverage),
  weeklyGoal: toNumber(data.weeklyGoal),
});

export const parseStoredMetricData = (value: string | null): MetricData => {
  if (!value) {
    return emptyMetricData;
  }

  try {
    const parsed = JSON.parse(value) as Partial<MetricData>;
    return {
      communion: parsed.communion ?? '',
      membersPresent: parsed.membersPresent ?? '',
      smallGroup: parsed.smallGroup ?? '',
      biblicalStudies: parsed.biblicalStudies ?? '',
      projects: parsed.projects ?? '',
      totalMembers: parsed.totalMembers ?? '',
      weeklyAverage: parsed.weeklyAverage ?? '',
      weeklyGoal: parsed.weeklyGoal ?? '',
    };
  } catch {
    return emptyMetricData;
  }
};
