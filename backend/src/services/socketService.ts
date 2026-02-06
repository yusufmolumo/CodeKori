import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/prisma';

export class SocketService {
    private io: Server;

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || "*",
                methods: ["GET", "POST"]
            }
        });

        this.initialize();
    }

    private initialize() {
        this.io.use(async (socket: Socket, next: (err?: ExtendedError) => void) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) return next(new Error('Authentication error'));

                const decoded = verifyToken(token, process.env.JWT_SECRET!);
                socket.data.userId = decoded.userId;

                // Optional: Update status to online
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket: Socket) => {
            console.log(`User connected: ${socket.data.userId}`);

            // Join user-specific room
            socket.join(socket.data.userId);

            socket.on('join_room', (roomId: string) => {
                socket.join(roomId);
            });

            socket.on('send_message', async (data: any) => {
                // Here we would persist to DB
                // const { recipientId, content } = data;
                // await prisma.message.create(...)

                // For MVP: Emit to room/user
                this.io.to(data.roomId).emit('receive_message', {
                    ...data,
                    senderId: socket.data.userId,
                    timestamp: new Date()
                });
            });

            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }

    public getIO() {
        return this.io;
    }
}
