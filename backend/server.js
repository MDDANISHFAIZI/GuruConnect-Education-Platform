import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route Imports
import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teachers.js';
import studentRoutes from './routes/students.js';
import classRoutes from './routes/classes.js';
import adminRoutes from './routes/admin.js';
import requestRoutes from './routes/joinRequests.js';
import enrollmentRoutes from './routes/enrollments.js';
import connectionRoutes from './routes/connections.js';
import classroomRoutes from './routes/classroom.js';

// Load variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Serve static profile uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Standard Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API Routers
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/classroom', classroomRoutes);

// Home route checker
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'GuruConnect Hyperlocal Teacher Discovery API',
    version: '1.0.0',
    time: new Date()
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    message: {
      en: 'Endpoint resource not found',
      hi: 'अनुरोधित एंडपॉइंट संसाधन नहीं मिला'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: {
      en: 'Something went wrong inside the server!',
      hi: 'सर्वर के अंदर कुछ गलत हो गया!'
    },
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`GuruConnect Server running in dev mode on port ${PORT}`);
});
