import express from "express";

const router = express.Router({ mergeParams: true });

const badges = {
  like: likeBadge,
  records: recordBadge,
  participants: participantBadge,
};

const config = {
  likeCount: 100,
  records: 100,
  participants: 10,
};

export function badge(likeCount, records, participants) {
  if (likeCount >= config.likeCount) {
    return badges.like;
  } else if (records >= config.records) {
    return badges.records;
  } else if (participants >= config.participants) {
    return badges.participants;
  }
}

function getBadgeStatus(req, res, next) {
  try {
    const likeCount = parseInt(req.query.likeCount || 0);
    const records = parseInt(req.query.records || 0);
    const participants = parseInt(req.query.participants || 0);

    if (isNaN(likeCount) || isNaN(records) || isNaN(participants)) {
      return res.status(400).json({ message: "유효하지 않은 입력 값입니다." });
    }

    const awardedBadge = checkBadge(likeCount, records, participants);

    res.status(200).json({
      success: true,
      badge: awardedBadge || "None",
      message: awardedBadge
        ? `${awardedBadge} 뱃지를 획득했습니다.`
        : "획득한 뱃지가 없습니다.",
    });
  } catch (e) {
    next(e);
  }
}
