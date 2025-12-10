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
            where: { id: groupIdNum }
        });
        if (!group) {
            throw new NotFoundError("그룹");
        }

        // 3. 달리기 기록만 조회 (exerciseType = "달리기") -> enum으로 스키마추가해서 다른 운동도 추가? 
        // rank 검증에서 필터로 운동별 랭킹 가능 -> 스키마 추가 or 추가안하고 그대로?
        const records = await prisma.record.findMany({
            where: {
                groupId: groupIdNum,
                exerciseType: "달리기"  // 달리기 기록만 필터링
            },
            include: {
                participant: true  // 참가자 정보 포함
            }
        });

        // 4. 참가자별 점수 집계
        // Map으로 참가자별 기록 그룹화
        const participantScores = new Map();

        records.forEach(record => {
            const participantId = record.participantId.toString();

            if (!participantScores.has(participantId)) {
                participantScores.set(participantId, {
                    participant: record.participant,
                    totalDuration: 0,
                    totalDistance: 0
                });
            }

            const scoreData = participantScores.get(participantId);
            scoreData.totalDuration += record.duration;
            scoreData.totalDistance += (record.distance || 0);  // null이면 0으로 처리
        });

        // 5. 점수 계산 및 배열 변환
        // 점수 공식: duration + (distance × 15)
        const scoresArray = Array.from(participantScores.values()).map(data => ({
            participant: data.participant,
            totalScore: data.totalDuration + (data.totalDistance * 15)
        }));

        // 6. 총점 기준 내림차순 정렬
        scoresArray.sort((a, b) => b.totalScore - a.totalScore);

        // 7. 순위 부여 및 Rank 객체로 변환
        const rankings = scoresArray.map((scoreData, index) =>
            Rank.fromParticipantEntity(
                scoreData.participant,
                scoreData.totalScore,
                index + 1  // 순위 (1, 2, 3, ...)
            )
        );

        // 8. 응답 반환
        res.status(200).json({
            message: "그룹 랭킹 조회 성공",
            rankings: rankings
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;