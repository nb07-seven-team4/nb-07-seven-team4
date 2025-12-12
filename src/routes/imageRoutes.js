import express from "express";
import { upload } from "./multer.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { promises as fs } from "fs";
import path from "path";
import prisma from "../prismaClient.js";

const router = express.Router({ mergeParams: true });

/**
 * POST /images
 * 이미지 업로드 (API 명세서 기준)
 * - 여러 이미지 파일을 업로드하고 URL 배열을 반환
 * - Request Body: files (array)
 * - Response: { urls: ["string"] }
 */
router.post('/', upload.array('files', 10), async (req, res, next) => {
  try {
    // 파일이 업로드되지 않은 경우 예외
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'File should be an image file'
      });
    }

    // URL 생성 (환경변수 우선, fallback으로 req 사용)
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    // 업로드된 모든 파일의 URL 배열 생성
    const urls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);

    res.status(200).json({
      urls: urls
    });
  } catch (error) {
    // 업로드 중 에러 발생 시 모든 파일 삭제 (롤백)
    if (req.files) {
      for (const file of req.files) {
        const filePath = path.join('uploads', file.filename);
        await fs.unlink(filePath).catch(err => console.error('파일 삭제 실패:', err));
      }
    }
    next(error);
  }
});

/**
 * DELETE /images/:filename
 * 이미지 삭제
 * - 업로드된 이미지 파일을 서버에서 삭제
 */
router.delete("/:filename", async (req, res, next) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      throw new BadRequestError("파일명이 필요합니다");
    }

    // 파일 경로
    const filePath = path.join("uploads", filename);

    // 파일 존재 여부 확인
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new NotFoundError("이미지");
    }

    // 파일 삭제
    await fs.unlink(filePath);

    res.status(200).json({
      message: "이미지 삭제 성공",
      filename: filename,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /records/:recordId/images
 * 특정 운동 기록의 이미지 목록 조회
 * - record안의 images 배열을 url 변환하여 반환
 */
router.get("/records/:recordId/images", async (req, res, next) => {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError("기록 ID가 필요합니다");
    }

    // 숫자 형식 검증
    if (!/^\d+$/.test(recordId)) {
      throw new BadRequestError('ID가 유효하지 않습니다');
    }

    // bigint 변환 (스키마의 Record.id는 BigInt)
    const recordIdBigInt = BigInt(recordId);

    // 기록 조회 (스키마에 맞게 필드 조회)
    const record = await prisma.record.findUnique({
      where: { id: recordIdBigInt },
      select: {
        id: true,
        images: true,  // String[] 타입
        type: true,
        description: true,
        time: true,
        distance: true,
        createdAt: true
      }
    });

    if (!record) {
      throw new NotFoundError("운동 기록");
    }

    // 이미지 URL 배열 생성 (빈 문자열 필터링)
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrls = record.images
      .filter(filename => filename && filename.trim() !== '')  // 빈 문자열 제거
      .map(filename => ({
        filename: filename,
        url: `${baseUrl}/uploads/${filename}`
      }));

    res.status(200).json({
      recordId: Number(record.id),
      images: imageUrls,
      count: imageUrls.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
