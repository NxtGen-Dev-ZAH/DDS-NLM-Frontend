const fs = require('fs');

// Generate attack logs data
const generateAttackLogsData = () => {
  const threatTypes = [
    'DDoS', 'SSH Brute Force', 'DoS', 'Exploit', 'SQL Injection', 
    'XSS', 'Ransomware', 'Phishing', 'DNS Amplification', 'Port Scan',
    'Credential Stuffing', 'Man-in-the-Middle', 'Zero-Day Exploit', 'APT',
    'Buffer Overflow', 'Cross-Site Request Forgery', 'Directory Traversal',
    'Command Injection', 'File Upload Attack', 'Session Hijacking'
  ];
  
  const ports = [
    'TCP/443', 'TCP/22', 'TCP/80', 'TCP/3389', 'TCP/21', 'TCP/25', 
    'UDP/53', 'TCP/8080', 'TCP/3306', 'TCP/5432', 'TCP/1433', 'TCP/1521',
    'TCP/5900', 'TCP/5901', 'TCP/5902', 'TCP/5903', 'TCP/5904', 'TCP/5905'
  ];
  
  const ips = [
    '192.168.47.103', '10.0.0.15', '172.16.0.42', '192.168.1.100', 
    '10.10.10.5', '203.0.113.1', '198.51.100.1', '203.0.113.2',
    '185.220.101.45', '91.121.14.22', '45.95.147.12', '78.128.113.8',
    '185.220.101.46', '91.121.14.23', '45.95.147.13', '78.128.113.9',
    '185.220.101.47', '91.121.14.24', '45.95.147.14', '78.128.113.10'
  ];
  
  const severities = ['critical', 'error', 'warning', 'info'];
  
  const logs = [];
  
  // Generate 200 attack logs
  for (let i = 1; i <= 200; i++) {
    const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const port = ports[Math.floor(Math.random() * ports.length)];
    const sourceIp = ips[Math.floor(Math.random() * ips.length)];
    const destIp = ips[Math.floor(Math.random() * ips.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    // Higher confidence for critical threats
    const baseConfidence = severity === 'critical' ? 85 : severity === 'error' ? 75 : 65;
    const confidenceScore = Math.floor(Math.random() * 20) + baseConfidence;
    
    // Generate timestamp within last 48 hours for more variety
    const timestamp = new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString();
    
    logs.push({
      id: i,
      timestamp: timestamp,
      source_ip: sourceIp,
      destination_ip: destIp,
      port: port,
      threat_type: threatType,
      confidence_score: Math.min(confidenceScore, 99),
      severity: severity,
      is_anomaly: true,
      anomaly_score: Math.floor(Math.random() * 30) + 70,
      ml_model_used: 'RandomForest',
      raw_log: `${threatType} attack detected from ${sourceIp} to ${destIp} on ${port}`
    });
  }
  
  return { data: logs };
};

// Generate and save the data
const attackLogsData = generateAttackLogsData();

// Save to public directory for web access
fs.writeFileSync('public/attack-logs-data.json', JSON.stringify(attackLogsData, null, 2));

console.log('Attack logs data generated successfully!');
console.log(`Generated ${attackLogsData.data.length} attack logs`); 