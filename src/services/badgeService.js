import prisma from "../prismaClient.js";

// 배지 유형 상수
export const BADGE_TYPES = {
  PARTICIPANT_10: "PARTICIPANT_10",
  RECORD_100: "RECORD_100",
  LIKE_100: "LIKE_100",
};

// 배지 구성 임계값
const BADGE_THRESHOLDS = {
  [BADGE_TYPES.PARTICIPANT_10]: 10,
  [BADGE_TYPES.RECORD_100]: 100,
  [BADGE_TYPES.LIKE_100]: 100,
};

/**
 * 그룹의 현재 인원수를 확인
 * @param {BigInt} groupId
 * @returns {Promise<{likeCount: number, recordCount: number, participantCount: number}>}
 */
async function getGroupCounts(groupId) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      _count: {
        select: {
          participants: true,
          records: true,
        },
      },
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  return {
    likeCount: group.likeCount,
    recordCount: group._count.records,
    participantCount: group._count.participants,
  };
}

/**
 * 그룹에 배지를 수여 (멱등성)
 * @param {BigInt} groupId
 * @param {string} badgeType
 * @returns {Promise<{awarded: boolean, badge: object}>}
 */
export async function awardBadge(groupId, badgeType) {
  try {
    // upsert를 사용하여 멱등성을 확보 - [groupId, type]에 대한 고유 제약 조건
    const badge = await prisma.badge.upsert({
      where: {
        groupId_type: {
          groupId: groupId,
          type: badgeType,
        },
      },
      update: {}, // 이미 존재하는 경우 업데이트하지 않습니다
      create: {
        type: badgeType,
        groupId: groupId,
      },
    });

    // 배지가 방금 생성(수여)되었는지 아니면 이미 존재했는지 확인
    const isNewBadge = badge.earnedAt.getTime() > Date.now() - 1000; // 방금 전에 생성되었습니다

    return {
      awarded: isNewBadge,
      badge: badge,
    };
  } catch (error) {
    console.error(`Error awarding badge ${badgeType} to group ${groupId}:`, error);
    throw error;
  }
}

/**
 * 그룹에 속한 모든 적격 배지를 확인하고 수여
 * @param {BigInt} groupId
 * @returns {Promise<{newBadges: object[], allBadges: object[]}>}
 */
export async function checkAndAwardBadges(groupId) {
  const counts = await getGroupCounts(groupId);
  const newBadges = [];

  // PARTICIPANT_10 배지를 확인
  if (counts.participantCount >= BADGE_THRESHOLDS[BADGE_TYPES.PARTICIPANT_10]) {
    const result = await awardBadge(groupId, BADGE_TYPES.PARTICIPANT_10);
    if (result.awarded) {
      newBadges.push(result.badge);
    }
  }

  // RECORD_100 배지를 확인
  if (counts.recordCount >= BADGE_THRESHOLDS[BADGE_TYPES.RECORD_100]) {
    const result = await awardBadge(groupId, BADGE_TYPES.RECORD_100);
    if (result.awarded) {
      newBadges.push(result.badge);
    }
  }

  // 좋아요 100개 배지를 확인
  if (counts.likeCount >= BADGE_THRESHOLDS[BADGE_TYPES.LIKE_100]) {
    const result = await awardBadge(groupId, BADGE_TYPES.LIKE_100);
    if (result.awarded) {
      newBadges.push(result.badge);
    }
  }

  // 그룹의 현재 배지를 모두 획득
  const allBadges = await prisma.badge.findMany({
    where: { groupId: groupId },
    orderBy: { earnedAt: 'asc' },
  });

  return {
    newBadges: newBadges,
    allBadges: allBadges,
  };
}

/**
 * 배지를 수여하지 않고도 배지 자격 상태를 확인
 * @param {BigInt} groupId
 * @returns {Promise<object>}
 */
export async function getBadgeStatus(groupId) {
  const counts = await getGroupCounts(groupId);

  const currentBadges = await prisma.badge.findMany({
    where: { groupId: groupId },
  });

  const earnedBadgeTypes = new Set(currentBadges.map(b => b.type));

  return {
    counts: counts,
    eligibility: {
      [BADGE_TYPES.PARTICIPANT_10]: {
        eligible: counts.participantCount >= BADGE_THRESHOLDS[BADGE_TYPES.PARTICIPANT_10],
        earned: earnedBadgeTypes.has(BADGE_TYPES.PARTICIPANT_10),
        progress: counts.participantCount,
        threshold: BADGE_THRESHOLDS[BADGE_TYPES.PARTICIPANT_10],
      },
      [BADGE_TYPES.RECORD_100]: {
        eligible: counts.recordCount >= BADGE_THRESHOLDS[BADGE_TYPES.RECORD_100],
        earned: earnedBadgeTypes.has(BADGE_TYPES.RECORD_100),
        progress: counts.recordCount,
        threshold: BADGE_THRESHOLDS[BADGE_TYPES.RECORD_100],
      },
      [BADGE_TYPES.LIKE_100]: {
        eligible: counts.likeCount >= BADGE_THRESHOLDS[BADGE_TYPES.LIKE_100],
        earned: earnedBadgeTypes.has(BADGE_TYPES.LIKE_100),
        progress: counts.likeCount,
        threshold: BADGE_THRESHOLDS[BADGE_TYPES.LIKE_100],
      },
    },
    badges: currentBadges,
  };
}
