import axios, { AxiosResponse } from 'axios'
import { 
  Log, 
  Incident, 
  AgentResponse, 
  TriageResult, 
  AnalysisResult, 
  MLPrediction, 
  MLModelStatus,
  DashboardStats,
  PaginatedResponse 
} from '@/types'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token (when implemented)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        // Redirect to login page when implemented
      }
    }
    return Promise.reject(error)
  }
)

// API endpoints

// Health check
export const healthApi = {
  check: (): Promise<AxiosResponse<{ status: string; service: string }>> =>
    api.get('/health'),
  
  status: (): Promise<AxiosResponse<{ message: string; version: string }>> =>
    api.get('/'),
}

// Logs API
export const logsApi = {
  // Get logs with filtering and pagination
  getLogs: (params?: {
    skip?: number
    limit?: number
    is_anomaly?: boolean
    severity?: string
  }): Promise<AxiosResponse<Log[]>> =>
    api.get('/api/logs', { params }),

  // Get specific log by ID
  getLog: (id: number): Promise<AxiosResponse<Log>> =>
    api.get(`/api/logs/${id}`),

  // Create new log entry
  createLog: (log: Omit<Log, 'id'>): Promise<AxiosResponse<Log>> =>
    api.post('/api/logs', log),

  // Update log entry
  updateLog: (id: number, log: Partial<Log>): Promise<AxiosResponse<Log>> =>
    api.put(`/api/logs/${id}`, log),

  // Delete log entry
  deleteLog: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/api/logs/${id}`),

  // Get recent anomalies
  getRecentAnomalies: (limit?: number): Promise<AxiosResponse<Log[]>> =>
    api.get('/api/logs/anomalies/recent', { params: { limit } }),
}

// Incidents API
export const incidentsApi = {
  // Get incidents with filtering and pagination
  getIncidents: (params?: {
    skip?: number
    limit?: number
    status?: string
    severity?: string
  }): Promise<AxiosResponse<Incident[]>> =>
    api.get('/api/incidents', { params }),

  // Get specific incident by ID
  getIncident: (id: number): Promise<AxiosResponse<Incident>> =>
    api.get(`/api/incidents/${id}`),

  // Create new incident
  createIncident: (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<AxiosResponse<Incident>> =>
    api.post('/api/incidents', incident),

  // Update incident
  updateIncident: (id: number, incident: Partial<Incident>): Promise<AxiosResponse<Incident>> =>
    api.put(`/api/incidents/${id}`, incident),

  // Delete incident
  deleteIncident: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/api/incidents/${id}`),

  // Get critical open incidents
  getCriticalIncidents: (): Promise<AxiosResponse<Incident[]>> =>
    api.get('/api/incidents/open/critical'),
}

// AI Agents API
export const agentsApi = {
  // Triage agent - single log analysis
  triageLog: (logData: Record<string, any>): Promise<AxiosResponse<TriageResult>> =>
    api.post('/api/agents/triage', logData),

  // Triage agent - batch analysis
  triageBatch: (logsData: Record<string, any>[]): Promise<AxiosResponse<any>> =>
    api.post('/api/agents/triage/batch', logsData),

  // Analysis agent - incident analysis
  analyzeIncident: (incidentData: Record<string, any>): Promise<AxiosResponse<AnalysisResult>> =>
    api.post('/api/agents/analysis', incidentData),

  // Analysis agent - threat report
  generateThreatReport: (incidentsData: Record<string, any>[]): Promise<AxiosResponse<any>> =>
    api.post('/api/agents/analysis/threat-report', incidentsData),

  // Chatbot agent
  chat: (message: string, context?: Record<string, any>): Promise<AxiosResponse<any>> =>
    api.post('/api/agents/chatbot', { message }, { params: context }),

  // Security guidance
  getSecurityGuidance: (topic: string): Promise<AxiosResponse<any>> =>
    api.post('/api/agents/chatbot/guidance', { topic }),

  // Conversation summary
  getConversationSummary: (): Promise<AxiosResponse<any>> =>
    api.get('/api/agents/chatbot/summary'),

  // Clear conversation history
  clearConversationHistory: (): Promise<AxiosResponse<{ status: string }>> =>
    api.delete('/api/agents/chatbot/history'),

  // Get agent responses history
  getAgentResponses: (params?: {
    agent_type?: string
    limit?: number
  }): Promise<AxiosResponse<AgentResponse[]>> =>
    api.get('/api/agents/responses', { params }),
}

// Machine Learning API
export const mlApi = {
  // Predict anomaly
  predict: (
    logFeatures: Record<string, any>, 
    modelType?: string
  ): Promise<AxiosResponse<MLPrediction>> =>
    api.post('/api/ml/predict', logFeatures, { params: { model_type: modelType } }),

  // Trigger model training
  trainModels: (): Promise<AxiosResponse<{ status: string; message: string; estimated_time: string }>> =>
    api.post('/api/ml/train'),

  // Get model status
  getModelStatus: (): Promise<AxiosResponse<MLModelStatus>> =>
    api.get('/api/ml/status'),

  // Get model metrics
  getModelMetrics: (): Promise<AxiosResponse<any>> =>
    api.get('/api/ml/metrics'),
}

// Dashboard API (derived from other endpoints)
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Fetch data from multiple endpoints
      const [logsResponse, anomaliesResponse, incidentsResponse] = await Promise.all([
        logsApi.getLogs({ limit: 1 }),
        logsApi.getRecentAnomalies(10),
        incidentsApi.getCriticalIncidents(),
      ])

      // Calculate stats
      const stats: DashboardStats = {
        total_logs: logsResponse.data.length, // This would need proper counting in a real scenario
        anomalies_today: anomaliesResponse.data.length,
        critical_incidents: incidentsResponse.data.length,
        system_health: incidentsResponse.data.length > 5 ? 'critical' : 
                      incidentsResponse.data.length > 2 ? 'warning' : 'healthy',
        recent_alerts: anomaliesResponse.data.slice(0, 5).map((log, index) => ({
          id: `alert-${index}`,
          type: 'anomaly' as const,
          severity: log.severity as 'low' | 'medium' | 'high' | 'critical',
          message: `Anomaly detected from ${log.source_ip}`,
          timestamp: log.timestamp,
          read: false,
        })),
      }

      return stats
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      throw error
    }
  },
}

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Type for API error responses
export interface ApiError {
  message: string
  status?: number
  code?: string
}

export default api 