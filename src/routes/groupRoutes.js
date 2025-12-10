import express, { json } from "express";
import prisma from ("../prismaClient");
import { AppError } from ("../utils/errors.js");
import group from ("../group.js")
const router = express.Router({ mergeParams: true });

// POST /groups - 그룹 생성
router.post("/", async (req, res, next) => {
  const {
    name,
    description,
    nickname,
    password,
    image,
    tags,
    targetCount,
    discordWebhookUrl,
    discordInviteUrl
  } = req.body;

  if (!name || !nickname || !password || !image || !description || !tags || !targetCount || !discordWebhookUrl || !discordInviteUrl) {
    return res.status(400).json({ message: '공란을 채워주세요' });
  }
  try {
    const groupData = {
      name,
      description,
      nickname,
      password,
      image,
      tags,
      targetCount,
      discordWebhookUrl,
      discordInviteUrl
    }
    const newGroup = await prisma.group.create({
      data: groupData,
    })
    return res.status(201).json(newGroup);
  } catch (error) {
    next(error);
  }
});

// GET /groups - 그룹 목록 조회 (하동우)
router.get("/", async (req, res, next) => {

  try {
    const group = await prisma.group.findMany({
      //그룹명, 닉네임, 사진, 태그, 목표 횟수, 추천수, 참여자수

    });

    return res.status(201).json({ message: "그룹 목록 조회 완료." })
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId - 그룹 상세 조회
router.get("/:groupId", async (req, res, next) => {
  try {
    const id = parseInt(groupId)
    if (isNaN(id)) {
      return res.status(400).json({ message: "유효하지 않은 그룹 ID입니다." })
    }
    const group = await prisma.group.findMany({
      where: { id: id },
      include: {
        participants: {
          select: {
            id: true,
            nickname: true,
            joinedAt: true,
          }
        },
        badges: true,
      }
    });
    res.status(201).json({
      message: "그룹 상세 조회 완료",
      data: group,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /groups/:groupId - 그룹 수정
router.patch("/:groupId", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = parseInt(groupId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "유효하지 않은 그룹 ID입니다." });
    }
    const {
      name,
      description,
      nickname,
      password,
      image,
      tags,
      targetCount,
      discordWebhookUrl,
      discordInviteUrl
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (password !== undefined) updateData.password = password;
    if (image !== undefined) updateData.image = image;
    if (tags !== undefined) updateData.tags = tags;
    if (targetCount !== undefined) updateData.targetCount = targetCount;
    if (discordWebhookUrl !== undefined) updateData.discordWebhookUrl = discordWebhookUrl;
    if (discordInviteUrl !== undefined) updateData.discordInviteUrl = discordInviteUrl;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "수정할 데이터가 요청에 포함되어 있지 않습니다."
      });
    }

    const updatedEntity = await prisma.group.update({
      where: {
        id: id
      },
      data: updateData,
    });

    const updatedGroup = group.fromEntity(updatedEntity)
    res.status(200).json({
      message: "그룹 정보가 성공적으로 수정되었습니다.",
      data: updatedGroup
    });
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    next(error);
  }
});


router.delete("/:groupId", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = parseInt(groupId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "유효하지 않은 그룹 ID 형식입니다." });
    }
    await prisma.group.delete({
      where: {
        id: id,
      },
    });
    res.status(204).end();

  } catch (error) {
    next(error);
  }
});
// POST /groups/:groupId/likes - 그룹 추천
router.patch("/:groupId/likes", async (req, res, next) => {
  try {
    const { gruopId } = req.params;
    if (!gruopId) {
      throw new BadRequestError("ID는 필수");
    }
    const clickRecommend = await prisma.group.update({
      where: {
        id: gruopId,
      },
      data: {
        recommendations: {
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
    const { gruopId } = req.params;
    if (!gruopId) {
      throw new BadRequestError("ID는 필수");
    }
    const clickRecommend = await prisma.group.update({
      where: {
        id: gruopId,
      },
      data: {
        recommendations: {
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
