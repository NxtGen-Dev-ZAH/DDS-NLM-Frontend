import { Log, Incident, Alert } from '@/types'

export type WebSocketMessage = {
  type: 'log' | 'incident' | 'alert' | 'system' | 'agent_response'
  data: any
  timestamp: string
}

export type WebSocketListener = (message: WebSocketMessage) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private listeners: Set<WebSocketListener> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'))
        return
      }

      this.isConnecting = true

      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          
          // Start heartbeat to keep connection alive
          this.startHeartbeat()
          
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.notifyListeners(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.isConnecting = false
          this.ws = null
          
          // Stop heartbeat
          this.stopHeartbeat()

          // Attempt to reconnect if not a manual close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          // Log the error in a more structured way
          console.error('WebSocket error:', {
            message: error.message || 'Unknown WebSocket error',
            type: error.type,
            timeStamp: error.timeStamp
          })
          this.isConnecting = false
          
          // Don't reject here - let onclose handle reconnection
          // Only reject if connection completely fails
          if (this.ws?.readyState !== WebSocket.CONNECTING) {
            reject(new Error('WebSocket connection failed'))
          }
        }
      } catch (error) {
        this.isConnecting = false
        reject(error instanceof Error ? error : new Error('Unknown connection error'))
      }
    })
  }

  disconnect(): void {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }
  }
  
  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Send ping message
        this.ws.send(JSON.stringify({ type: 'ping' }))
      } else {
        this.stopHeartbeat()
      }
    }, 30000) // Every 30 seconds
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', {
          message: error.message || 'Unknown reconnection error',
          attempt: this.reconnectAttempts,
          maxAttempts: this.maxReconnectAttempts
        })
      })
    }, delay)
  }

  private notifyListeners(message: WebSocketMessage): void {
    this.listeners.forEach(listener => {
      try {
        listener(message)
      } catch (error) {
        console.error('Error in WebSocket listener:', error)
      }
    })
  }

  addListener(listener: WebSocketListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message)
      // Try to reconnect if not already connecting
      if (!this.isConnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connect().catch(() => {
          // Error already logged in connect method
        })
      }
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }
}

// Create singleton instance
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
export const wsClient = new WebSocketClient(wsUrl)

// React hook for using WebSocket
import { useEffect, useRef, useState } from 'react'

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const connect = async () => {
      try {
        await wsClient.connect()
        setIsConnected(true)
        setConnectionError(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Connection failed'
        setConnectionError(errorMessage)
        setIsConnected(false)
        
        // Schedule a reconnect if needed
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null
            if (!wsClient.isConnected) {
              connect()
            }
          }, 5000) // Try again in 5 seconds
        }
      }
    }

    const listener: WebSocketListener = (message) => {
      setLastMessage(message)
    }

    const removeListener = wsClient.addListener(listener)

    // Check if already connected, otherwise connect
    if (wsClient.isConnected) {
      setIsConnected(true)
    } else {
      connect()
    }

    return () => {
      removeListener()
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
    }
  }, [])

  return {
    isConnected,
    lastMessage,
    connectionError,
    send: wsClient.send.bind(wsClient),
  }
}

// Hook for specific message types
export function useWebSocketMessages<T = any>(messageType: string) {
  const [messages, setMessages] = useState<T[]>([])
  const { lastMessage } = useWebSocket()

  useEffect(() => {
    if (lastMessage && lastMessage.type === messageType) {
      setMessages(prev => [lastMessage.data as T, ...prev.slice(0, 99)]) // Keep last 100 messages
    }
  }, [lastMessage, messageType])

  return messages
}

// Specific hooks for different data types
export function useRealtimeLogs() {
  return useWebSocketMessages<Log>('log')
}

export function useRealtimeIncidents() {
  return useWebSocketMessages<Incident>('incident')
}

export function useRealtimeAlerts() {
  return useWebSocketMessages<Alert>('alert')
} 