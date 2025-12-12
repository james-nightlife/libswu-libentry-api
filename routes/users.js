import express from 'express';
const router = express.Router();

import { getUsers } from '../controllers/users.js';

router.post('/', getUsers);

export default router;