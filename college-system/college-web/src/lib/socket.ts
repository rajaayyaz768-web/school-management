import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = (userId: string, accessToken: string) => {
  // Disconnect any existing socket before creating a new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000', {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: { token: accessToken },
  });

  socket.on('connect', () => {
    socket!.emit('join_room', userId);
  });

  return socket;
}

export const getSocket = (): Socket | null => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

