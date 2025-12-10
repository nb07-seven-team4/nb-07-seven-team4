// record
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

  static fromEntity({
    id,
    exerciseType,
    description,
    duration,
    distance,
    images,
    createdAt,
    groupId,
    participantId,
  }) {
    const info = {
      id: id.toString(),
      exerciseType,
      description,
      duration,
      distance,
      images,
      createdAt: createdAt,
      groupId: groupId.toString(),
      participantId: participantId.toString(),
    };

    validateRecordInfo(info);
    return new Record(
      info.id,
      info.exerciseType,
      info.description,
      info.duration,
      info.distance,
      info.images,
      info.createdAt,
      info.groupId,
      info.participantId
    );
  }
}

// ------------------유효성 검사 -------------------------
// 추가

function validateId(id) {
  if (typeof id !== "string") {
    throw new Error(`ID는 String 타입이어야 합니다. 현재 타입 : ${typeof id}`);
  }
}

function validateExcerciseType(exerciseType) {
  if (!exerciseType) {
    throw new Error("운동 종류를 입력해주세요.");
  }
}

function validateDescription(description) {
  if (!description) {
    throw new Error("내용을 입력해주세요.");
  }
}

function validateDuration(duration) {
  if (!duration) {
    throw new Error("기록을 입력해주세요.");
  }
}

function validateDistance(distance) {
  if (!distance) {
    throw new Error("거리를 입력해주세요.");
  }
}

function validateImages(images) {
  if (!images) {
    throw new Error("이미지를 입력해주세요.");
  }
}

function validateCreatedAt(createdAt) {
  if (new Date("2024-01-01") > createdAt) {
    throw new Error(`Invalid createdAt ${createdAt.toString()}`);
  }
}

function validateGroupId(groupId) {
  if (typeof groupId !== "string") {
    throw new Error(
      `ID는 String 타입이어야 합니다. 현재 타입 : ${typeof groupId}`
    );
  }
}

function validateParticipantId(participantId) {
  if (typeof participantId !== "string") {
    throw new Error(
      `ID는 String 타입이어야 합니다. 현재 타입 : ${typeof participantId}`
    );
  }
}

function validateRecordInfo({
  id,
  exerciseType,
  description,
  duration,
  distance,
  images,
  createdAt,
  groupId,
  participantId,
}) {
  validateId(id);
  validateExcerciseType(exerciseType);
  validateDescription(description);
  validateDuration(duration);
  validateDistance(distance);
  validateImages(images);
  validateCreatedAt(createdAt);
  validateGroupId(groupId);
  validateParticipantId(participantId);
}
