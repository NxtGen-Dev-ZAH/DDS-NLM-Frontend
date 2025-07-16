// Core entity types matching backend models

export interface Log {
  id?: number
  timestamp: string
  source_ip: string
  destination_ip: string
  source_port: number
  destination_port: number
  protocol: string
  packet_size: number
  flags?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  is_anomaly: boolean
  anomaly_score?: number
  ml_model_used?: string
  raw_log?: string
}

export interface Incident {
  id?: number
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
  resolved_at?: string
  affected_ips?: string
  attack_vector?: string
  indicators_of_compromise?: string
  agent_analysis?: string
  recommended_actions?: string
}

export interface AgentResponse {
  id?: number
  agent_type: 'triage' | 'analysis' | 'chatbot'
  request_data: string
  response_data: string
  execution_time: number
  created_at: string
  incident_id?: number
  log_id?: number
  confidence_score?: number
  status: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Dashboard specific types
export interface DashboardStats {
  total_logs: number
  anomalies_today: number
  critical_incidents: number
  system_health: 'healthy' | 'warning' | 'critical'
  recent_alerts: Alert[]
}

export interface Alert {
  id: string
  type: 'anomaly' | 'incident' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  read: boolean
}

// Chart data types
export interface ChartDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface TimeSeriesData {
  name: string
  data: ChartDataPoint[]
  color?: string
}

// Agent interaction types
export interface ChatMessage {
  id: string
  message: string
  sender: 'user' | 'agent'
  timestamp: string
  context?: Record<string, any>
}

export interface TriageResult {
  threat_level: 'low' | 'medium' | 'high' | 'critical'
  priority_score: number
  is_anomaly: boolean
  attack_vector?: string
  recommended_actions: string[]
  confidence: number
  explanation: string
}

export interface AnalysisResult {
  attack_classification: {
    primary_vector: string
    mitre_tactics: string[]
    mitre_techniques: string[]
    attack_sophistication: 'low' | 'medium' | 'high' | 'advanced'
  }
  indicators_of_compromise: {
    ip_addresses: string[]
    domains: string[]
    file_hashes: string[]
    user_agents: string[]
    network_signatures: string[]
  }
  impact_assessment: {
    affected_systems: string[]
    data_at_risk: string[]
    business_impact: 'low' | 'medium' | 'high' | 'critical'
    estimated_scope: 'localized' | 'department' | 'organization' | 'external'
  }
  containment_strategy: {
    immediate_actions: string[]
    isolation_steps: string[]
    evidence_preservation: string[]
    communication_plan: string[]
  }
  recovery_plan: {
    system_restoration: string[]
    data_recovery: string[]
    security_hardening: string[]
    monitoring_enhancement: string[]
  }
  prevention_measures: {
    technical_controls: string[]
    policy_updates: string[]
    training_needs: string[]
    vulnerability_patches: string[]
  }
  confidence_score: number
  analysis_summary: string
}

// ML Model types
export interface MLPrediction {
  is_anomaly: boolean
  anomaly_score: number
  confidence: number
  model_used: string
  features_analyzed: string[]
}

export interface MLModelStatus {
  models: Record<string, {
    status: 'trained' | 'training' | 'error'
    accuracy: number
    last_trained: string
  }>
  overall_status: 'healthy' | 'warning' | 'error'
}

// Form types
export interface LogFormData {
  source_ip: string
  destination_ip: string
  source_port: number
  destination_port: number
  protocol: string
  packet_size: number
  flags?: string
  severity: Log['severity']
  raw_log?: string
}

export interface IncidentFormData {
  title: string
  description: string
  severity: Incident['severity']
  affected_ips?: string
  attack_vector?: string
}

// Filter and search types
export interface LogFilters {
  is_anomaly?: boolean
  severity?: Log['severity']
  start_date?: string
  end_date?: string
  source_ip?: string
  destination_ip?: string
}

export interface IncidentFilters {
  status?: Incident['status']
  severity?: Incident['severity']
  start_date?: string
  end_date?: string
}

// Navigation types
export interface NavItem {
  name: string
  href: string
  icon?: string
  children?: NavItem[]
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// User context types (for future user management)
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'analyst' | 'viewer'
  permissions: string[]
}

export interface UserSession {
  user: User
  token: string
  expires_at: string
} 