import { createServer, startServer } from './server';
import { CONFIG } from './config';

const PORT = CONFIG.PORT || 3000;
const app = createServer();
startServer(app, PORT);
