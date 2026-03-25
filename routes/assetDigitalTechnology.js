import express from 'express';
import { tokenCheck } from '../services/tokenCheck';
import { createAsset } from '../controllers/assetDigitalTechnology';
const router = express.Router();

router.post('/', tokenCheck, createAsset);
router.get('/', tokenCheck, readAsset);
router.put('/', tokenCheck, updateAsset);
router.delete('/', tokenCheck, deleteAsset);

router.post('/borrow', tokenCheck, createBorrowingRecord);
router.get('/borrow', tokenCheck, readBorrowingRecord);
router.put('/borrow', tokenCheck, updateBorrowingRecord);
router.delete('/borrow', tokenCheck, deleteBorrowingRecord);

export default router;