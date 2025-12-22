//grouproutes.js
import express from "express";
import GroupController from "../controllers/GroupController.js";

const router = express.Router({ mergeParams: true });

// POST /groups - 그룹 생성
router.post("/", GroupController.createGroup.bind(GroupController));

// GET /groups - 그룹 목록 조회 및 검색 (페이지네이션 지원)
router.get("/", GroupController.getGroups.bind(GroupController));

// GET /groups/:groupId - 그룹 상세 조회
router.get("/:groupId", GroupController.getGroupById.bind(GroupController));

// PATCH /groups/:groupId - 그룹 수정
router.patch("/:groupId", GroupController.updateGroup.bind(GroupController));

// DELETE /groups/:groupId - 그룹 삭제
router.delete("/:groupId", GroupController.deleteGroup.bind(GroupController));

// POST /groups/:groupId/likes - 그룹 추천
router.post("/:groupId/likes", GroupController.likeGroup.bind(GroupController));

// DELETE /groups/:groupId/likes - 그룹 추천 취소
router.delete("/:groupId/likes", GroupController.unlikeGroup.bind(GroupController));

export default router;
