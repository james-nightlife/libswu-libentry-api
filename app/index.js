
import express from 'express';
import cors from 'cors';
import getStudent from '../routes/get-student.js';
import avService from '../routes/avservice.js';
import gate from '../routes/gate.js';
import auth from '../routes/auth.js';
import users from '../routes/users.js';
import visitors from '../routes/visitors.js';
//import passportIdCheck from '../routes/passport-id-check.js';
//import citizenIdCheck from '../routes/citizen-id-check.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** 
app.use('/citizen-id-check', citizenIdCheck);
app.use('/passport-id-check', passportIdCheck);
*/

app.use('/get-student', getStudent);
app.use('/avservice', avService);
app.use('/gate', gate);
app.use('/auth', auth);
app.use('/users', users);
app.use('/visitors', visitors);

app.use((req, res) => {
    res.status(404).json({
        status: 'Error',
        message: 'Endpoint not found'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'Error',
        message: err.message || 'Internal Server Error'
    });
});

export { app };