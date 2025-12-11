export class Group {
  constructor(
    id,
    name,
    description,
    nickname,
    password,
    photoUrl,
    tags,
    goalRep,
    discordWebhookUrl,
    discordInviteUrl,
    likeCount,
    ownerId,
    createdAt,
    updatedAt,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.nickname = nickname;
    this.password = password;
    this.photoUrl = photoUrl;
    this.tags = tags;
    this.goalRep = goalRep;
    this.discordWebhookUrl = discordWebhookUrl;
    this.discordInviteUrl = discordInviteUrl;
    this.likeCount = likeCount;
    this.ownerId = ownerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromEntity({
    id,
    name,
    description,
    nickname,
    password,
    photoUrl,
    tags,
    goalRep,
    discordWebhookUrl,
    discordInviteUrl,
    likeCount,
    ownerId,
    createdAt,
    updatedAt,
  }) {
    const info = {
      id: id.toString(),
      name,
      description,
      nickname,
      password,
      photoUrl,
      tags,
      goalRep,
      discordWebhookUrl,
      discordInviteUrl,
      likeCount,
      ownerId: ownerId.toString(),
      createdAt,
      updatedAt,
    };

    return new Group(
      info.id,
      info.name,
      info.description,
      info.nickname,
      info.password,
      info.photoUrl,
      info.tags,
      info.goalRep,
      info.discordWebhookUrl,
      info.discordInviteUrl,
      info.likeCount,
      info.ownerId,
      info.createdAt,
      info.updatedAt,
    );
  }
}
