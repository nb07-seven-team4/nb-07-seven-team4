export class Record {
  constructor(
    id,
    exerciseType,
    description,
    duration,
    distance,
    images,
    createdAt,
    groupId,
    participantId
  ) {
    this.id = id;
    this.exerciseType = exerciseType;
    this.description = description;
    this.duration = duration;
    this.distance = distance;
    this.images = images;
    this.createdAt = createdAt;
    this.groupId = groupId;
    this.participantId = participantId;
  }
}
