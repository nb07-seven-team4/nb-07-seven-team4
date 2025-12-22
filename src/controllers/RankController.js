// RankController.js
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import RankService from "../services/RankService.js";
import { Rank } from "../models/Rank.js";

class RankController {
  // GET /groups/:groupId/rank - 그룹 랭킹 조회 (달리기 기록 기반)
  async getRanking(req, res, next) {
    try {
      const { groupId } = req.params;

      const groupIdNum = parseInt(groupId, 10);
      if (isNaN(groupIdNum)) {
        throw new BadRequestError("ID가 유효하지 않습니다.");
      }

      const result = await RankService.getRanking(groupIdNum);

      if (!result.success) {
        throw new NotFoundError(result.error);
      }

      const rankings = result.data.map((data) =>
        Rank.fromParticipantEntity(
          data.participant,
          data.recordCount,
          data.totalTime
        )
      );

      res.status(200).json({
        message: "그룹 랭킹 조회 성공",
        rankings: rankings,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RankController();
