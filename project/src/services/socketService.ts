import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId: string) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: localStorage.getItem('token'),
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.socket?.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinCourse(courseId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_course', courseId);
    }
  }

  leaveCourse(courseId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_course', courseId);
    }
  }

  sendMessage(courseId: string, message: string, userId: string, userName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        courseId,
        message,
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
    }
  }

  onNewMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onNewAnnouncement(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_announcement', callback);
    }
  }

  onGradeUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('grade_update', callback);
    }
  }

  onAssignmentUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('assignment_update', callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStopTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
    }
  }

  emitTyping(courseId: string, userId: string, userName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { courseId, userId, userName });
    }
  }

  emitStopTyping(courseId: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop_typing', { courseId, userId });
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

export const socketService = new SocketService();