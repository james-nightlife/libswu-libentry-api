import express from 'express';
import path from 'path';
const __dirname = path.resolve();
const router = express.Router();

import { addVisitor, getVisitors, signInVisitor, addVisitorNew, getVisitorById, editVisitor, getVisitorsNew } from '../controllers/visitors.js';
import { tokenCheck } from '../services/tokenCheck.js';
import upload from '../services/uploadFile.js';

router.post('/', addVisitor);
router.post('/get', tokenCheck, getVisitors);
router.get('/', tokenCheck, getVisitorsNew); // เรียกดูข้อมูลผู้ใช้บริการบุคคลภายนอก จากตาราง visitors ฐานข้อมูล libswu_visitor ระบบฐานข้อมูล MySQL
router.get('/:id', tokenCheck, getVisitorById); // เรียกดูข้อมูลผู้ใช้บริการบุคคลภายนอกรายบุคคล ค้นจากคอลัมน์ id จากตาราง visitors ฐานข้อมูล libswu_visitor ระบบฐานข้อมูล MySQL
router.post('/new', upload.single('file'), addVisitorNew); // สร้างข้อมูลผู้ใช้บริการบุคคลภายนอก สร้างแถวในตาราง visitors ฐานข้อมูล libswu_visitor ระบบฐานข้อมูล MySQL โดยมีคอลัมน์ visitor_id visitor_type visitor_area phone_number firstname lastname filename
router.post('/auth', signInVisitor); // ลงชื่อเข้าใช้งานด้วยเลขประจำตัวประชาชน/เลขที่หนังสือเดินทาง และหมายเลขโทรศัพท์มือถือ
router.put('/:id', tokenCheck, editVisitor); // แก้ไขข้อมูลผู้ใช้บริการบุคคลภายนอก ค้นจากคอลัมน์ id จากตาราง visitors ฐานข้อมูล libswu_visitor ระบบฐานข้อมูล MySQL แก้ไขคอลัมน์ visitor_id visitor_type visitor_area phone_number firstname lastname filename status update_date
router.get('/upload/:filename', (req, res) => {
    const { filename } = req.params;
    res.sendFile(path.join(__dirname, 'upload', filename));
})
/* router.get('/upload/:filename', tokenCheck, (req, res) => {
    const { filename } = req.params;
    res.sendFile(path.join(__dirname, 'upload', filename));
}) */

export default router;