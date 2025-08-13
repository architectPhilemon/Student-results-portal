import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Users,
  User,
  Circle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { formatRelativeTime } from '../lib/utils';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    type: 'direct',
    name: 'Dr. Michael Johnson',
    avatar: null,
    lastMessage: 'Great work on your assignment! Keep it up.',
    lastMessageTime: '2024-02-20T14:30:00Z',
    unreadCount: 0,
    isOnline: true,
    role: 'instructor'
  },
  {
    id: '2',
    type: 'direct',
    name: 'Emma Williams',
    avatar: null,
    lastMessage: 'Hey, do you want to study together for the quiz?',
    lastMessageTime: '2024-02-20T12:15:00Z',
    unreadCount: 2,
    isOnline: true,
    role: 'student'
  },
  {
    id: '3',
    type: 'group',
    name: 'CS101 Study Group',
    avatar: null,
    lastMessage: 'Alex: The assignment is due tomorrow, right?',
    lastMessageTime: '2024-02-20T10:45:00Z',
    unreadCount: 5,
    isOnline: false,
    memberCount: 8
  },
  {
    id: '4',
    type: 'direct',
    name: 'Prof. Emily Davis',
    avatar: null,
    lastMessage: 'Office hours are moved to 3 PM today.',
    lastMessageTime: '2024-02-19T16:20:00Z',
    unreadCount: 0,
    isOnline: false,
    role: 'instructor'
  }
];

// Mock messages for selected conversation
const mockMessages = [
  {
    id: '1',
    senderId: 'inst1',
    senderName: 'Dr. Michael Johnson',
    content: 'Hi John! I wanted to discuss your recent assignment submission.',
    timestamp: '2024-02-20T14:00:00Z',
    isOwn: false,
    status: 'read'
  },
  {
    id: '2',
    senderId: 'student1',
    senderName: 'John Smith',
    content: 'Hello Dr. Johnson! Thank you for reaching out. I\'d be happy to discuss it.',
    timestamp: '2024-02-20T14:05:00Z',
    isOwn: true,
    status: 'read'
  },
  {
    id: '3',
    senderId: 'inst1',
    senderName: 'Dr. Michael Johnson',
    content: 'Your code structure was excellent, and I particularly liked your approach to the sorting algorithm. However, there are a few areas where you could improve the efficiency.',
    timestamp: '2024-02-20T14:10:00Z',
    isOwn: false,
    status: 'read'
  },
  {
    id: '4',
    senderId: 'student1',
    senderName: 'John Smith',
    content: 'I appreciate the feedback! Could you point out specific areas where I can optimize the code?',
    timestamp: '2024-02-20T14:15:00Z',
    isOwn: true,
    status: 'read'
  },
  {
    id: '5',
    senderId: 'inst1',
    senderName: 'Dr. Michael Johnson',
    content: 'Great work on your assignment! Keep it up.',
    timestamp: '2024-02-20T14:30:00Z',
    isOwn: false,
    status: 'delivered'
  }
];

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = mockConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        senderId: user?._id || 'current-user',
        senderName: `${user?.firstName} ${user?.lastName}`,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isOwn: true,
        status: 'sending' as const
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate message delivery
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Circle className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          <Input
            placeholder="Search conversations..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation.id === conversation.id ? 'bg-indigo-50 border-indigo-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {conversation.type === 'group' ? (
                      <Users className="h-5 w-5 text-gray-600" />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  {conversation.type === 'direct' && conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  {conversation.type === 'group' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {conversation.memberCount} members
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {selectedConversation.type === 'group' ? (
                    <Users className="h-5 w-5 text-gray-600" />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                {selectedConversation.type === 'direct' && selectedConversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedConversation.type === 'direct' 
                    ? selectedConversation.isOnline ? 'Online' : 'Offline'
                    : `${selectedConversation.memberCount} members`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                {!message.isOwn && (
                  <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                )}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.isOwn
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className={`flex items-center mt-1 space-x-1 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                  {message.isOwn && getStatusIcon(message.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
            </div>
            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};