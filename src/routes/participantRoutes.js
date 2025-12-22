//participantRoutes.js
import express from "express";
import ParticipantController from "../controllers/ParticipantController.js";

const router = express.Router({ mergeParams: true });

// POST /groups/:groupId/participants - 그룹 참여
router.post("/", ParticipantController.joinGroup.bind(ParticipantController));

// DELETE /groups/:groupId/participants - 그룹 참여 취소
router.delete("/", ParticipantController.leaveGroup.bind(ParticipantController));

export default router;
