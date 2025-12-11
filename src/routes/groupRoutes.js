import express from "express";
import prisma from "../prismaClient.js";
// 추가로 필요한 Error?
import { BadRequestError, NotFoundError } from "../utils/errors.js";
// {안에 대문자로 해야하는데 group로 불러오고 있음 아마 group.js 수정 필}} ?????
import { Group } from "./group.js";
const router = express.Router({ mergeParams: true });

// POST /groups - 그룹 생성
router.post("/", async (req, res, next) => {
  // 수정: API 명세에 맞춘 필드명 (photoUrl, goalRep, ownerNickname, ownerPassword)
  const {
    name,
    description,
    photoUrl,        // 수정: image → photoUrl (API 명세 필드명)
    tags,
    goalRep,         // 수정: targetCount → goalRep (API 명세 필드명)
    discordWebhookUrl,
    discordInviteUrl,
    ownerNickname,   // 수정: nickname → ownerNickname (API 명세 필드명)
    ownerPassword    // 수정: password → ownerPassword (API 명세 필드명)
  } = req.body;

  // 수정: 필수 필드 검증 (API 명세 기준)
  if (!name || !ownerNickname || !ownerPassword || !photoUrl || !description || !tags || !goalRep || !discordWebhookUrl || !discordInviteUrl) {
    return res.status(400).json({
      path: "body",
      message: '필수 필드를 모두 입력해주세요'
    });
  }

  try {
    // 수정: Group과 Owner(Participant)를 트랜잭션으로 동시에 생성
    const result = await prisma.$transaction(async (tx) => {
      // 1. 임시 Group 생성 (ownerId 없이)
      const tempGroup = await tx.group.create({
        data: {
          name,
          description,
          photoUrl,
          tags,
          goalRep,
          discordWebhookUrl,
          discordInviteUrl,
          ownerId: BigInt(0) // 임시값
        }
      });

      // 2. Owner를 Participant로 생성
      const owner = await tx.participant.create({
        data: {
          nickname: ownerNickname,
          password: ownerPassword,
          isOwner: true,
          groupId: tempGroup.id
        }
      });

      // 3. Group의 ownerId 업데이트
      await tx.group.update({
        where: { id: tempGroup.id },
        data: { ownerId: owner.id }
      });

      // 4. 생성된 그룹에 owner와 participants 포함해서 조회
      return await tx.group.findUnique({
        where: { id: tempGroup.id },
        include: {
          participants: true,
          badges: true
        }
      });
    });

    // 수정: API 명세에 맞춘 응답 구조 (owner 분리, photoUrl/goalRep 필드명)
    const owner = result.participants.find(p => p.isOwner);
    const response = {
      id: Number(result.id),
      name: result.name,
      description: result.description,
      photoUrl: result.photoUrl,
      goalRep: result.goalRep,
      discordWebhookUrl: result.discordWebhookUrl,
      discordInviteUrl: result.discordInviteUrl,
      likeCount: result.likeCount,
      tags: result.tags,
      owner: {
        id: Number(owner.id),
        nickname: owner.nickname,
        createdAt: owner.joinedAt.getTime(),
        updatedAt: owner.joinedAt.getTime()
      },
      participants: result.participants.map(p => ({
        id: Number(p.id),
        nickname: p.nickname,
        createdAt: p.joinedAt.getTime(),
        updatedAt: p.joinedAt.getTime()
      })),
      createdAt: result.createdAt.getTime(),
      updatedAt: result.updatedAt.getTime(),
      badges: result.badges.map(b => b.type)
    };

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// GET /groups - 그룹 목록 조회 및 검색 (페이지네이션 지원)
router.get("/", async (req, res, next) => {
  try {
    // 수정: API 명세에 맞춘 쿼리 파라미터 (orderBy 검증 추가)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const orderBy = req.query.orderBy || "createdAt"; // 수정: sortBy → orderBy (API 명세)
    const order = req.query.order || "desc"; // asc, desc

    // 수정: orderBy 유효성 검증 (API 명세 기준)
    const validOrderBy = ['likeCount', 'participantCount', 'createdAt'];
    if (!validOrderBy.includes(orderBy)) {
      return res.status(400).json({
        path: "orderBy",
        message: `The orderBy parameter must be one of the following values: ${JSON.stringify(validOrderBy)}.`
      });
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // 수정: 검색 조건 (그룹명만 검색, API 명세 기준)
    const whereConditions = {};
    if (search) {
      whereConditions.name = { contains: search, mode: "insensitive" };
    }

    // 전체 개수 조회 (페이지네이션 메타데이터용)
    const totalCount = await prisma.group.count({
      where: whereConditions,
    });

    // 수정: orderBy에 따른 정렬 필드 매핑
    let prismaOrderBy = {};
    if (orderBy === 'likeCount') {
      prismaOrderBy = { likeCount: order };
    } else if (orderBy === 'participantCount') {
      // participantCount는 count 집계이므로 별도 처리 필요
      prismaOrderBy = { participants: { _count: order } };
    } else {
      prismaOrderBy = { [orderBy]: order };
    }

    // 수정: 그룹 목록 조회 (owner, participants, recordCount 포함)
    const groups = await prisma.group.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      orderBy: prismaOrderBy,
      include: {
        participants: true,  // owner 분리를 위해 전체 participants 조회
        badges: true,
        _count: {
          select: {
            records: true  // recordCount
          }
        }
      }
    });

    // 수정: API 명세에 맞춘 응답 데이터 포맷팅
    const formattedGroups = groups.map(group => {
      const owner = group.participants.find(p => p.isOwner);
      return {
        id: Number(group.id),
        name: group.name,
        description: group.description,
        photoUrl: group.photoUrl,
        goalRep: group.goalRep,
        discordWebhookUrl: group.discordWebhookUrl,
        discordInviteUrl: group.discordInviteUrl,
        likeCount: group.likeCount,
        recordCount: group._count.records,
        tags: group.tags,
        owner: owner ? {
          id: Number(owner.id),
          nickname: owner.nickname,
          createdAt: owner.joinedAt.getTime(),
          updatedAt: owner.joinedAt.getTime()
        } : null,
        participants: group.participants.map(p => ({
          id: Number(p.id),
          nickname: p.nickname,
          createdAt: p.joinedAt.getTime(),
          updatedAt: p.joinedAt.getTime()
        })),
        createdAt: group.createdAt.getTime(),
        updatedAt: group.updatedAt.getTime(),
        badges: group.badges.map(b => b.type)
      };
    });

    // 수정: API 명세에 맞춘 응답 구조 (data, total)
    return res.status(200).json({
      data: formattedGroups,
      total: totalCount
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

    // 수정: 그룹 조회 (participants, badges 포함)
    const group = await prisma.group.findUnique({
      where: { id: id },
      include: {
        participants: true,
        badges: true,
      }
    });

    // 수정: 그룹이 없으면 404 에러 (API 명세 기준)
    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    // 수정: API 명세에 맞춘 응답 구조 (owner 분리, photoUrl/goalRep 필드명)
    const owner = group.participants.find(p => p.isOwner);
    const response = {
      id: Number(group.id),
      name: group.name,
      description: group.description,
      photoUrl: group.photoUrl,
      goalRep: group.goalRep,
      discordWebhookUrl: group.discordWebhookUrl,
      discordInviteUrl: group.discordInviteUrl,
      likeCount: group.likeCount,
      tags: group.tags,
      owner: owner ? {
        id: Number(owner.id),
        nickname: owner.nickname,
        createdAt: owner.joinedAt.getTime(),
        updatedAt: owner.joinedAt.getTime()
      } : null,
      participants: group.participants.map(p => ({
        id: Number(p.id),
        nickname: p.nickname,
        createdAt: p.joinedAt.getTime(),
        updatedAt: p.joinedAt.getTime()
      })),
      createdAt: group.createdAt.getTime(),
      updatedAt: group.updatedAt.getTime(),
      badges: group.badges.map(b => b.type)
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /groups/:groupId - 그룹 수정
router.patch("/:groupId", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = BigInt(groupId);

    // 수정: API 명세에 맞춘 필드명 (photoUrl, goalRep, ownerNickname, ownerPassword)
    const {
      name,
      description,
      photoUrl,           // 수정: image → photoUrl
      tags,
      goalRep,            // 수정: targetCount → goalRep
      discordWebhookUrl,
      discordInviteUrl,
      ownerNickname,      // 수정: 인증용 ownerNickname 추가
      ownerPassword       // 수정: 인증용 ownerPassword 추가
    } = req.body;

    // 수정: 그룹 조회 (owner 인증을 위해)
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        participants: true,
        badges: true
      }
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    // 수정: owner 인증 (ownerNickname + ownerPassword 검증)
    const owner = group.participants.find(p => p.isOwner);
    if (!owner || owner.nickname !== ownerNickname || owner.password !== ownerPassword) {
      return res.status(401).json({
        path: "password",
        message: "Wrong password"
      });
    }

    // 수정: 업데이트할 데이터 구성
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (tags !== undefined) updateData.tags = tags;
    if (goalRep !== undefined) updateData.goalRep = goalRep;
    if (discordWebhookUrl !== undefined) updateData.discordWebhookUrl = discordWebhookUrl;
    if (discordInviteUrl !== undefined) updateData.discordInviteUrl = discordInviteUrl;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        path: "body",
        message: "수정할 데이터가 요청에 포함되어 있지 않습니다."
      });
    }

    // 수정: 그룹 업데이트
    const updatedGroup = await prisma.group.update({
      where: { id },
      data: updateData,
      include: {
        participants: true,
        badges: true
      }
    });

    // 수정: API 명세에 맞춘 응답 구조
    const response = {
      id: Number(updatedGroup.id),
      name: updatedGroup.name,
      description: updatedGroup.description,
      photoUrl: updatedGroup.photoUrl,
      goalRep: updatedGroup.goalRep,
      discordWebhookUrl: updatedGroup.discordWebhookUrl,
      discordInviteUrl: updatedGroup.discordInviteUrl,
      likeCount: updatedGroup.likeCount,
      tags: updatedGroup.tags,
      owner: {
        id: Number(owner.id),
        nickname: owner.nickname,
        createdAt: owner.joinedAt.getTime(),
        updatedAt: owner.joinedAt.getTime()
      },
      participants: updatedGroup.participants.map(p => ({
        id: Number(p.id),
        nickname: p.nickname,
        createdAt: p.joinedAt.getTime(),
        updatedAt: p.joinedAt.getTime()
      })),
      createdAt: updatedGroup.createdAt.getTime(),
      updatedAt: updatedGroup.updatedAt.getTime(),
      badges: updatedGroup.badges.map(b => b.type)
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// 그룹 삭제
router.delete("/:groupId", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const id = BigInt(groupId);

    // 수정: API 명세에 따라 body에서 ownerPassword 받기
    const { ownerPassword } = req.body;

    // 수정: 그룹 조회 (owner 인증을 위해)
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        participants: true
      }
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    // 수정: owner 인증 (ownerPassword만 검증)
    const owner = group.participants.find(p => p.isOwner);
    if (!owner || owner.password !== ownerPassword) {
      return res.status(401).json({
        path: "password",
        message: "Wrong password"
      });
    }

    // 수정: 그룹 삭제 (Cascade로 participants, records, badges도 자동 삭제)
    await prisma.group.delete({
      where: { id }
    });

    res.status(204).end();  // 삭제 성공 (본문 없음)
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
    await prisma.group.update({
      where: {
        id: BigInt(groupId),
      },
      data: {
        likeCount: {
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
    await prisma.group.update({
      where: {
        id: BigInt(groupId),
      },
      data: {
        likeCount: {
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