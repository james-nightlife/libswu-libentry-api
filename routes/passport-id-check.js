import express from 'express';
const router = express.Router();

import { passportIDCheck } from '../controllers/passport-id-check.js';

router.post('/', passportIDCheck)

export default router;



