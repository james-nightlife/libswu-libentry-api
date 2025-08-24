import express from 'express';
const router = express.Router();

import { getStudent } from '../controllers/get-student.js';

router.post('/', getStudent);

export default router;
