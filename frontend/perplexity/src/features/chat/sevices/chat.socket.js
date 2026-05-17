import { io } from "socket.io-client";

let socketInstance;

export const initializeSocketConnection = () => {
  // Avoid creating multiple sockets (which can trigger resource errors)
  if (socketInstance && socketInstance.connected) return socketInstance;
  if (socketInstance) return socketInstance;

  socketInstance = io("http://localhost:3000", {
    withCredentials: true,
    transports: ["websocket"],
  });

  socketInstance.on("connect", () => {
    console.log("Connected to socket server with id: " + socketInstance.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.warn("Socket connect_error:", err?.message || err);
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

