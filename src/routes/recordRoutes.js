import express from "express";
import { prisma } from "../../prisma/prisma.js";

const router = express.Router({ mergeParams: true });

// POST /groups/:groupId/records - 운동 기록 생성
router.post("/", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 3 - 이지산)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId/records - 운동 기록 목록 조회
router.get("/", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 3 - 이지산)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId/records/:recordId - 운동 기록 상세 조회
router.get("/:recordId", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 3 - 이지산)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

export default router;
