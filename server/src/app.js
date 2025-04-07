// THIS FILE IS JUST FOR TESTING 
// src/app.js
import express from 'express';
import setupRoutes from './routes/index.js';

const app = express();
app.use(express.json());
setupRoutes(app);

export default app;






