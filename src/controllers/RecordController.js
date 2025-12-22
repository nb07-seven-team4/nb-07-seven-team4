// RecordController.js
import RecordService from "../services/RecordService.js";

class RecordController {
  // POST /groups/:groupId/records - 운동 기록 생성
  async createRecord(req, res, next) {
    const {
      exerciseType,
      description,
      time,
      distance,
      photos,
      authorNickname,
      authorPassword,
    } = req.body;

    try {
      const groupId = BigInt(req.params.groupId);

      const result = await RecordService.createRecord(
        groupId,
        { exerciseType, description, time, distance, photos },
        authorNickname,
        authorPassword
      );

      if (!result.success) {
        return res.status(401).json({ message: result.error });
      }
      // 기록 데이터 매핑
      const recordData = {
        id: String(result.record.id),
        exerciseType: result.record.type,
        description: result.record.description,
        time: result.record.time,
        distance: result.record.distance,
        photos: result.record.images,
        createdAt: result.record.createdAt,
        author: {
          id: String(result.record.participant.id),
          nickname: result.record.participant.nickname,
        },
      };

      res.status(201).json({
        success: true,
        data: [recordData],
        message: "운동 기록이 성공적으로 등록되었습니다.",
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /groups/:groupId/records - 운동 기록 목록 조회 및 검색 (페이지네이션 지원)
  async getRecords(req, res, next) {
    try {
      const groupId = BigInt(req.params.groupId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const exerciseType = req.query.exerciseType || "";
      const participantNickname = req.query.participantNickname || "";
      const clientSortBy = req.query.orderBy || req.query.sortBy || "createdAt";
      const order = req.query.order || "desc";

      const sortMap = {
        createdAt: "createdAt",
        time: "time",
      };
      const sortBy = sortMap[clientSortBy] ? sortMap[clientSortBy] : "createdAt";
      // 기록 조회
      const result = await RecordService.getRecords(groupId, {
        page,
        limit,
        search,
        exerciseType,
        participantNickname,
        sortBy,
        order,
      });

      const mappedRecords = result.records.map((records) => ({
        id: String(records.id),
        exerciseType: records.type,
        description: records.description,
        time: records.time,
        distance: records.distance,
        photos: records.images,
        createdAt: records.createdAt,
        author: {
          id: String(records.participant.id),
          nickname: records.participant.nickname,
        },
      }));

      res.status(200).json({
        success: true,
        data: mappedRecords,
        pagination: {
          currentPage: result.page,
          totalPages: Math.ceil(result.totalCount / result.limit),
          totalCount: result.totalCount,
          limit: result.limit,
          hasNext: result.page < Math.ceil(result.totalCount / result.limit),
          hasPrev: result.page > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /groups/:groupId/records/:recordId - 운동 기록 상세 조회
  async getRecordById(req, res, next) {
    const groupId = BigInt(req.params.groupId);
    const recordId = BigInt(req.params.recordId);

    try {
      const record = await RecordService.getRecordById(groupId, recordId);

      if (!record) {
        return res
          .status(404)
          .json({ success: false, message: "기록이 없습니다.." });
      }
      // 기록 데이터 매핑
      const recordData = {
        id: Number(record.id),
        exerciseType: record.type,
        description: record.description,
        time: record.time,
        distance: record.distance,
        photos: record.images,
        author: {
          id: Number(record.participant.id),
          nickname: record.participant.nickname,
        },
      };

      res.status(200).json({
        success: true,
        data: recordData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RecordController();
