import express from 'express';
const router = express.Router();

import { getUsers, getMyInfo } from '../controllers/users.js';
import { tokenCheck } from '../services/tokenCheck.js';


router.get('/', tokenCheck, getUsers);
router.get('/:buasri_id', tokenCheck, getUsers);
router.get('/me', tokenCheck, getMyInfo);

export default router;