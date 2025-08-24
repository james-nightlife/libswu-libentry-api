import express from 'express';
const router = express.Router();

import { citizenIDCheck } from '../controllers/citizen-id-check.js';

router.post('/', citizenIDCheck);

export default router;
