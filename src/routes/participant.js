export class Participant {
  constructor(id, groupId, nickname, password, joinedAt) {
    this.id = id;
    this.groupId = groupId;
    this.nickname = nickname;
    this.password = password;
    this.joinedAt = joinedAt;
  }

  static fromParticipant({ id, groupId, nickname, password, joined_at }) {
    const info = {
      id: id.toString(),
      groupId: groupId.toString(),
      nickname,
      password,
      joinedAt: joined_at,
    };
    return new Participant(info.id, info, groupId, info.joinedAt);
  }
}
