import multer from "multer";
import fs from "fs";

const storage = (dir) => multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(`upload/${dir}`, { recursive: true });
    cb(null, `upload/${dir}/`);
  },
  filename: (req, file, cb) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const time = String(today.getTime());

    const ext = file.originalname.split(".").pop().toLowerCase();
    const formattedDate = `${year}${month}${day}-${time}.${ext}`;

    cb(null, formattedDate);
  },
});

// ป้องกันชนิดไฟล์ที่ไม่อนุญาต
const fileFilter = (req, file, cb) => {
  if (!file) return cb(null, true); // ป้องกันเคสไม่มีไฟล์ ส่งผ่านไปเลย

  const allowed = ["png", "jpg", "jpeg"];
  const ext = file.originalname.split(".").pop().toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error("File type not allowed"), false);
  }
  cb(null, true);
};

// สร้าง instance ของ multer พร้อม storage และ filter
const upload = multer({
  storage: storage('visitor'),
  fileFilter,
});

export default upload;
