import { Router } from 'express';
//group controller 통해서 가져올 데이터
import GroupController from '../controllers/GroupController.js';

const router = Router();
const controller = new GroupController();

// 그룹 생성
router.post('/', controller.createGroup);

// 전체 그룹 목록 조회
router.get('/', controller.getAllGroups);

// 특정 그룹 조회
router.get('/:groupId', controller.getGroupById);

// 그룹 추천수 증가
router.patch('/:groupId/recommend', controller.incrementRecommend);

export default router;
