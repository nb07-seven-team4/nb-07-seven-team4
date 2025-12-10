import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// BigInt 직렬화 처리
BigInt.prototype.toJSON = function() {
  return this.toString();
};

async function main() {
  console.log('🌱 Seeding database...');

  // 기존 데이터 삭제 (선택사항)
  await prisma.badge.deleteMany();
  await prisma.record.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.group.deleteMany();

  console.log('✅ Cleaned existing data');

  // 1. 그룹 생성
  const group1 = await prisma.group.create({
    data: {
      name: '아침 러닝 크루',
      description: '매일 아침 5km 달리기를 목표로 하는 그룹입니다',
      nickname: '러닝마스터',
      password: 'password123',
      image: 'https://example.com/group-image.jpg',
      tags: ['러닝', '아침', '건강'],
      targetCount: 30,
      discordWebhookUrl: 'https://discord.com/api/webhooks/123456',
      discordInviteUrl: 'https://discord.gg/abc123',
      recommendations: 5,
    },
  });

  const group2 = await prisma.group.create({
    data: {
      name: '저녁 요가 모임',
      description: '퇴근 후 요가로 힐링하기',
      nickname: '요가마스터',
      password: 'yoga123',
      image: 'https://example.com/yoga.jpg',
      tags: ['요가', '저녁', '힐링'],
      targetCount: 20,
      discordWebhookUrl: 'https://discord.com/api/webhooks/yoga',
      discordInviteUrl: 'https://discord.gg/yoga',
      recommendations: 3,
    },
  });

  const group3 = await prisma.group.create({
    data: {
      name: '주말 등산대',
      description: '주말마다 산 정복하기',
      nickname: '산악인',
      password: 'mountain123',
      image: 'https://example.com/mountain.jpg',
      tags: ['등산', '주말', '자연'],
      targetCount: 15,
      discordWebhookUrl: 'https://discord.com/api/webhooks/mountain',
      discordInviteUrl: 'https://discord.gg/mountain',
      recommendations: 8,
    },
  });

  console.log('✅ Created groups');

  // 2. 참가자 생성
  const participants = await Promise.all([
    prisma.participant.create({
      data: {
        nickname: '김민기',
        password: 'pass1',
        groupId: group1.id,
      },
    }),
    prisma.participant.create({
      data: {
        nickname: '이철수',
        password: 'pass2',
        groupId: group1.id,
      },
    }),
    prisma.participant.create({
      data: {
        nickname: '박영희',
        password: 'pass3',
        groupId: group1.id,
      },
    }),
    prisma.participant.create({
      data: {
        nickname: '최요가',
        password: 'yoga1',
        groupId: group2.id,
      },
    }),
    prisma.participant.create({
      data: {
        nickname: '정명상',
        password: 'yoga2',
        groupId: group2.id,
      },
    }),
    prisma.participant.create({
      data: {
        nickname: '강등산',
        password: 'mountain1',
        groupId: group3.id,
      },
    }),
  ]);

  console.log('✅ Created participants');

  // 3. 운동 기록 생성
  await Promise.all([
    prisma.record.create({
      data: {
        exerciseType: '러닝',
        description: '한강 아침 러닝',
        duration: 30,
        distance: 5.2,
        images: ['https://example.com/run1.jpg'],
        groupId: group1.id,
        participantId: participants[0].id,
      },
    }),
    prisma.record.create({
      data: {
        exerciseType: '러닝',
        description: '올림픽공원 러닝',
        duration: 45,
        distance: 7.5,
        images: ['https://example.com/run2.jpg', 'https://example.com/run3.jpg'],
        groupId: group1.id,
        participantId: participants[0].id,
      },
    }),
    prisma.record.create({
      data: {
        exerciseType: '러닝',
        description: '동네 조깅',
        duration: 20,
        distance: 3.0,
        images: [],
        groupId: group1.id,
        participantId: participants[1].id,
      },
    }),
    prisma.record.create({
      data: {
        exerciseType: '요가',
        description: '하타 요가 수련',
        duration: 90,
        distance: null,
        images: [],
        groupId: group2.id,
        participantId: participants[3].id,
      },
    }),
    prisma.record.create({
      data: {
        exerciseType: '등산',
        description: '북한산 등반',
        duration: 180,
        distance: 8.5,
        images: ['https://example.com/mountain1.jpg'],
        groupId: group3.id,
        participantId: participants[5].id,
      },
    }),
  ]);

  console.log('✅ Created records');

  // 4. 배지 생성
  await Promise.all([
    prisma.badge.create({
      data: {
        type: '7일 연속 달성',
        groupId: group1.id,
      },
    }),
    prisma.badge.create({
      data: {
        type: '첫 100km 달성',
        groupId: group1.id,
      },
    }),
    prisma.badge.create({
      data: {
        type: '30일 연속 수련',
        groupId: group2.id,
      },
    }),
    prisma.badge.create({
      data: {
        type: '정상 정복',
        groupId: group3.id,
      },
    }),
  ]);

  console.log('✅ Created badges');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });