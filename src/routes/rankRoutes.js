import express from 'express';
import { prisma } from '../../prisma/prisma.js';

const router = express.Router({ mergeParams: true });

// GET /groups/:groupId/rank - 그룹 랭킹 조회
router.get('/', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 4 - 김민기)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

export default router;

