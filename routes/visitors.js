import express from 'express';
const router = express.Router();

import { addVisitor, getVisitors } from '../controllers/visitors.js';
import { tokenCheck } from '../services/tokenCheck.js';

router.post('/', addVisitor);
router.post('/get', tokenCheck, getVisitors);

export default router;