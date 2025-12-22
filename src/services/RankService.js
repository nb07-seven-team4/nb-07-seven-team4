// RankService.js
import prisma from "../prismaClient.js";

class RankService {
  /**
   * 그룹 랭킹 조회 (누적 시간 기준)
   */
  async getRanking(groupId) {
    // 그룹 존재 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return { success: false, error: "그룹을 찾을 수 없습니다." };
    }

    // 모든 운동 기록 조회
    const records = await prisma.record.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        participant: true,
      },
    });

    // 참가자별 데이터 집계
    const participantData = new Map();

    // records 순회
    records.forEach((record) => {
      const participantId = record.participantId.toString();

      if (!participantData.has(participantId)) {
        participantData.set(participantId, {
          participant: record.participant,
          recordCount: 0,
          totalTime: 0,
        });
      }

      const data = participantData.get(participantId);
      data.recordCount += 1;
      data.totalTime += record.time || 0;
    });

    // 배열로 변환 및 정렬
    const dataArray = Array.from(participantData.values());
    dataArray.sort((a, b) => b.totalTime - a.totalTime);

    return { success: true, data: dataArray };
  }
}

export default new RankService();
