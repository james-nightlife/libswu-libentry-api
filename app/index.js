
import express from 'express';
import cors from 'cors';
import getStudent from '../routes/get-student.js';
import avService from '../routes/avservice.js';
import gate from '../routes/gate.js';
import auth from '../routes/auth.js';
import users from '../routes/users.js';
import visitors from '../routes/visitors.js';
import passportIdCheck from '../routes/passport-id-check.js';
import citizenIdCheck from '../routes/citizen-id-check.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

app.use((req, res, next) => {
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} ${req.url} ${req.ip}`);
    next();
})

// Deploying routes
app.use('/citizen-id-check', citizenIdCheck);
app.use('/passport-id-check', passportIdCheck);
app.use('/get-student', getStudent);
app.use('/avservice', avService);


// New routes
app.use('/auth', auth);
app.use('/users', users);
app.use('/visitors', visitors);

app.use('/gate', gate);

app.use((req, res) => {
    return res.status(404).json({
        message: 'Endpoint not found'
    });
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    return res.status(statusCode).json({
      message,
      // Avoid leaking stack traces in production environments
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
});

export { app };