const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../prismaClient');

// POST /groups/:groupId/participants - 그룹 참여
router.post('/', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 2 - 이서준)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

// DELETE /groups/:groupId/participants - 그룹 참여 취소
router.delete('/', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 2 - 이서준)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
