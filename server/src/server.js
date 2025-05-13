import express from "express";
import configRoutes from './routes/index.js';
import cors from 'cors';
import { verifyFirebaseToken } from './middleware/authMiddleware.js';
import scheduleJobs from './scheduler/home_page_jobs.js';
import redis from './config/redis.js';
import * as publicDataFunctions from './data/publicDataFunctions.js';
import http from 'http';
import { Server } from 'socket.io';

export {io};

// create a server
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH",]
  }
});


// mount io
app.set('io', io);

// CORS for frontend on port 5173
app.use(cors({ origin: "http://localhost:5173" }));

// Parse incoming JSON requests
app.use(express.json());

// Static folder for public access to profile photos
//app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

if (!redis.isReady) {
    await redis.connect();
}

//console.log('Scheduling jobs');
//scheduleJobs();

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

// Routes
//app.use("/api/users", profilePhotoRoutes);
configRoutes(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route Not Found!" });
});



io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start server
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export default app;
