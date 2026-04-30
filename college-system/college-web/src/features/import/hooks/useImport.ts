'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as importApi from '../api/import.api';
import { useToast } from '@/hooks/useToast';
import { extractApiError } from '@/lib/apiError';

export const useDownloadTemplate = (sectionId: string) => {
  const { error } = useToast();
  return useMutation({
    mutationFn: () => importApi.downloadTemplate(sectionId),
    onError: (err: unknown) => {
      error(extractApiError(err, 'Failed to download template'));
    },
  });
};

export const useValidateImport = () => {
  const { error } = useToast();
  return useMutation({
    mutationFn: ({ sectionId, file }: { sectionId: string; file: File }) =>
      importApi.validateImport(sectionId, file),
    onError: (err: unknown) => {
      error(extractApiError(err, 'Validation failed'));
    },
  });
};

export const useConfirmImport = (sectionId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: ({
      validationToken,
      acknowledgeWarnings,
    }: {
      validationToken: string;
      acknowledgeWarnings: boolean;
    }) => importApi.confirmImport(sectionId, validationToken, acknowledgeWarnings),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['import-history', sectionId] });
      success(`Import complete — ${data.studentsCreated} students added`);
    },
    onError: (err: unknown) => {
      error(extractApiError(err, 'Import failed'));
    },
  });
};

export const useDownloadCredentials = (sectionName: string) => {
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (importId: string) => importApi.downloadCredentials(importId, sectionName),
    onSuccess: () => {
      success('Credentials file downloaded');
    },
    onError: (err: unknown) => {
      error(extractApiError(err, 'Failed to download credentials'));
    },
  });
};

export const useImportHistory = (sectionId: string) =>
  useQuery({
    queryKey: ['import-history', sectionId],
    queryFn: () => importApi.getImportHistory(sectionId),
    enabled: !!sectionId,
  });
