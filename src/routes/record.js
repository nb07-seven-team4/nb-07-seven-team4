// record
export class Record {
  constructor(
    id,
    type,
    time,
    duration,
    distance,
    images,
    createdAt,
    groupId,
    participantId
  ) {
    this.id = id;
    this.type = type;
    this.description = description;
    this.time = time;
    this.distance = distance;
    this.images = images;
    this.createdAt = createdAt;
    this.groupId = groupId;
    this.participantId = participantId;
  }

  static fromEntity({
    id,
    type,
    description,
    time,
    distance,
    images,
    createdAt,
    groupId,
    participantId,
  }) {
    const info = {
      id: id.toString(),
      type,
      description,
      time,
      distance,
      images,
      createdAt: createdAt,
      groupId: groupId.toString(),
      participantId: participantId.toString(),
    };

    validateRecordInfo(info);
    return new Record(
      info.id,
      info.type,
      info.description,
      info.time,
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

function validateType(type) {
  if (!type) {
    throw new Error("운동 종류를 입력해주세요.");
  }
}

function validateDescription(description) {
  // description은 선택 필드 (스키마: String?)
  // 빈 문자열이나 undefined 허용
  if (description !== undefined && typeof description !== "string") {
    throw new Error("내용은 문자열이어야 합니다.");
  }
}

function validateTime(time) {
  if (!time || typeof time !== "number" || time <= 0) {
    throw new Error("운동 시간은 양수여야 합니다.");
  }
}

function validateDistance(distance) {
  // distance는 선택 필드 (스키마: Float?)
  if (distance !== undefined && distance !== null) {
    if (typeof distance !== "number" || distance < 0) {
      throw new Error("거리는 0 이상의 숫자여야 합니다.");
    }
  }
}

function validateImages(images) {
  // images는 필수 배열 필드 (스키마: String[])
  if (!Array.isArray(images)) {
    throw new Error("이미지는 배열이어야 합니다.");
  }
  // 각 이미지가 문자열인지 확인
  if (images.some((img) => typeof img !== "string")) {
    throw new Error("모든 이미지는 문자열(URL)이어야 합니다.");
  }
}

//임시 날짜?
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
  type,
  description,
  time,
  distance,
  images,
  createdAt,
  groupId,
  participantId,
}) {
  validateId(id);
  validateType(type);
  validateDescription(description);
  validateTime(time);
  validateDistance(distance);
  validateImages(images);
  validateCreatedAt(createdAt);
  validateGroupId(groupId);
  validateParticipantId(participantId);
}
