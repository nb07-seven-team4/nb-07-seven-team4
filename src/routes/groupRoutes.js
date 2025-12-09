const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const AppError = require("../errors.js");

// POST /groups - 그룹 생성
router.post("/", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

// GET /groups - 그룹 목록 조회
router.get("/", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId - 그룹 상세 조회
router.get("/:groupId", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

// PATCH /groups/:groupId - 그룹 수정
router.patch("/:groupId", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

// DELETE /groups/:groupId - 그룹 삭제
router.delete("/:groupId", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

// POST /groups/:groupId/likes - 그룹 추천
router.patch("/:groupId/likes", async (req, res, next) => {
  try {
    const { gruopId } = req.body;
    if (!gruopId) {
      throw new BadRequestError("ID는 필수");
    }
    const clickRecommend = await prisma.group.update({
      where: {
        id: gruopId,
      },
      data: {
        recommendCount: {
          increment: 1,
        },
      },
    });
    res.status(200).json({ message: "그룹추천 성공" });
  } catch (error) {
    next(error);
  }
});

// DELETE /groups/:groupId/likes - 그룹 추천 취소
router.delete("/:groupId/likes", async (req, res, next) => {
  try {
    const { gruopId } = req.body;
    if (!gruopId) {
      throw new BadRequestError("ID는 필수");
    }
    const clickRecommend = await prisma.group.update({
      where: {
        id: gruopId,
      },
      data: {
        recommendCount: {
          decrement: 1,
        },
      },
    });
    res.status(200).json({ message: "그룹추천 취소" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
