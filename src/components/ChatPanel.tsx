import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Typography, Divider, Card } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// Chat message interface
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Props interface
interface ChatPanelProps {
  chatHistory: ChatMessage[];
  isProcessing: boolean;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  chatHistory,
  isProcessing,
  onSendMessage,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<any>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle sending message
  const handleSend = () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isProcessing || disabled) return;

    onSendMessage(trimmedMessage);
    setInputValue('');
  };

  // Handle Enter key (Shift+Enter for new line, Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#fafafa'
    }}>
      {/* Chat Header */}
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: '1px solid #e8e8e8',
        background: 'white'
      }}>
        <Text strong style={{ fontSize: 16 }}>
          💬 Refine Your Outline
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Chat with AI to improve your script outline
        </Text>
      </div>

      {/* Messages Container */}
      <div style={{ 
        flex: 1, 
        padding: '16px', 
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 200px)'
      }}>
        {chatHistory.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#999', 
            marginTop: 40,
            padding: 20
          }}>
            <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Paragraph type="secondary">
              Start chatting to refine your outline!<br />
              Try: "Make it more dramatic" or "Add a subplot"
            </Paragraph>
          </div>
        ) : (
          chatHistory.map((message) => (
            <div key={message.id} style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {message.type === 'assistant' && (
                  <Avatar 
                    icon={<RobotOutlined />} 
                    style={{ 
                      backgroundColor: '#1890ff', 
                      marginRight: 8,
                      flexShrink: 0
                    }} 
                  />
                )}
                
                <Card
                  size="small"
                  style={{
                    maxWidth: '70%',
                    backgroundColor: message.type === 'user' ? '#1890ff' : 'white',
                    color: message.type === 'user' ? 'white' : 'inherit',
                    border: message.type === 'user' ? 'none' : '1px solid #e8e8e8',
                    marginLeft: message.type === 'user' ? 8 : 0,
                    marginRight: message.type === 'assistant' ? 8 : 0
                  }}
                  bodyStyle={{ padding: '8px 12px' }}
                >
                  {message.type === 'system' ? (
                    <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                      {message.content}
                    </Text>
                  ) : (
                    <Text style={{ 
                      color: message.type === 'user' ? 'white' : 'inherit',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {message.content}
                    </Text>
                  )}
                  <div style={{ 
                    fontSize: 10, 
                    opacity: 0.7, 
                    marginTop: 4,
                    textAlign: 'right'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </Card>

                {message.type === 'user' && (
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: '#52c41a',
                      marginLeft: 8,
                      flexShrink: 0
                    }} 
                  />
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isProcessing && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Avatar 
              icon={<RobotOutlined />} 
              style={{ 
                backgroundColor: '#1890ff', 
                marginRight: 8
              }} 
            />
            <Card
              size="small"
              style={{ backgroundColor: 'white', border: '1px solid #e8e8e8' }}
              bodyStyle={{ padding: '8px 12px' }}
            >
              <Text type="secondary" style={{ fontStyle: 'italic' }}>
                AI is thinking and updating your outline...
              </Text>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Input Area */}
      <div style={{ 
        padding: '16px 20px', 
        background: 'white',
        borderTop: '1px solid #e8e8e8'
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <TextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask for changes to your outline... (Enter to send, Shift+Enter for new line)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={disabled || isProcessing}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing || disabled}
            loading={isProcessing}
            style={{ height: 'auto', minHeight: 32 }}
          >
            Send
          </Button>
        </div>
        
        <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
          💡 Try: "Make it more dramatic", "Add characters", "Change the setting"
        </Text>
      </div>
    </div>
  );
};

export default ChatPanel;
export type { ChatPanelProps }; 