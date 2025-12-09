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

  // JSON 변환 (안전한 형태 유지 위한)
  toJSON() {
    const info = {
      participantId: this.participantId, // 이미 string,.,,
      nickname: this.nickname,
      totalScore: this.totalScore,
      rank: this.rank,
    };

    return info;
  }

  // 문자열 디버깅용 불필?
  toString() {
    return `Rank(participantId=${this.participantId}, nickname=${this.nickname}, totalScore=${this.totalScore}, rank=${this.rank})`;
  }
}
