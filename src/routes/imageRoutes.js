import { Router } from 'express';
//가져올 사용자 데이터
import ParticipantController from '../controllers/ParticipantController.js';

// 그룹 참여자 가입 user id
router.post('/', controller.joinGroup);

// 그룹 참여자 목록 조회 // group -> users
router.get('/', controller.getParticipants);

// 참여자 인증 (예: 비밀번호 검증) // user id로 대체되는가?
router.post('/verify', controller.verifyParticipant);

export default router;
