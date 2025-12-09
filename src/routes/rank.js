// src/routes/rank.js
export class Rank {
  constructor(participantId, nickname, totalScore, rank) {
    this.participantId = participantId;
    this.nickname = nickname;
    this.totalScore = totalScore;
    this.rank = rank;
  }

  // Prisma 데이터 + 점수 정리 후 Rank 객체로 변환
  static fromParticipantEntity(entity, totalScore, rank) {
    return new Rank(
      entity.id,
      entity.nickname,
      totalScore,
      rank
    );
  }

  // JSON 응답 포맷
  toJSON() {
    return {
      participantId: this.participantId?.toString(),
      nickname: this.nickname,
      totalScore: this.totalScore,
      rank: this.rank,
    };
  }

  toInfo() {
    return {
      id: this.participantId?.toString(),
      nickname: this.nickname,
      totalScore: this.totalScore,
      rank: this.rank,
    };
  }


  //유효성- 계산결과값이라서 유효성 검사 불필요?
}
