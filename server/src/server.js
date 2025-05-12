import express from "express";
import configRoutes from './routes/index.js';
import cors from 'cors';
import { verifyFirebaseToken } from './middleware/authMiddleware.js';
import scheduleJobs from './scheduler/home_page_jobs.js';
import redis from './config/redis.js';
import * as publicDataFunctions from './data/publicDataFunctions.js';

// create a server
const app = express();
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173', }));

if (!redis.isReady) {
    await redis.connect();
}

console.log('Scheduling jobs');
scheduleJobs();

app.get('/api/public/static-swiping-songs', async (req, res) => {
  try {
    const songs = await publicDataFunctions.getStaticSwipingSongs();
    if (songs.length === 0) {
      res.status(404).json({ message: 'No songs found' });
    } else {
      res.status(200).json(songs);
    }
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Internal server error' });
  }
});


//middleware to check the validation of the jwt token 
app.use(verifyFirebaseToken);
// mounts the routes
configRoutes(app);

// server is running on port 3000
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

export default app;