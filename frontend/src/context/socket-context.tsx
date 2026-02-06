"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to backend
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
            auth: {
                token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
            },
            autoConnect: false // We connect manually
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log("Socket connected");
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log("Socket disconnected");
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        // Connect only if we have a token
        if (socket && !isConnected) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                socket.auth = { token };
                socket.connect();
            }
        }
    }, [socket]); // Simplified logic for reconnecting

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    return context || { socket: null, isConnected: false };
};
