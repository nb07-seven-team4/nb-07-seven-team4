//rankRoutes.js
import express from "express";
import RankController from "../controllers/RankController.js";

const router = express.Router({ mergeParams: true });

// GET /groups/:groupId/rank - 그룹 랭킹 조회 (달리기 기록 기반)
router.get("/", RankController.getRanking.bind(RankController));

export default router;
