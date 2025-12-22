// BadgeController.js
import prisma from "../prismaClient.js";
import { NotFoundError } from "../utils/errors.js";
import { checkAndAwardBadges, getBadgeStatus } from "../services/badgeService.js";

class BadgeController {
  // GET /groups/:groupId/badges - 특정 그룹의 모든 배지를 가져옴
  async getBadges(req, res, next) {
    try {
      const { groupId } = req.params;
      const id = BigInt(groupId);

      const group = await prisma.group.findUnique({
        where: { id: id },
      });

      if (!group) {
        throw new NotFoundError("Group");
      }

      const badges = await prisma.badge.findMany({
        where: { groupId: id },
        orderBy: { earnedAt: 'asc' },
      });

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
  }

  // POST /groups/:groupId/badges/check - 배지를 수동으로 확인하고 수여
  async checkBadges(req, res, next) {
    try {
      const { groupId } = req.params;
      const id = BigInt(groupId);

      const group = await prisma.group.findUnique({
        where: { id: id },
      });

      if (!group) {
        throw new NotFoundError("Group");
      }

      const result = await checkAndAwardBadges(id);

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
  }

  // GET /groups/:groupId/badges/status - 배지 자격 상태 가져오기
  async getBadgeStatus(req, res, next) {
    try {
      const { groupId } = req.params;
      const id = BigInt(groupId);

      const group = await prisma.group.findUnique({
        where: { id: id },
      });

      if (!group) {
        throw new NotFoundError("Group");
      }

      const status = await getBadgeStatus(id);

      res.status(200).json({
        success: true,
        ...status,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BadgeController();
