import axios from 'axios';
import { Ticket, TicketCreate, AnalysisRun, AnalysisRequest } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketApi = {
  createTickets: async (tickets: TicketCreate[]): Promise<Ticket[]> => {
    try {
      const response = await api.post('/tickets/', { tickets });
      return response.data;
    } catch (error) {
      throw new Error('Failed to create tickets');
    }
  },

  getTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get('/tickets/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch tickets');
    }
  },
};

export const analysisApi = {
  runAnalysis: async (request: AnalysisRequest): Promise<AnalysisRun> => {
    try {
      const response = await api.post('/analysis/', request);
      return response.data;
    } catch (error) {
      throw new Error('Failed to run analysis');
    }
  },

  getLatestAnalysis: async (): Promise<AnalysisRun | null> => {
    try {
      const response = await api.get('/analysis/latest');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};