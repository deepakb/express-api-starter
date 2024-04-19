// index.ts (or wherever you want to start your server)
import { createServer, startServer } from './server';
import { CONFIG } from './config';

// Create the Express app
const app = createServer();

// Start the server
const PORT = CONFIG.PORT || 3000;
startServer(app, PORT);
