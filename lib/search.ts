import { Log, Incident } from '@/types'

export interface SearchResult {
  id: string
  type: 'log' | 'incident' | 'attack_log'
  title: string
  description: string
  severity?: string
  timestamp?: string
  source_ip?: string
  destination_ip?: string
  threat_type?: string
  status?: string
  url: string
  score: number
}

export interface SearchFilters {
  types?: ('log' | 'incident' | 'attack_log')[]
  severity?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

class SearchService {
  private logsData: any[] = []
  private incidentsData: any[] = []
  private attackLogsData: any[] = []
  private dataLoaded = false

  constructor() {
    // Don't load data in constructor, load on first search
  }

  private async loadData() {
    try {
      // For now, just generate mock data instead of loading from files
      this.logsData = this.generateMockLogs()
      this.attackLogsData = this.generateMockAttackLogs()
      this.incidentsData = this.generateMockIncidents()
      
      // Data loaded successfully
    } catch (error) {
      console.error('Error loading search data:', error)
    }
  }

  private generateMockLogs() {
    const protocols = ['HTTP', 'HTTPS', 'SSH', 'FTP', 'SMTP', 'DNS']
    const severities = ['info', 'warning', 'error', 'critical']
    const ips = ['192.168.1.100', '10.0.0.15', '172.16.0.42', '192.168.47.103']
    
    return Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      source_ip: ips[Math.floor(Math.random() * ips.length)],
      destination_ip: ips[Math.floor(Math.random() * ips.length)],
      source_port: Math.floor(Math.random() * 65535),
      destination_port: Math.floor(Math.random() * 65535),
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      packet_size: Math.floor(Math.random() * 2048) + 64,
      severity: severities[Math.floor(Math.random() * severities.length)],
      is_anomaly: Math.random() < 0.2,
      anomaly_score: Math.floor(Math.random() * 100),
      ml_model_used: Math.random() < 0.3 ? 'RandomForest' : null,
      raw_log: `Sample log entry ${index + 1}`
    }))
  }

  private generateMockAttackLogs() {
    const threatTypes = ['DDoS', 'SQL Injection', 'Brute Force', 'XSS', 'Phishing', 'Exploit', 'FTP Attack']
    const severities = ['critical', 'high', 'medium', 'low']
    const ips = ['192.168.1.100', '10.0.0.15', '172.16.0.42', '192.168.47.103']
    
    return Array.from({ length: 30 }, (_, index) => ({
      id: index + 1,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      source_ip: ips[Math.floor(Math.random() * ips.length)],
      destination_ip: ips[Math.floor(Math.random() * ips.length)],
      port: `TCP/${Math.floor(Math.random() * 65535)}`,
      threat_type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      confidence_score: Math.floor(Math.random() * 20) + 80,
      severity: severities[Math.floor(Math.random() * severities.length)],
      is_anomaly: true,
      anomaly_score: Math.floor(Math.random() * 20) + 80,
      ml_model_used: 'RandomForest',
      raw_log: `${threatTypes[Math.floor(Math.random() * threatTypes.length)]} attack detected from ${ips[Math.floor(Math.random() * ips.length)]}`
    }))
  }

  private generateMockIncidents() {
    const titles = [
      'Suspicious Login Attempt',
      'DDoS Attack Detected',
      'Malware Infection',
      'Data Exfiltration Attempt',
      'Brute Force Attack',
      'SQL Injection Attempt',
      'Cross-Site Scripting',
      'Privilege Escalation'
    ]
    
    const descriptions = [
      'Multiple failed login attempts from unknown IP address',
      'Distributed denial of service attack targeting web servers',
      'Malicious software detected on endpoint devices',
      'Unauthorized data transfer to external servers',
      'Repeated password attempts from multiple sources',
      'SQL injection attempt on login form',
      'XSS payload detected in user input',
      'Unauthorized access to administrative functions'
    ]
    
    const statuses = ['open', 'in_progress', 'resolved', 'closed'] as const
    const severities = ['critical', 'high', 'medium', 'low'] as const
    const ips = ['192.168.1.100', '10.0.0.15', '172.16.0.42', '192.168.47.103']
    
    return Array.from({ length: 100 }, (_, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      const isCritical = severity === 'critical' || severity === 'high'
      const isBlocked = Math.random() < 0.4
      
      return {
        id: index + 1,
        title: titles[Math.floor(Math.random() * titles.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        status,
        severity,
        affected_ips: ips[Math.floor(Math.random() * ips.length)],
        attack_vector: isCritical ? 'Network-based' : 'Application-based',
        recommended_actions: isCritical ? 'Immediate isolation and investigation required' : 'Monitor and investigate',
        is_blocked: isBlocked,
        is_quarantined: isBlocked && Math.random() < 0.3,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    })
  }

  private searchInText(text: string, query: string): boolean {
    return text.toLowerCase().includes(query.toLowerCase())
  }

  private calculateScore(item: any, query: string): number {
    let score = 0
    const queryLower = query.toLowerCase()
    
    // Check title/name fields first (highest priority)
    if (item.title && this.searchInText(item.title, query)) score += 10
    if (item.threat_type && this.searchInText(item.threat_type, query)) score += 8
    if (item.raw_log && this.searchInText(item.raw_log, query)) score += 6
    
    // Check IP addresses
    if (item.source_ip && this.searchInText(item.source_ip, query)) score += 5
    if (item.destination_ip && this.searchInText(item.destination_ip, query)) score += 5
    
    // Check other fields
    if (item.description && this.searchInText(item.description, query)) score += 4
    if (item.protocol && this.searchInText(item.protocol, query)) score += 3
    if (item.severity && this.searchInText(item.severity, query)) score += 2
    if (item.status && this.searchInText(item.status, query)) score += 2
    
    return score
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    if (!query.trim()) return []
    
    console.log('🔍 Search service - Starting search for:', query)
    
    // Load data if not already loaded
    if (!this.dataLoaded) {
      console.log('📊 Loading search data...')
      await this.loadData()
      this.dataLoaded = true
      console.log('✅ Data loaded successfully')
    }
    
    const results: SearchResult[] = []
    
    // Search in logs
    if (!filters?.types || filters.types.includes('log')) {
      this.logsData.forEach((log) => {
        const score = this.calculateScore(log, query)
        if (score > 0) {
          results.push({
            id: `log-${log.id}`,
            type: 'log',
            title: `${log.protocol} Traffic`,
            description: log.raw_log || `Traffic from ${log.source_ip} to ${log.destination_ip}`,
            severity: log.severity,
            timestamp: log.timestamp,
            source_ip: log.source_ip,
            destination_ip: log.destination_ip,
            url: `/logs`,
            score
          })
        }
      })
    }
    
    // Search in attack logs
    if (!filters?.types || filters.types.includes('attack_log')) {
      this.attackLogsData.forEach((attackLog) => {
        const score = this.calculateScore(attackLog, query)
        if (score > 0) {
          results.push({
            id: `attack-${attackLog.id}`,
            type: 'attack_log',
            title: `${attackLog.threat_type} Attack`,
            description: attackLog.raw_log || `Attack from ${attackLog.source_ip}`,
            severity: attackLog.severity,
            timestamp: attackLog.timestamp,
            source_ip: attackLog.source_ip,
            destination_ip: attackLog.destination_ip,
            threat_type: attackLog.threat_type,
            url: `/logs`,
            score
          })
        }
      })
    }
    
    // Search in incidents
    if (!filters?.types || filters.types.includes('incident')) {
      this.incidentsData.forEach((incident) => {
        const score = this.calculateScore(incident, query)
        if (score > 0) {
          results.push({
            id: `incident-${incident.id}`,
            type: 'incident',
            title: incident.title,
            description: incident.description,
            severity: incident.severity,
            timestamp: incident.created_at,
            status: incident.status,
            url: `/incidents`,
            score
          })
        }
      })
    }
    
    // Sort by score (highest first) and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
  }
}

export const searchService = new SearchService() 