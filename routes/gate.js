import express from 'express';
const router = express.Router();

import { getGateUser } from '../controllers/gate.js';

router.get('/', getGateUser);

export default router;
