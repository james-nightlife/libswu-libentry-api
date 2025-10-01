
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

import getStudent from '../routes/get-student.js';
app.use('/get-student', getStudent);

import citizenIdCheck from '../routes/citizen-id-check.js';
app.use('/citizen-id-check', citizenIdCheck);

import passportIdCheck from '../routes/passport-id-check.js';
app.use('/passport-id-check', passportIdCheck);

import avService from '../routes/avservice.js';
app.use('/avservice', avService);



export { app };