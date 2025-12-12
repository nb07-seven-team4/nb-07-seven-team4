// 편집 하셔서 사용바랍니다.
import { prisma } from "./prisma.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function main() {
  console.log("🌱 Seeding...");

  // 기존 데이터 삭제 (테스트를 위해)
  await prisma.record.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.group.deleteMany({});

  console.log("✅ 기존 데이터 삭제 완료");

  // 1. 테스트용 그룹 생성
  const testGroup = await prisma.group.create({
    data: {
      name: "런닝 크루 테스트",
      description: "이미지 업로드 및 랭킹 테스트를 위한 그룹",
      nickname: "관리자",
      password: "test1234",
      image: "https://example.com/group.jpg",
      tags: ["런닝", "테스트", "건강"],
      targetCount: 50,
      discordWebhookUrl: "https://discord.com/webhook/test",
      discordInviteUrl: "https://discord.gg/test",
      recommendations: 10,
    },
  });

  console.log(`✅ 그룹 생성 완료: ${testGroup.name} (ID: ${testGroup.id})`);

  // 2. 참가자 3명 생성
  const participant1 = await prisma.participant.create({
    data: {
      nickname: "김러너",
      password: "runner1234",
      groupId: testGroup.id,
    },
  });

  const participant2 = await prisma.participant.create({
    data: {
      nickname: "이스프린트",
      password: "sprint1234",
      groupId: testGroup.id,
    },
  });

  const participant3 = await prisma.participant.create({
    data: {
      nickname: "박마라톤",
      password: "marathon1234",
      groupId: testGroup.id,
    },
  });

  console.log(`✅ 참가자 3명 생성 완료`);

  // 3. 달리기 기록 생성 (랭킹 테스트용)
  // 김러너 - 2개 기록
  await prisma.record.create({
    data: {
      exerciseType: "달리기",
      description: "아침 조깅",
      duration: 30, // 30분
      distance: 5.0, // 5km
      images: [], // 이미지 업로드 테스트에서 추가 예정
      groupId: testGroup.id,
      participantId: participant1.id,
    },
  });

  await prisma.record.create({
    data: {
      exerciseType: "달리기",
      description: "저녁 런닝",
      duration: 45, // 45분
      distance: 7.5, // 7.5km
      images: [],
      groupId: testGroup.id,
      participantId: participant1.id,
    },
  });

  // 이스프린트 - 1개 기록
  await prisma.record.create({
    data: {
      exerciseType: "달리기",
      description: "인터벌 트레이닝",
      duration: 60, // 60분
      distance: 10.0, // 10km
      images: [],
      groupId: testGroup.id,
      participantId: participant2.id,
    },
  });

  // 박마라톤 - 3개 기록 (최다 점수)
  await prisma.record.create({
    data: {
      exerciseType: "달리기",
      description: "장거리 런닝",
      duration: 90, // 90분
      distance: 15.0, // 15km
      images: [],
      groupId: testGroup.id,
      participantId: participant3.id,
    },
  });

  await prisma.record.create({
    data: {
      exerciseType: "달리기",
      description: "회복 런",
      duration: 40, // 40분
      distance: 6.0, // 6km
      images: [],
      groupId: testGroup.id,
      participantId: participant3.id,
    },
  });

  await prisma.record.create({
    data: {
      exerciseType: "달리기",
      description: "스피드 런",
      duration: 25, // 25분
      distance: 4.0, // 4km
      images: [],
      groupId: testGroup.id,
      participantId: participant3.id,
    },
  });

  // 다른 운동 타입 기록 (랭킹에 포함되지 않음)
  await prisma.record.create({
    data: {
      exerciseType: "웨이트",
      description: "상체 운동",
      duration: 60,
      distance: null,
      images: [],
      groupId: testGroup.id,
      participantId: participant1.id,
    },
  });

  console.log(`✅ 운동 기록 7개 생성 완료 (달리기 6개, 웨이트 1개)`);

  // 4. 예상 랭킹 출력 (점수 공식: duration + distance * 15)
  // 점수 공식이나 저장데이터로 계산로직은 아직
  console.log("\n📊 예상 랭킹:");
  console.log("1위: 박마라톤 - 총점 530점 (155 + 375)");
  console.log("    - 기록1: 90 + (15 * 15) = 315점");
  console.log("    - 기록2: 40 + (6 * 15) = 130점");
  console.log("    - 기록3: 25 + (4 * 15) = 85점");
  console.log("2위: 이스프린트 - 총점 210점 (60 + 150)");
  console.log("    - 기록1: 60 + (10 * 15) = 210점");
  console.log("3위: 김러너 - 총점 262.5점 (75 + 187.5)");
  console.log("    - 기록1: 30 + (5 * 15) = 105점");
  console.log("    - 기록2: 45 + (7.5 * 15) = 157.5점");

  console.log("\n✅ Seeding 완료!");
  console.log(`\n🧪 테스트 정보:`);
  console.log(`그룹 ID: ${testGroup.id}`);
  console.log(`참가자1 (김러너) ID: ${participant1.id}`);
  console.log(`참가자2 (이스프린트) ID: ${participant2.id}`);
  console.log(`참가자3 (박마라톤) ID: ${participant3.id}`);
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
