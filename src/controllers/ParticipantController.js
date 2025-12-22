// ParticipantController.js
import { BadRequestError, NotFoundError, ConflictError } from "../utils/errors.js";
import ParticipantService from "../services/ParticipantService.js";

class ParticipantController {
  // POST /groups/:groupId/participants - 그룹 참여
  async joinGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const { nickname, password } = req.body;
      const idToNum = parseInt(groupId, 10);

      if (isNaN(idToNum)) {
        throw new BadRequestError("ID가 유효하지 않습니다.");
      }
      if (!groupId || !nickname || !password) {
        throw new BadRequestError("요청이 올바르지 않습니다.");
      }

      const result = await ParticipantService.joinGroup(idToNum, nickname, password);

      if (!result.success) {
        if (result.error === "이미 사용중인 닉네임") {
          throw new ConflictError(result.error);
        }
        if (result.error === "존재하지 않는 그룹 ID입니다.") {
          throw new NotFoundError(result.error);
        }
        throw new BadRequestError(result.error);
      }

      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /groups/:groupId/participants - 그룹 참여 취소
  async leaveGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const { nickname, password } = req.body;
      const idToNum = parseInt(groupId, 10);

      if (isNaN(idToNum)) {
        throw new BadRequestError("ID가 유효하지 않습니다.");
      }
      if (!groupId || !nickname || !password) {
        throw new BadRequestError("요청이 올바르지 않습니다.");
      }

      const result = await ParticipantService.leaveGroup(idToNum, nickname, password);

      if (!result.success) {
        throw new NotFoundError(result.error);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ParticipantController();
