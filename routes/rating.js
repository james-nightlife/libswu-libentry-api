import express from 'express';
const router = express.Router();
import { tokenCheck } from '../services/tokenCheck.js';
import { ratingVisitor } from '../controllers/rating.js';

router.post('/visitor', tokenCheck, ratingVisitor);

export default router;