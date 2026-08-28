import express from 'express';
const router = express.Router();

import { addVisitor, getVisitors } from '../controllers/visitors.js';
import { tokenCheck } from '../services/tokenCheck.js';

router.post('/', addVisitor);
router.post('/get', tokenCheck, getVisitors);
//router.get('/:id') // เรียกดูข้อมูลผู้ใช้บริการบุคคลภายนอกรายบุคคล ค้นจากคอลัมน์ id จากตาราง visitors ฐานข้อมูล libswu_visitor ระบบฐานข้อมูล MySQL
//router.get('/') // เรียกดูข้อมูลผู้ใช้บริการบุคคลภายนอก จากตาราง visitors ฐานข้อมูล libswu_visitor ระบบฐานข้อมูล MySQL
//router.post('/') // สร้างข้อมูลผู้ใช้บริการบุคคลภายนอก สร้างแถวในตาราง visitors ฐานข้อมูล libswu_visitor ระบบฐานข้อมูล MySQL โดยมีคอลัมน์ visitor_id visitor_type visitor_area phone_number firstname lastname filename
//router.put('/') // แก้ไขข้อมูลผู้ใช้บริการบุคคลภายนอก ค้นจากคอลัมน์ id จากตาราง visitors ฐานข้อมูล libswu_visitor ระบบฐานข้อมูล MySQL แก้ไขคอลัมน์ visitor_id visitor_type visitor_area phone_number firstname lastname filename status update_date
//router.post('/auth') // ลงชื่อเข้าใช้งานด้วยเลขประจำตัวประชาชน/เลขที่หนังสือเดินทาง และหมายเลขโทรศัพท์มือถือ

export default router;