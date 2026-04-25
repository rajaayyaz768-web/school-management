import axios from '@/lib/axios';
import {
  AcademicYear,
  GradePromotionStatus,
  PromotionHistoryItem,
  PromotionRunSummary,
  RunAnnualInput,
  RunTransitionalInput,
} from '../types/promotion.types';

export const fetchPromotionStatus = async (): Promise<GradePromotionStatus[]> => {
  const res = await axios.get('/promotion/status');
  return res.data.data;
};

export const fetchAcademicYears = async (): Promise<AcademicYear[]> => {
  const res = await axios.get('/promotion/academic-year');
  return res.data.data;
};

export const createAcademicYear = async (name: string): Promise<AcademicYear> => {
  const res = await axios.post('/promotion/academic-year', { name });
  return res.data.data;
};

export const runTransitional = async (data: RunTransitionalInput): Promise<PromotionRunSummary> => {
  const res = await axios.post('/promotion/run/transitional', data);
  return res.data.data;
};

export const runAnnual = async (data: RunAnnualInput): Promise<PromotionRunSummary> => {
  const res = await axios.post('/promotion/run/annual', data);
  return res.data.data;
};

export const fetchPromotionHistory = async (): Promise<PromotionHistoryItem[]> => {
  const res = await axios.get('/promotion/history');
  return res.data.data;
};
