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
    
    const awardedBadges = []; 

    if (likeCount >= config.likeCount) {
        awardedBadges.push(badges.like);
    } 
    if (records >= config.records) {
        awardedBadges.push(badges.records);
    }
    if (participants >= config.participants) {
        awardedBadges.push(badges.participants);
    }
    return awardedBadges; 
}

export function getBadgeStatus(req, res, next) {
 
  try {
    const likeCount = parseInt(req.query.likeCount || 0);
    const records = parseInt(req.query.records || 0);
    const participants = parseInt(req.query.participants || 0);

    if (isNaN(likeCount) || isNaN(records) || isNaN(participants)) {
      return res.status(400).json({ message: "유효하지 않은 입력 값입니다." });
    }

    const awardedBadges = checkBadge(likeCount, records, participants);
    
    const message = awardedBadges.length > 0 
            ? `${awardedBadges.join(', ')} 뱃지를 획득했습니다.`
            : "획득한 뱃지가 없습니다.";

    res.status(200).json({
      success: true,
      badge: awardedBadges || "None",
      message: message
    });

  } catch (e) {
    next(e);
  }
}

export default router;