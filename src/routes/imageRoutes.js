import express from "express";
import { upload } from "./multer.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { promises as fs } from "fs";
import path from "path";
import prisma from "../prismaClient.js";

const router = express.Router({ mergeParams: true });

/**
 * POST /images/upload
 * 이미지 업로드
 * - 단일 이미지 파일을 업로드하고 URL을 반환
 * - 최대 5mb, JPG/PNG/GIF/WEBP app.js에 정의
 */
router.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    // 파일이 업로드되지 않은 경우 예외
    if (!req.file) {
      throw new BadRequestError('이미지 파일이 필요합니다');
    }

    // 업로드된 파일 정보 가져와서 넣기
    const { filename, mimetype, size } = req.file;

    // URL 생성 (환경변수 우선, fallback으로 req 사용)
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${filename}`;

    res.status(201).json({
      message: '이미지 업로드 성공',
      imageUrl: imageUrl,
      filename: filename,
      metadata: {
        mimetype,
        //사이즈 정의
        size: `${(size / 1024).toFixed(2)} KB`
      }
    });
  } catch (error) {

    // 업로드 중 에러 발생 시 파일 삭제 (롤백) -> 대비 
    if (req.file) {
      const filePath = path.join('uploads', req.file.filename);
      await fs.unlink(filePath).catch(err => console.error('파일 삭제 실패:', err));
    }
    next(error);
  }
});

/**
 * DELETE /images/:filename
 * 이미지 삭제
 * - 업로드된 이미지 파일을 서버에서 삭제
 */
router.delete('/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      throw new BadRequestError('파일명이 필요합니다');
    }

    // 파일 경로
    const filePath = path.join('uploads', filename);

    // 파일 존재 여부 확인
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new NotFoundError('이미지');
    }

    // 파일 삭제
    await fs.unlink(filePath);

    res.status(200).json({
      message: '이미지 삭제 성공',
      filename: filename
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /images/records/:recordId/images
 * 특정 운동 기록의 이미지 목록 조회
 * - record안의 images 배열을 url 변환하여 반환
 */
router.get('/records/:recordId/images', async (req, res, next) => {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      throw new BadRequestError('기록 ID가 필요합니다');
    }

    // 숫자 형식 검증 // 없을 경우 cannot convert abc to a bigint 나와서 수정함
    if (!/^\d+$/.test(recordId)) {
      throw new BadRequestError('ID가 유효하지 않습니다');
    }

    // bigint 변환 -> 레코id bigint
    const recordIdBigInt = BigInt(recordId);

    // 기록 조회
    const record = await prisma.record.findUnique({
      where: { id: recordIdBigInt },
      select: {
        id: true,
        images: true
      }
    });

    if (!record) {
      throw new NotFoundError('운동 기록');
    }

    // 이미지 url 배열 생성
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrls = record.images.map(filename => ({
      filename: filename,
      url: `${baseUrl}/uploads/${filename}`
    }));

    res.status(200).json({
      message: '이미지 목록 조회 성공',
      recordId: record.id.toString(),
      images: imageUrls,
      count: imageUrls.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
