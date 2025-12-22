// ParticipantService.js
import prisma from "../prismaClient.js";
import { awardBadge, BADGE_TYPES } from "./badgeService.js";

class ParticipantService {
  /**
   * 그룹 참여 (닉네임 중복 확인 포함)
   */
  async joinGroup(groupId, nickname, password) {
    // 닉네임 중복 확인
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        groupId: groupId,
        nickname: nickname,
      },
    });

    if (existingParticipant) {
      return { success: false, error: "이미 사용중인 닉네임" };
    }

    // 그룹 존재 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return { success: false, error: "존재하지 않는 그룹 ID입니다." };
    }

    // 참가자 생성
    const newParticipant = await prisma.participant.create({
      data: {
        groupId: groupId,
        nickname: nickname,
        password: password,
      },
    });

    // 참가자 수 확인 및 배지 수여
    const participantCount = await prisma.participant.count({
      where: { groupId: groupId },
    });

    if (participantCount >= 10) {
      await awardBadge(BigInt(groupId), BADGE_TYPES.PARTICIPANT_10);
    }

    // 응답용 그룹 데이터 조회
    const responseGroupData = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
        badges: true,
      },
    });

    return { success: true, data: responseGroupData };
  }

  /**
   * 그룹 탈퇴 (인증 포함)
   */
  async leaveGroup(groupId, nickname, password) {
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        groupId: groupId,
        nickname: nickname,
        password: password,
      },
    });

    if (!existingParticipant) {
      return { success: false, error: "그룹참여자 닉네임이 아닙니다." };
    }

    await prisma.participant.delete({
      where: {
        id: existingParticipant.id,
      },
    });

    return { success: true };
  }
}

export default new ParticipantService();
