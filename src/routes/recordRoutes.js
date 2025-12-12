import express from "express";
import prisma from "../prismaClient.js";
import { Record } from "./record.js";
import { deserialize } from "v8";

const router = express.Router({ mergeParams: true });

// POST /groups/:groupId/records - 운동 기록 생성
router.post("/", async (req, res, next) => {
  const groupId = BigInt(req.params.groupId);
  const {
    exerciseType,
    description,
    time,
    distance,
    photos,
    authorNickname,
    authorPassword,
  } = req.body;

  try {
    // 닉네임과 비밀번호를 사용하여 해당 그룹의 참가자를 찾기
    const participant = await prisma.participant.findUnique({
      where: {
        groupId_nickname: {
          groupId: groupId,
          nickname: authorNickname,
        },
      },
    });

    if (!participant) {
      return res.status(401).json({ message: "유효하지 않은 닉네임입니다." });
    }

    if (participant.password !== authorPassword) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 인증 성공: 참가자 ID 확보
    const participantId = participant.id;

    // 유효성 검사 로직 따로 추가 예정

    const postRecord = await prisma.record.create({
      data: {
        type: exerciseType,
        description: description || "",
        time: time,
        distance: distance,
        images: photos || [],

        // 관계 설정
        group: { connect: { id: groupId } },
        participant: { connect: { id: participantId } },
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

    // 응답 형식에 맞게 매핑
    const recordData = {
      id: Number(postRecord.id),
      exerciseType: postRecord.type,
      description: postRecord.description,
      time: postRecord.time,
      distance: postRecord.distance,
      photos: postRecord.images,
      author: {
        id: Number(postRecord.participant.id),
        nickname: postRecord.participant.nickname,
      },
    };

    res.status(201).json({
      success: true,
      data: recordData,
      message: "운동 기록이 성공적으로 등록되었습니다.",
    });
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
        { type: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (exerciseType) {
      whereConditions.type = {
        contains: exerciseType,
        mode: "insensitive",
      };
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
      return res
        .status(404)
        .json({ success: false, message: "기록이 없습니다.." });
    }

    // 응답 데이터 매핑 추가
    const recordData = {
      id: Number(record.id),
      exerciseType: record.type,
      description: record.description,
      time: record.time,
      distance: record.distance,
      photos: record.images,
      author: {
        id: Number(record.participant.id),
        nickname: record.participant.nickname,
      },
    };

    res.status(200).json({
      success: true,
      data: recordData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
