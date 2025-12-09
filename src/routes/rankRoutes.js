const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../prismaClient');

// GET /groups/:groupId/rank - 그룹 랭킹 조회
router.get('/', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 4 - 김민기)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
