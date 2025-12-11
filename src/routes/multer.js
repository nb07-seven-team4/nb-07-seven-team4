import multer from 'multer';
import path from "path";
import crypto from "crypto";
import { BadRequestError } from "../utils/errors.js";

// 허용할 mime 타입 (여러 이미지 형식)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp'
];

// 파일 크기 제한 5mb
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 로컬 스토리지 설정
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

// 파일 필터
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `허용되지 않는 파일 형식입니다. 허용 형식: JPG, PNG, GIF, WEBP 등`
      ),
      false
    );
  }
};

// multer 인스턴스 생성
export const upload = multer({
  storage: localStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});
