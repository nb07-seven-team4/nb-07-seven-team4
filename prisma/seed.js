import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("../generated/prisma/index.js");

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new pkg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // 기존 데이터 삭제 (개발 환경에서만!)
  if (process.env.NODE_ENV === 'development') {
    await prisma.record.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.group.deleteMany();
    console.log('✅ Cleaned existing data');
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 샘플 그룹 생성
  const group1 = await prisma.group.create({
    data: {
      name: '아침 러닝 크루',
      description: '매일 아침 6시에 함께 달리는 모임입니다!',
      nickname: '운동왕김철수',
      password: hashedPassword,
      image: 'https://via.placeholder.com/300',
      tags: ['러닝', '아침', '건강'],
      targetCount: 100,
      discordWebhookUrl: null,
      discordInviteUrl: null,
      recommendations: 15,
    },
  });

  const group2 = await prisma.group.create({
    data: {
      name: '헬스장 단골들',
      description: '근력 운동을 사랑하는 사람들의 모임',
      nickname: '근육맨박영희',
      password: hashedPassword,
      image: 'https://via.placeholder.com/300',
      tags: ['헬스', '근력', '다이어트'],
      targetCount: 50,
      recommendations: 8,
    },
  });

  console.log(`✅ Created ${2} groups`);

  // 샘플 참여자 생성
  const participant1 = await prisma.participant.create({
    data: {
      nickname: '달리기조아',
      password: hashedPassword,
      groupId: group1.id,
    },
  });

  const participant2 = await prisma.participant.create({
    data: {
      nickname: '헬창이',
      password: hashedPassword,
      groupId: group2.id,
    },
  });

  console.log(`✅ Created ${2} participants`);

  // 샘플 운동 기록 생성
  await prisma.record.create({
    data: {
      exerciseType: '달리기',
      description: '오늘은 5km 완주했습니다!',
      duration: 1800, // 30분 (초 단위)
      distance: 5.0,
      images: ['https://via.placeholder.com/400'],
      groupId: group1.id,
      participantId: participant1.id,
    },
  });

  await prisma.record.create({
    data: {
      exerciseType: '수영',
      description: '자유형 연습',
      duration: 2400, // 40분
      distance: 1.5,
      images: [],
      groupId: group1.id,
      participantId: participant1.id,
    },
  });

  console.log(`✅ Created ${2} records`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

