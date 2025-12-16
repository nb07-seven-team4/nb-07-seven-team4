import express from "express";
import prisma from "../prismaClient.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { Rank } from "./rank.js";
const router = express.Router({ mergeParams: true });

// GET /groups/:groupId/rank - 그룹 랭킹 조회 (달리기 기록 기반)
router.get("/", async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // 1. groupId 파라미터 검증
    const groupIdNum = parseInt(groupId, 10);
    if (isNaN(groupIdNum)) {
      throw new BadRequestError("ID가 유효하지 않습니다.");
    }

    // 2. 그룹 존재 확인
    const group = await prisma.group.findUnique({
      where: { id: groupIdNum },
    });
    if (!group) {
      throw new NotFoundError("그룹");
    }

    // 3. 모든 운동 기록 조회 (달리기, 자전거, 수영)
    const records = await prisma.record.findMany({
      where: {
        groupId: groupIdNum,
        // 모든 운동 종류 포함 (type 필터 제거)
      },
      include: {
        participant: true, // 참가자 정보 포함
      },
    });

    // 4. 참가자별 데이터 집계
    // Map으로 참가자별 기록 그룹화
    const participantData = new Map();

    records.forEach((record) => {
      const participantId = record.participantId.toString();

      if (!participantData.has(participantId)) {
        participantData.set(participantId, {
          participant: record.participant,
          recordCount: 0,      // 기록 횟수
          totalTime: 0,        // 누적 시간 (초)
        });
      }

      const data = participantData.get(participantId);
      data.recordCount += 1;                    // 기록 횟수 증가
      data.totalTime += record.time || 0;       // 시간 누적 (time 필드 사용)
    });

    // 5. 배열로 변환
    const dataArray = Array.from(participantData.values());

    // 6. 누적 시간 기준 내림차순 정렬
    dataArray.sort((a, b) => b.totalTime - a.totalTime);

    // 7. Rank 객체로 변환
    const rankings = dataArray.map((data) =>
      Rank.fromParticipantEntity(
        data.participant,
        data.recordCount,    // 기록 횟수
        data.totalTime       // 누적 시간 (초)
      )
    );

    // 8. 응답 반환
    res.status(200).json({
      message: "그룹 랭킹 조회 성공",
      rankings: rankings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
