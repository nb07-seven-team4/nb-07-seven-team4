// src/routes/rank.js
export class Rank {
  constructor(participantId, nickname, recordCount, recordTime) {
    this.participantId = participantId;
    this.nickname = nickname;
    this.recordCount = recordCount; // 기록 횟수
    this.recordTime = recordTime;   // 누적 시간 (초 단위)
  }

  // Prisma 결과 → Rank 객체 생성
  static fromParticipantEntity(entity, recordCount, recordTime) {
    return new Rank(
      entity.id,
      entity.nickname,
      recordCount,
      recordTime
    );
  }
}
