import express from 'express';
const router = express.Router();

import { authenticateUser, authCheck } from '../controllers/auth.js';
import { tokenCheck } from '../services/tokenCheck.js';

router.post('/', authenticateUser)
router.post('/test', tokenCheck, authCheck)

export default router;