import express from "express";
import prisma from "../prismaClient.js";
import { Record } from "./record.js";

const router = express.Router({ mergeParams: true });

// POST /groups/:groupId/records - 운동 기록 생성
router.post("/", async (req, res, next) => {
  const groupId = BigInt(req.params.groupId);
  const { exerciseType, description, duration, distance, images } = req.body;

  // 참여자 인증 (테스트를 위해 임시로 지정)
  const participantId = BigInt(1);
  try {
    // 유효성 검사
    const recordInfoEntity = {
      id: "0",
      exerciseType: exerciseType,
      description: description || "",
      duration: duration,
      distance: distance,
      images: images || [],
      createdAt: new Date(),
      groupId: groupId.toString(),
      participantId: participantId.toString(),
    };

    const newRecord = Record.fromEntity(recordInfoEntity);

    const postRecord = await prisma.record.create({
      data: {
        exerciseType: newRecord.exerciseType,
        description: newRecord.description,
        duration: newRecord.duration,
        distance: newRecord.distance,
        images: newRecord.images,

        // 관계 설정
        group: {
          connect: {
            id: BigInt(newRecord.groupId),
          },
        },
        // 관계 설정
        participant: {
          connect: {
            id: BigInt(newRecord.participantId),
          },
        },
      },
    });

    res.status(201).json(postRecord);
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId/records - 운동 기록 목록 조회 및 검색 (페이지네이션 지원)
router.get("/", async (req, res, next) => {
  const groupId = BigInt(req.params.groupId);

  try {
    // 쿼리 파라미터 파싱
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const exerciseType = req.query.exerciseType || "";
    const participantNickname = req.query.participantNickname || "";
    const sortBy = req.query.sortBy || "createdAt"; // createdAt, duration, distance
    const order = req.query.order || "desc"; // asc, desc

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const whereConditions = { groupId: groupId };

    if (search) {
      whereConditions.OR = [
        { exerciseType: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (exerciseType) {
      whereConditions.exerciseType = { contains: exerciseType, mode: "insensitive" };
    }

    if (participantNickname) {
      whereConditions.participant = {
        nickname: { contains: participantNickname, mode: "insensitive" },
      };
    }

    // 전체 개수 조회 (페이지네이션 메타데이터용)
    const totalCount = await prisma.record.count({
      where: whereConditions,
    });

    // 기록 목록 조회
    const records = await prisma.record.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      include: {
        participant: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    res.status(200).json({
      success: true,
      data: records,
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

// GET /groups/:groupId/records/:recordId - 운동 기록 상세 조회
router.get("/:recordId", async (req, res, next) => {
  const groupId = BigInt(req.params.groupId);
  const recordId = BigInt(req.params.recordId);
  try {
    const record = await prisma.record.findUnique({
      where: {
        id: recordId,
        groupId: groupId,
      },
      include: {
        participant: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    // 미들웨어로 뺄 계획.
    if (!record) {
      return res.status(404).json({ message: "기록이 없습니다.." });
    }

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
});

export default router;