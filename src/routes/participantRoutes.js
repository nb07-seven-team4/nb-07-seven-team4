const express = require("express");
const router = express.Router({ mergeParams: true });
const prisma = require("../prismaClient");
const AppError = require("../errors.js");
const { BadRequestError } = require("../utils/errors.js");

// POST /groups/:groupId/participants - 그룹 참여
router.post("/:groupId/join", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { nickname, password } = req.body;
    const idToNum = parseInt(groupId, 10);
    if (isNaN(idToNum)) {
      throw new BadRequestError("ID가 유효하지 않습니다.");
    }
    if (!groupId || !nickname || !password) {
      throw new BadRequestError("요청이 올바르지 않습니다.");
    }
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        groupId: idToNum,
        nickname: nickname,
      },
    });
    if (existingParticipant) {
      throw new ConflictError("이미 사용중인 닉네임");
    }

    const newParticipant = await prisma.participant.create({
      data: {
        groupId: idToNum,
        nickname: nickname,
      },
    });
    res.status(201).json({
      message: "그룹참여",
      participant: newParticipant,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /groups/:groupId/participants - 그룹 참여 취소
router.delete("/", async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 2 - 이서준)
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
