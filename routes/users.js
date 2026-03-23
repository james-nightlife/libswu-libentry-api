import express from 'express';
const router = express.Router();

import { getUsers, getMyInfo } from '../controllers/users.js';

router.post('/', getUsers);
router.post('/me', getMyInfo);

export default router;