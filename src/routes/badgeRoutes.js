//badgeRoutes.js
import express from "express";
import BadgeController from "../controllers/BadgeController.js";

const router = express.Router({ mergeParams: true });

// GET /groups/:groupId/badges - 특정 그룹의 모든 배지를 가져옴
router.get("/", BadgeController.getBadges.bind(BadgeController));

// POST /groups/:groupId/badges/check - 배지를 수동으로 확인하고 수여
router.post("/check", BadgeController.checkBadges.bind(BadgeController));

// GET /groups/:groupId/badges/status - 배지 자격 상태 가져오기
router.get("/status", BadgeController.getBadgeStatus.bind(BadgeController));

export default router;
