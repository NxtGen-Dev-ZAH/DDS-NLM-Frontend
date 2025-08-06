"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useWebSocket } from "@/lib/websocket";
import { Button } from "@/components/ui/button";

export function WebSocketTest() {
  const { isConnected, lastMessage, connectionError, send } = useWebSocket();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (lastMessage) {
      setMessages((prev) => [lastMessage, ...prev.slice(0, 9)]); // Keep last 10 messages
    }
  }, [lastMessage]);

  const sendTestMessage = () => {
    send({
      type: "test",
      data: {
        message: "Hello from frontend!",
        timestamp: new Date().toISOString(),
      },
    });
  };

  return (
    <Card className="p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4">WebSocket Connection Test</h3>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            Error: {connectionError}
          </div>
        )}

        {/* Test Button */}
        <Button onClick={sendTestMessage} disabled={!isConnected} size="sm">
          Send Test Message
        </Button>

        {/* Messages */}
        <div className="max-h-40 overflow-y-auto border rounded p-2">
          <div className="text-sm font-medium mb-2">Recent Messages:</div>
          {messages.length === 0 ? (
            <div className="text-xs text-gray-500">No messages yet...</div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, index) => (
                <div key={index} className="text-xs bg-gray-50 p-1 rounded">
                  <div className="font-medium">{msg.type}</div>
                  <div className="text-gray-600">{msg.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
