const express = require('express');
const router = express.Router();

// POST /images - 이미지 파일 업로드
router.post('/', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 4 - 김민기)
    // 이미지 업로드 로직 (multer, cloudinary 등)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
