import express from 'express';
const router = express.Router();

import { avService } from '../controllers/avservice.js';

router.get('/', avService);

export default router;
