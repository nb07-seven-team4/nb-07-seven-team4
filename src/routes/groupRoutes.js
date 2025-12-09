const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

export class group {
  constructor (id, name, description, nidckname, password, image, tags, targetCount, discordWebhookUrl, discordInviteUrl, createdAt, updatedAt){
      this.id = id; 
      this.name = name; 
      this.description = description; 
      this.nickname = nidckname;
      this.password = password; 
      this.image = image;
      this.tags = tags; 
      this.targetCount = targetCount; 
      this.discordWebhookUrl = discordWebhookUrl; 
      this.discordInviteUrl = discordInviteUrl;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    static fromEntity({ id, title, content, created_at }) {
    const info = {
      id: id.toString(), // bigInt => string
      title,
      content,
      createdAt: created_at, // created_at => createdAt
    };
    validateArticleInfo(info);
    // 출입국 심사... imigration입니다...

    return new Article(info.id, info.title, info.content, info.createdAt);
  }
}


// POST /groups - 그룹 생성
router.post('/', async (req, res, next) => {
  const {id, name, description, nickname, password, image, tags, targetCount, discordWebhookUrl, discordInviteUrl} = req.body;
  const groupData = {id, name, description, nickname, password, image, tags, targetCount, discordWebhookUrl, discordInviteUrl};
  // 위 항목이 공란일 때 
  
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    const newGroup = await prisma.groupData.create ({
      data: groupData,
    });    
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

// GET /groups - 그룹 목록 조회
// (그룹명, 닉네임, 사진, 태그, 목표 횟수, 추천수, 참여자수)
router.get('/', async (req, res, next) => {
  
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    const groupList = await prisma.group.findMany
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

// GET /groups/:groupId - 그룹 상세 조회
router.get('/:groupId', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

// PATCH /groups/:groupId - 그룹 수정
router.patch('/:groupId', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

// DELETE /groups/:groupId - 그룹 삭제
router.delete('/:groupId', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 1 - 하동우)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

// POST /groups/:groupId/likes - 그룹 추천
router.post('/:groupId/likes', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 2 - 이서준)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

// DELETE /groups/:groupId/likes - 그룹 추천 취소
router.delete('/:groupId/likes', async (req, res, next) => {
  try {
    // TODO: 구현 예정 (Member 2 - 이서준)
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
