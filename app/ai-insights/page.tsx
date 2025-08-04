'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Bot, 
  User, 
  Brain,
  AlertTriangle,
  Shield,
  Activity,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  ArrowUp
} from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function AIInsightsPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI security assistant. I can help you analyze logs, detect anomalies, and provide insights about your network security. How can I help you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I understand your query. This is a placeholder response. In a real implementation, this would be connected to an AI service that can analyze your security logs and provide intelligent insights.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm rounded-xl h-[88vh] flex flex-col">
        <CardHeader className="pb-2 px-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Brain className="h-4 w-4" />
            AI Security Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="py-0 px-3 flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} px-4`}
                  >
                    <div className={`flex items-start gap-4 max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start px-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="border-t flex-shrink-0">
            <div className="px-4 pt-4 pb-2">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message AI Security Assistant..."
                    className="pr-12 resize-none rounded-full border-0 focus:ring-0 focus:ring-offset-0 transition-all duration-200"
                    style={{ 
                      backgroundColor: '#0f0f0f',
                      color: '#ffffff',
                      fontSize: '16px',
                      padding: '14px 18px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      minHeight: '48px'
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 bg-white hover:bg-gray-100 border-none shadow-sm"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-1 text-xs text-muted-foreground text-center">
                  AI Security Assistant can make mistakes. Consider checking important information.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 