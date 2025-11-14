export interface Ticket {
  id: number;
  title: string;
  description: string;
  created_at: string;
  status: 'incomplete' | 'complete';
}

export interface TicketCreate {
  title: string;
  description: string;
  status?: 'incomplete' | 'complete';
}

export interface TicketAnalysis {
  id: number;
  analysis_run_id: number;
  ticket_id: number;
  category: string;
  priority: string;
  notes?: string;
  created_at: string;
  ticket?: Ticket;
}

export interface AnalysisRun {
  id: number;
  summary: string;
  created_at: string;
  ticket_analyses: TicketAnalysis[];
}

export interface AnalysisRequest {
  ticket_ids?: number[];
}