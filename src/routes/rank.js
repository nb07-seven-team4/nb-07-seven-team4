// src/routes/rank.js
export class Rank {
  constructor(participantId, nickname, totalScore, rank) {
    this.participantId = participantId; // 이미 string 상태..
    this.nickname = nickname;
    this.totalScore = totalScore;
    this.rank = rank;
  }

  // Prisma 결과 → Rank 객체 생성 (const info 사용)
  static fromParticipantEntity(entity, totalScore, rank) {
    const info = {
      participantId: entity.id?.toString(),
      nickname: entity.nickname,
      totalScore,
      rank
    };

    return new Rank(
      info.participantId,
      info.nickname,
      info.totalScore,
      info.rank
    );
  }


}
