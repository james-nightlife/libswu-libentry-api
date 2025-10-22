import express from 'express';
const router = express.Router();

import { authenticateUser, authCheck } from '../controllers/auth.js';

router.post('/', authenticateUser)

router.post('/test', authCheck)

export default router;

