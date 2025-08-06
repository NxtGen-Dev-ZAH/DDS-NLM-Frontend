const fs = require('fs');

// Generate 150 rows of dummy data with normal and anomaly logs
const generateMockLogs = () => {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'FTP', 'DNS', 'SMTP']
  const ips = ['192.168.1.100', '10.0.0.15', '172.16.0.42', '192.168.47.103', '10.10.10.5', '203.0.113.1', '198.51.100.1', '203.0.113.2']
  const severities = ['info', 'warning', 'error', 'critical'] 
  
  return Array.from({ length: 150 }, (_, index) => {
    const isAnomaly = Math.random() < 0.3 // 30% chance of anomaly
    const severity = isAnomaly ? 
      (Math.random() < 0.7 ? 'error' : 'critical') : 
      (Math.random() < 0.6 ? 'info' : 'warning')
    
    return {
      id: index + 1,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      source_ip: ips[Math.floor(Math.random() * ips.length)],
      destination_ip: ips[Math.floor(Math.random() * ips.length)],
      source_port: Math.floor(Math.random() * 65535) + 1,
      destination_port: Math.floor(Math.random() * 65535) + 1,
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      packet_size: Math.floor(Math.random() * 10000) + 64,
      severity,
      is_anomaly: isAnomaly,
      anomaly_score: isAnomaly ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30),
      ml_model_used: isAnomaly ? 'RandomForest' : null,
      raw_log: `Sample log entry ${index + 1}`
    }
  })
}

const logsData = {
  data: generateMockLogs(),
  total: 150,
  page: 1,
  limit: 20,
  hasMore: true
}

fs.writeFileSync('logs-data.json', JSON.stringify(logsData, null, 2));
console.log('Generated logs-data.json with 150 logs'); 
