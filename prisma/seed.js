// 배지 테스트용 시드 데이터
import { prisma } from "./prisma.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function main() {
  console.log("🌱 배지 테스트용 시드 시작...");

  // 기존 데이터 삭제
  await prisma.badge.deleteMany({});
  await prisma.record.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.group.deleteMany({});

  console.log("✅ 기존 데이터 삭제 완료\n");

  // 테스트 이미지 경로 (절대 경로로 설정)
  const testImagePath = "/test.jpg";

  // ===================================
  // 그룹 1: 모든 배지 획득 (참여자 10명, 기록 100개, 추천 100개)
  // ===================================
  console.log("📦 그룹 1 생성: 모든 배지 획득 그룹");
  const group1 = await prisma.group.create({
    data: {
      name: "test1",
      description: "모든 배지를 획득한 그룹 (참여자 10명, 기록 100개, 추천 100개)",
      photoUrl: testImagePath,
      tags: ["런닝", "테스트", "완성"],
      goalRep: 100,
      discordWebhookUrl: "https://discord.com/webhook/test1",
      discordInviteUrl: "https://discord.gg/test1",
      likeCount: 100, // 추천 100개
      ownerId: BigInt(1),
    },
  });

  // 참여자 10명 생성
  const participants1 = [];
  for (let i = 1; i <= 10; i++) {
    const participant = await prisma.participant.create({
      data: {
        nickname: `test1_user${i}`,
        password: "password123",
        isOwner: i === 1,
        groupId: group1.id,
      },
    });
    participants1.push(participant);
  }

  // 기록 100개 생성 (10명이 각각 10개씩)
  for (let i = 0; i < 10; i++) {
    for (let j = 1; j <= 10; j++) {
      await prisma.record.create({
        data: {
          type: "런닝",
          description: `test1 참여자${i + 1}의 ${j}번째 기록`,
          time: 30 + j * 5, // 30분부터 5분씩 증가
          distance: 5.0 + j * 0.5, // 5km부터 0.5km씩 증가
          images: [testImagePath],
          groupId: group1.id,
          participantId: participants1[i].id,
        },
      });
    }
  }

  console.log(`✅ 그룹 1 완료: ${group1.name} (ID: ${group1.id})`);
  console.log(`   - 참여자: 10명`);
  console.log(`   - 기록: 100개`);
  console.log(`   - 추천: 100개`);
  console.log(`   - 예상 배지: PARTICIPANT_10, RECORD_100, LIKE_100\n`);

  // ===================================
  // 그룹 2: 참여자 배지만 획득 (참여자 10명, 기록 50개, 추천 50개)
  // ===================================
  console.log("📦 그룹 2 생성: 참여자 배지만 획득");
  const group2 = await prisma.group.create({
    data: {
      name: "test2",
      description: "참여자 배지만 획득한 그룹 (참여자 10명, 기록 50개, 추천 50개)",
      photoUrl: testImagePath,
      tags: ["수영", "테스트"],
      goalRep: 50,
      discordWebhookUrl: "https://discord.com/webhook/test2",
      discordInviteUrl: "https://discord.gg/test2",
      likeCount: 50, // 추천 50개
      ownerId: BigInt(2),
    },
  });

  // 참여자 10명 생성
  const participants2 = [];
  for (let i = 1; i <= 10; i++) {
    const participant = await prisma.participant.create({
      data: {
        nickname: `test2_user${i}`,
        password: "password123",
        isOwner: i === 1,
        groupId: group2.id,
      },
    });
    participants2.push(participant);
  }

  // 기록 50개 생성 (5명이 각각 10개씩)
  for (let i = 0; i < 5; i++) {
    for (let j = 1; j <= 10; j++) {
      await prisma.record.create({
        data: {
          type: "수영",
          description: `test2 참여자${i + 1}의 ${j}번째 기록`,
          time: 40 + j * 3,
          distance: 1.0 + j * 0.2,
          images: [testImagePath],
          groupId: group2.id,
          participantId: participants2[i].id,
        },
      });
    }
  }

  console.log(`✅ 그룹 2 완료: ${group2.name} (ID: ${group2.id})`);
  console.log(`   - 참여자: 10명`);
  console.log(`   - 기록: 50개`);
  console.log(`   - 추천: 50개`);
  console.log(`   - 예상 배지: PARTICIPANT_10\n`);

  // ===================================
  // 그룹 3: 배지 없음 (참여자 5명, 기록 30개, 추천 30개)
  // ===================================
  console.log("📦 그룹 3 생성: 배지 없음");
  const group3 = await prisma.group.create({
    data: {
      name: "test3",
      description: "아직 배지를 획득하지 못한 그룹 (참여자 5명, 기록 30개, 추천 30개)",
      photoUrl: testImagePath,
      tags: ["사이클", "테스트"],
      goalRep: 30,
      discordWebhookUrl: "https://discord.com/webhook/test3",
      discordInviteUrl: "https://discord.gg/test3",
      likeCount: 30, // 추천 30개
      ownerId: BigInt(3),
    },
  });

  // 참여자 5명 생성
  const participants3 = [];
  for (let i = 1; i <= 5; i++) {
    const participant = await prisma.participant.create({
      data: {
        nickname: `test3_user${i}`,
        password: "password123",
        isOwner: i === 1,
        groupId: group3.id,
      },
    });
    participants3.push(participant);
  }

  // 기록 30개 생성 (5명이 각각 6개씩)
  for (let i = 0; i < 5; i++) {
    for (let j = 1; j <= 6; j++) {
      await prisma.record.create({
        data: {
          type: "사이클",
          description: `test3 참여자${i + 1}의 ${j}번째 기록`,
          time: 60 + j * 10,
          distance: 15.0 + j * 2.0,
          images: [testImagePath],
          groupId: group3.id,
          participantId: participants3[i].id,
        },
      });
    }
  }

  console.log(`✅ 그룹 3 완료: ${group3.name} (ID: ${group3.id})`);
  console.log(`   - 참여자: 5명`);
  console.log(`   - 기록: 30개`);
  console.log(`   - 추천: 30개`);
  console.log(`   - 예상 배지: 없음\n`);

  // ===================================
  // 그룹 4: 기록 배지만 획득 (참여자 3명, 기록 100개, 추천 10개)
  // ===================================
  console.log("📦 그룹 4 생성: 기록 배지만 획득");
  const group4 = await prisma.group.create({
    data: {
      name: "test4",
      description: "기록 배지만 획득한 그룹 (참여자 3명, 기록 100개, 추천 10개)",
      photoUrl: testImagePath,
      tags: ["요가", "테스트"],
      goalRep: 100,
      discordWebhookUrl: "https://discord.com/webhook/test4",
      discordInviteUrl: "https://discord.gg/test4",
      likeCount: 10, // 추천 10개
      ownerId: BigInt(4),
    },
  });

  // 참여자 3명 생성
  const participants4 = [];
  for (let i = 1; i <= 3; i++) {
    const participant = await prisma.participant.create({
      data: {
        nickname: `test4_user${i}`,
        password: "password123",
        isOwner: i === 1,
        groupId: group4.id,
      },
    });
    participants4.push(participant);
  }

  // 기록 100개 생성 (3명이 각각 33, 33, 34개)
  const recordCounts = [34, 33, 33];
  for (let i = 0; i < 3; i++) {
    for (let j = 1; j <= recordCounts[i]; j++) {
      await prisma.record.create({
        data: {
          type: "요가",
          description: `test4 참여자${i + 1}의 ${j}번째 기록`,
          time: 45 + j * 2,
          distance: null, // 요가는 거리 없음
          images: [testImagePath],
          groupId: group4.id,
          participantId: participants4[i].id,
        },
      });
    }
  }

  console.log(`✅ 그룹 4 완료: ${group4.name} (ID: ${group4.id})`);
  console.log(`   - 참여자: 3명`);
  console.log(`   - 기록: 100개`);
  console.log(`   - 추천: 10개`);
  console.log(`   - 예상 배지: RECORD_100\n`);

  // ===================================
  // 그룹 5: 추천 배지만 획득 (참여자 5명, 기록 50개, 추천 100개)
  // ===================================
  console.log("📦 그룹 5 생성: 추천 배지만 획득");
  const group5 = await prisma.group.create({
    data: {
      name: "test5",
      description: "추천 배지만 획득한 그룹 (참여자 5명, 기록 50개, 추천 100개)",
      photoUrl: testImagePath,
      tags: ["헬스", "테스트"],
      goalRep: 50,
      discordWebhookUrl: "https://discord.com/webhook/test5",
      discordInviteUrl: "https://discord.gg/test5",
      likeCount: 100, // 추천 100개
      ownerId: BigInt(5),
    },
  });

  // 참여자 5명 생성
  const participants5 = [];
  for (let i = 1; i <= 5; i++) {
    const participant = await prisma.participant.create({
      data: {
        nickname: `test5_user${i}`,
        password: "password123",
        isOwner: i === 1,
        groupId: group5.id,
      },
    });
    participants5.push(participant);
  }

  // 기록 50개 생성 (5명이 각각 10개씩)
  for (let i = 0; i < 5; i++) {
    for (let j = 1; j <= 10; j++) {
      await prisma.record.create({
        data: {
          type: "헬스",
          description: `test5 참여자${i + 1}의 ${j}번째 기록`,
          time: 60 + j * 5,
          distance: null, // 헬스는 거리 없음
          images: [testImagePath],
          groupId: group5.id,
          participantId: participants5[i].id,
        },
      });
    }
  }

  console.log(`✅ 그룹 5 완료: ${group5.name} (ID: ${group5.id})`);
  console.log(`   - 참여자: 5명`);
  console.log(`   - 기록: 50개`);
  console.log(`   - 추천: 100개`);
  console.log(`   - 예상 배지: LIKE_100\n`);

  // ===================================
  // 요약
  // ===================================
  console.log("\n" + "=".repeat(60));
  console.log("✅ 시드 완료! 배지 테스트용 그룹 5개 생성");
  console.log("=".repeat(60));
  console.log("\n📊 그룹별 배지 획득 예상:");
  console.log(`\n1. ${group1.name} (ID: ${group1.id})`);
  console.log("   🎯 배지 3개: PARTICIPANT_10, RECORD_100, LIKE_100");
  console.log("   - 참여자: 10명 ✅ | 기록: 100개 ✅ | 추천: 100개 ✅");

  console.log(`\n2. ${group2.name} (ID: ${group2.id})`);
  console.log("   🎯 배지 1개: PARTICIPANT_10");
  console.log("   - 참여자: 10명 ✅ | 기록: 50개 ❌ | 추천: 50개 ❌");

  console.log(`\n3. ${group3.name} (ID: ${group3.id})`);
  console.log("   🎯 배지 0개: 없음");
  console.log("   - 참여자: 5명 ❌ | 기록: 30개 ❌ | 추천: 30개 ❌");

  console.log(`\n4. ${group4.name} (ID: ${group4.id})`);
  console.log("   🎯 배지 1개: RECORD_100");
  console.log("   - 참여자: 3명 ❌ | 기록: 100개 ✅ | 추천: 10개 ❌");

  console.log(`\n5. ${group5.name} (ID: ${group5.id})`);
  console.log("   🎯 배지 1개: LIKE_100");
  console.log("   - 참여자: 5명 ❌ | 기록: 50개 ❌ | 추천: 100개 ✅");

  console.log("\n" + "=".repeat(60));
  console.log("🧪 배지 테스트 방법:");
  console.log("=".repeat(60));
  console.log("\n1. 배지 수동 체크 (모든 그룹에 배지 부여):");
  console.log(`   POST http://localhost:3003/groups/{groupId}/badges/check`);
  console.log("\n2. 배지 목록 조회:");
  console.log(`   GET http://localhost:3003/groups/{groupId}/badges`);
  console.log("\n3. 배지 상태 및 진행률 조회:");
  console.log(`   GET http://localhost:3003/groups/{groupId}/badges/status`);
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .catch(async (e) => {
    console.error("❌ 시드 에러:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
