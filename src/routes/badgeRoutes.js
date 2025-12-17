import express from "express";
import prisma from "../prismaClient.js";
import { NotFoundError } from "../utils/errors.js";
import { checkAndAwardBadges, getBadgeStatus } from "../services/badgeService.js";

const router = express.Router({ mergeParams: true });

// GET /groups/:groupId/badges - 특정 그룹의 모든 배지를 가져옴
router.get("/", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = BigInt(groupId);

    // 그룹이 존재하는지 확인
    const group = await prisma.group.findUnique({
      where: { id: id },
    });

    if (!group) {
      throw new NotFoundError("Group");
    }

    // 그룹의 모든 배지를 획득
    const badges = await prisma.badge.findMany({
      where: { groupId: id },
      orderBy: { earnedAt: 'asc' },
    });

    // 응답 형식으로 변환
    const response = badges.map(badge => ({
      id: Number(badge.id),
      type: badge.type,
      earnedAt: badge.earnedAt.getTime(),
    }));

    res.status(200).json({
      success: true,
      badges: response,
    });
  } catch (error) {
    next(error);
  }
});

// POST /groups/:groupId/badges/check - 배지를 수동으로 확인하고 수여
router.post("/check", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = BigInt(groupId);

    // 그룹이 존재하는지 확인
    const group = await prisma.group.findUnique({
      where: { id: id },
    });

    if (!group) {
      throw new NotFoundError("Group");
    }

    // 배지를 확인하고 수여
    const result = await checkAndAwardBadges(id);

    // 응답 형식으로 변환
    const response = {
      success: true,
      newBadges: result.newBadges.map(badge => ({
        id: Number(badge.id),
        type: badge.type,
        earnedAt: badge.earnedAt.getTime(),
      })),
      allBadges: result.allBadges.map(badge => ({
        id: Number(badge.id),
        type: badge.type,
        earnedAt: badge.earnedAt.getTime(),
      })),
      message: result.newBadges.length > 0
        ? `${result.newBadges.length}개의 새로운 뱃지를 획득했습니다!`
        : "새로 획득한 뱃지가 없습니다.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId/badges/status - 배지 자격 상태 가져오기
router.get("/status", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = BigInt(groupId);

    // 그룹이 존재하는지 확인
    const group = await prisma.group.findUnique({
      where: { id: id },
    });

    if (!group) {
      throw new NotFoundError("Group");
    }

    // 배지 상태 받기
    const status = await getBadgeStatus(id);

    res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
