// RecordService.js
import prisma from "../prismaClient.js";
import { awardBadge, BADGE_TYPES } from "./badgeService.js";

class RecordService {
  /**
   * 운동 기록 생성 (참가자 인증 포함)
   */
  async createRecord(groupId, recordData, authorNickname, authorPassword) {
    // 참가자 인증
    const participant = await prisma.participant.findUnique({
      where: {
        groupId_nickname: {
          groupId: groupId,
          nickname: authorNickname,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "유효하지 않은 닉네임입니다." };
    }

    if (participant.password !== authorPassword) {
      return { success: false, error: "비밀번호가 일치하지 않습니다." };
    }

    const participantId = participant.id;

    // 운동 기록 생성
    const postRecord = await prisma.record.create({
      data: {
        type: recordData.exerciseType,
        description: recordData.description || "",
        time: recordData.time,
        distance: recordData.distance,
        images: recordData.photos || [],
        group: { connect: { id: groupId } },
        participant: { connect: { id: participantId } },
      },
      include: {
        participant: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    // 기록 100개 달성 시 배지 수여
    const recordCount = await prisma.record.count({
      where: { groupId: groupId },
    });

    if (recordCount >= 100) {
      await awardBadge(groupId, BADGE_TYPES.RECORD_100);
    }

    return { success: true, record: postRecord };
  }

  /**
   * 운동 기록 목록 조회 (페이지네이션, 검색, 필터링)
   */
  async getRecords(groupId, options) {
    const {
      page = 1,
      limit = 10,
      search = "",
      exerciseType = "",
      participantNickname = "",
      sortBy = "createdAt",
      order = "desc",
    } = options;

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const andConditions = [{ groupId: groupId }];

    if (exerciseType) {
      andConditions.push({
        type: { contains: exerciseType, mode: "insensitive" },
      });
    }

    if (participantNickname) {
      andConditions.push({
        participant: {
          nickname: { contains: participantNickname, mode: "insensitive" },
        },
      });
    }

    if (search) {
      andConditions.push({
        OR: [
          { type: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const whereConditions = {
      AND: andConditions,
    };

    // 전체 개수 조회
    const totalCount = await prisma.record.count({
      where: whereConditions,
    });

    // 기록 목록 조회
    const records = await prisma.record.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      include: {
        participant: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    return { records, totalCount, page, limit };
  }

  /**
   * 운동 기록 상세 조회
   */
  async getRecordById(groupId, recordId) {
    const record = await prisma.record.findUnique({
      where: {
        id: recordId,
        groupId: groupId,
      },
      include: {
        participant: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return record;
  }
}

export default new RecordService();
