import express from "express";
import prisma from "../prismaClient.js";
import { Record } from "./record.js";
import { deserialize } from "v8";

const router = express.Router({ mergeParams: true });

// POST /groups/:groupId/records - 운동 기록 생성
router.post("/", async (req, res, next) => {
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
    const groupId = BigInt(req.params.groupId);

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
      id: String(postRecord.id),
      exerciseType: postRecord.type,
      description: postRecord.description,
      time: postRecord.time,
      distance: postRecord.distance,
      photos: postRecord.images,
      createdAt: postRecord.createdAt,
      author: {
        id: String(postRecord.participant.id),
        nickname: postRecord.participant.nickname,
      },
    };

    res.status(201).json({
      success: true,
      data: [recordData],
      message: "운동 기록이 성공적으로 등록되었습니다.",
    });
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId/records - 운동 기록 목록 조회 및 검색 (페이지네이션 지원)
router.get("/", async (req, res, next) => {
  try {
    const groupId = BigInt(req.params.groupId);
    // 쿼리 파라미터 파싱
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const exerciseType = req.query.exerciseType || "";
    const participantNickname = req.query.participantNickname || "";
    const clientSortBy = req.query.orderBy || req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";

    const sortMap = {
      createdAt: "createdAt", // 최신순
      time: "time", // 운동 시간 순 (DB 필드가 'time'이라고 가정)
    };
    const sortBy = sortMap[clientSortBy] ? sortMap[clientSortBy] : "createdAt";
    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // 검색 조건 구성
    // 모든 개별 조건을 담을 AND 배열을 초기화합니다.
    const andConditions = [{ groupId: groupId }]; // 기본: 그룹 ID는 필수 AND 조건

    if (exerciseType) {
      // 운동 유형 필터링 조건을 AND 배열에 추가
      andConditions.push({
        type: { contains: exerciseType, mode: "insensitive" },
      });
    }

    if (participantNickname) {
      // 닉네임 필터링 조건을 AND 배열에 추가
      andConditions.push({
        participant: {
          nickname: { contains: participantNickname, mode: "insensitive" },
        },
      });
    }

    if (search) {
      // OR로 묶인 검색 조건을 하나의 객체로 만들어 AND 배열에 추가
      andConditions.push({
        OR: [
          { type: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // 최종 whereConditions 객체는 모든 조건을 AND로 묶습니다.
    const whereConditions = {
      AND: andConditions,
    };

    // 전체 개수 조회 (페이지네이션 메타데이터용)
    const totalCount = await prisma.record.count({
      where: whereConditions,
    });

    // 기록 목록 조회
    const records = await prisma.record.findMany({
      where: whereConditions, // 수정된 whereConditions 사용
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
    const mappedRecords = records.map((records) => ({
      id: String(records.id),
      exerciseType: records.type,
      description: records.description,
      time: records.time,
      distance: records.distance,
      photos: records.images,
      createdAt: records.createdAt,
      author: {
        id: String(records.participant.id),
        nickname: records.participant.nickname,
      },
    }));

    res.status(200).json({
      success: true,
      data: mappedRecords,
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
