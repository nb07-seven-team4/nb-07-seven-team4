import express from "express";
import { prisma } from "../../prisma/prisma.js";
import { Record } from "./record.js";

const router = express.Router({ mergeParams: true });

// POST /groups/:groupId/records - 운동 기록 생성
router.post("/", async (req, res, next) => {
  const groupId = parseInt(req.params.groupId);
  const { exerciseType, description, duration, distance, images } = req.body;

  // 참여자 인증 (테스트를 위해 임시로 지정)
  const participantId = 1;
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
            id: parseInt(newRecord.groupId),
          },
        },
        // 관계 설정
        participant: {
          connect: {
            id: parseInt(newRecord.participantId),
          },
        },
      },
    });

    res.status(201).json(postRecord);
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId/records - 운동 기록 목록 조회
router.get("/", async (req, res, next) => {
  const groupId = parseInt(req.params.groupId);
  if (isNaN(groupId)) {
    return res.status(400).json({ message: "유효하지 않은 그룹 ID입니다." });
  }

  try {
    const records = await prisma.record.findMany({
      where: { groupId: groupId },
      include: {
        participant: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId/records/:recordId - 운동 기록 상세 조회
router.get("/:recordId", async (req, res, next) => {
  const groupId = parseInt(req.params.groupId);
  const recordId = parseInt(req.params.recordId);
  if (isNaN(groupId) || isNaN(recordId)) {
    return res.status(400).json({ message: "유효하지 않은 ID입니다." });
  }
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
