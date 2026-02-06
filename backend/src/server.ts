import app from './app';
import dotenv from 'dotenv';

dotenv.config();

import { createServer } from 'http';
import { SocketService } from './services/socketService';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const socketService = new SocketService(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

