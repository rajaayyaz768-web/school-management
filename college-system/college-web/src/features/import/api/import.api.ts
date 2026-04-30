import axios from '@/lib/axios';
import { ValidationReport, ImportResult, ImportHistoryRecord } from '../types/import.types';

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const downloadTemplate = async (sectionId: string): Promise<void> => {
  const response = await axios.get(`/sections/${sectionId}/import/template`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
  triggerBlobDownload(blob, `Import_Template_${sectionId}.csv`);
};

export const validateImport = async (
  sectionId: string,
  file: File
): Promise<ValidationReport> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post<{ success: boolean; data: ValidationReport }>(
    `/sections/${sectionId}/import/validate`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const confirmImport = async (
  sectionId: string,
  validationToken: string,
  acknowledgeWarnings: boolean
): Promise<ImportResult> => {
  const response = await axios.post<{ success: boolean; data: ImportResult }>(
    `/sections/${sectionId}/import/confirm`,
    { validationToken, acknowledgeWarnings }
  );
  return response.data.data;
};

export const downloadCredentials = async (importId: string, sectionName: string): Promise<void> => {
  const response = await axios.get(`/imports/${importId}/credentials`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const date = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(blob, `Credentials_${sectionName}_${date}.xlsx`);
};

export const getImportHistory = async (sectionId: string): Promise<ImportHistoryRecord[]> => {
  const response = await axios.get<{ success: boolean; data: ImportHistoryRecord[] }>(
    `/sections/${sectionId}/import/history`
  );
  return response.data.data;
};
