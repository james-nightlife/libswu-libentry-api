import express from 'express';
const router = express.Router();

import { addVisitor } from '../controllers/visitors.js';

router.post('/', addVisitor);

export default router;