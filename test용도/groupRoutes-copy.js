import express from "express";
import prisma from "../prismaClient.js";
// 추가로 필요한 Error?
import { BadRequestError, NotFoundError } from "../utils/errors.js";
// {안에 대문자로 해야하는데 group로 불러오고 있음 아마 group.js 수정 필}} ?????
import { Group } from "./group.js";
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

// GET /groups - 그룹 목록 조회 및 검색 (페이지네이션 지원)
router.get("/", async (req, res, next) => {
  try {
    // 쿼리 파라미터 파싱
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const tag = req.query.tag || "";
    const sortBy = req.query.sortBy || "createdAt"; // createdAt, recommendations, name
    const order = req.query.order || "desc"; // asc, desc

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // 검색 조건 구성 name description nickname
    const whereConditions = {};

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { nickname: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      whereConditions.tags = { has: tag };
    }

    // 전체 개수 조회 (페이지네이션 메타데이터용)
    const totalCount = await prisma.group.count({
      where: whereConditions,
    });

    // 그룹 목록 조회 -> 다음과 같이 표현됨
    const groups = await prisma.group.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        image: true,
        tags: true,
        targetCount: true,
        recommendations: true,
        createdAt: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    // 응답 데이터 포맷팅
    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      nickname: group.nickname,
      image: group.image,
      tags: group.tags,
      targetCount: group.targetCount,
      recommendations: group.recommendations,
      participantCount: group._count.participants,
      createdAt: group.createdAt,
    }));
    // 정상 응답값
    return res.status(200).json({
      success: true,
      data: formattedGroups,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: totalCount,
        limit: limit,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId - 그룹 상세 조회
router.get("/:groupId", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = BigInt(groupId);

    const group = await prisma.group.findUnique({
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
    const id = BigInt(groupId);
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

    const updatedGroup = await prisma.group.update({
      where: {
        id: id
      },
      data: updateData,
    });

    res.status(200).json({
      message: "그룹 정보가 성공적으로 수정되었습니다.",
      data: updatedGroup
    });
  } catch (error) {
    next(error);
  }
});

// 그룹 삭제
router.delete("/:groupId", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = BigInt(groupId);
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
    const { groupId } = req.params;
    if (!groupId) {
      throw new BadRequestError("ID는 필수");
    }
    const clickRecommend = await prisma.group.update({
      where: {
        id: BigInt(groupId),
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
    const { groupId } = req.params;
    if (!groupId) {
      throw new BadRequestError("ID는 필수");
    }
    const clickRecommend = await prisma.group.update({
      where: {
        id: BigInt(groupId),
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

export default router;