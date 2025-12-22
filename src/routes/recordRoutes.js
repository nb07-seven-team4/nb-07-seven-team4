//recordRoutes.js
import express from "express";
import RecordController from "../controllers/RecordController.js";

const router = express.Router({ mergeParams: true });

// POST /groups/:groupId/records - 운동 기록 생성
router.post("/", RecordController.createRecord.bind(RecordController));

// GET /groups/:groupId/records - 운동 기록 목록 조회 및 검색 (페이지네이션 지원)
router.get("/", RecordController.getRecords.bind(RecordController));

// GET /groups/:groupId/records/:recordId - 운동 기록 상세 조회
router.get("/:recordId", RecordController.getRecordById.bind(RecordController));

export default router;
