import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MetricData,
  emptyMetricData,
  parseStoredMetricData,
} from '../lib/metrics';

export const useThermometerData = (sessionId: string) => {
  const storageKey = `thermometer_data:${sessionId}`;
  const [data, setData] = useState<MetricData>(emptyMetricData);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const localData = parseStoredMetricData(localStorage.getItem(storageKey));
      setData(localData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = useCallback(async (newData: MetricData) => {
    localStorage.setItem(storageKey, JSON.stringify(newData));
  }, [storageKey]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `termometro-data-${sessionId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, sessionId]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        // Validate the data structure
        const validatedData: MetricData = {
          communion: importedData.communion || '',
          membersPresent: importedData.membersPresent || '',
          smallGroup: importedData.smallGroup || '',
          biblicalStudies: importedData.biblicalStudies || '',
          projects: importedData.projects || '',
          totalMembers: importedData.totalMembers || '',
          weeklyAverage: importedData.weeklyAverage || '',
          weeklyGoal: importedData.weeklyGoal || '',
        };
        setData(validatedData);
        localStorage.setItem(storageKey, JSON.stringify(validatedData));
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Erro ao importar dados. Verifique se o arquivo é válido.');
      }
    };
    reader.readAsText(file);
  }, [storageKey]);

  return { data, setData, saveData, loading, exportData, importData };
};
