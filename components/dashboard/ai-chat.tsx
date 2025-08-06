'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  MessageSquare,
  Lightbulb,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { agentsApi, handleApiError } from '@/lib/api'
import { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface AiChatProps {
  className?: string
}

export function AiChat({ className }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! I\'m your cybersecurity AI assistant. I can help you analyze threats, understand security incidents, and provide guidance on best practices. How can I assist you today?',
      sender: 'agent',
      timestamp: new Date().toISOString(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: input.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await agentsApi.chat(userMessage.message)
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response.data.response || 'I apologize, but I encountered an issue processing your request.',
        sender: 'agent',
        timestamp: new Date().toISOString(),
        context: {
          suggestions: response.data.suggestions || [],
          quick_actions: response.data.quick_actions || [],
          confidence: response.data.confidence || 0,
        }
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (err) {
      setError(handleApiError(err))
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'I\'m sorry, but I\'m having trouble connecting to my services right now. Please try again in a moment.',
        sender: 'agent',
        timestamp: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendQuickMessage = (message: string) => {
    setInput(message)
    setTimeout(() => sendMessage(), 100)
  }

  const quickQuestions = [
    "What are the current security threats?",
    "Explain the latest incident",
    "How to improve network security?",
    "Show me anomaly detection status"
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <CardTitle>AI Security Assistant</CardTitle>
          <Badge variant="outline" className="text-blue-600">
            Online
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="h-80 w-full rounded-md border p-4 chat-scrollbar">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === 'agent' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.message}</div>
                  
                  {/* AI Response Context */}
                  {message.sender === 'agent' && message.context && (
                    <div className="mt-3 space-y-2">
                      {message.context.suggestions && message.context.suggestions.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-2 text-xs font-medium text-muted-foreground">
                            <Lightbulb className="h-3 w-3" />
                            Suggestions:
                          </div>
                          <div className="space-y-1">
                            {message.context.suggestions.map((suggestion: string, index: number) => (
                              <button
                                key={index}
                                onClick={() => sendQuickMessage(suggestion)}
                                className="block w-full text-left text-xs p-2 rounded bg-accent hover:bg-accent/80 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.context.quick_actions && message.context.quick_actions.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-2 text-xs font-medium text-muted-foreground">
                            <Shield className="h-3 w-3" />
                            Quick Actions:
                          </div>
                          <div className="space-y-1">
                            {message.context.quick_actions.map((action: any, index: number) => (
                              <div
                                key={index}
                                className={cn(
                                  "text-xs p-2 rounded border",
                                  action.type === 'warning' && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20",
                                  action.type === 'action' && "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20",
                                  action.type === 'info' && "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20"
                                )}
                              >
                                <div className="font-medium">{action.title}</div>
                                <div className="text-muted-foreground">{action.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.context.confidence && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Confidence:</span>
                          <div className="flex-1 bg-muted rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all"
                              style={{ width: `${message.context.confidence * 100}%` }}
                            />
                          </div>
                          <span>{Math.round(message.context.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Questions */}
        <div>
          <div className="flex items-center gap-1 mb-2 text-xs font-medium text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            Quick Questions:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => sendQuickMessage(question)}
                className="text-left text-xs p-2 rounded border hover:bg-accent transition-colors"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about security threats, incidents, or best practices..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 