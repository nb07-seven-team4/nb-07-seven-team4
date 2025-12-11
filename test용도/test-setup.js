// 기존 seed.js에 그룹 1만 생성되는거 추가하기 위해서 그룹2,3도 추가하는 코드
// 그럼 seed.js 가 필요한가? 실행은 node .\test용도\test-setup.js로 실행
import prisma from "../src/prismaClient.js";

async function setupTestData() {
  try {
    console.log("🧹 기존 데이터 정리 중...");

    // 기존 데이터 삭제 (순서 중요 - 외래키 관계)
    await prisma.record.deleteMany({});
    await prisma.participant.deleteMany({});
    await prisma.badge.deleteMany({});
    await prisma.group.deleteMany({});

    console.log("✅ 기존 데이터 정리 완료\n");

    console.log("📝 테스트 데이터 생성 중...");

    // ============================================
    // 그룹 1: 테스트 러닝 그룹
    // ============================================
    const group1 = await prisma.group.create({
      data: {
        name: "테스트 러닝 그룹",
        description: "rank와 img 기능 테스트용 그룹",
        nickname: "testgroup",
        password: "test1234",
        image: "group-image.jpg",
        tags: ["달리기", "테스트", "건강"],
        targetCount: 10,
        discordWebhookUrl: "https://discord.com/webhook/test",
        discordInviteUrl: "https://discord.gg/test",
        recommendations: 5
      }
    });

    console.log(`✅ 그룹 1 생성 완료 (ID: ${group1.id})`);

    // 그룹 1의 참가자 3명 생성
    const participants1 = await Promise.all([
      prisma.participant.create({
        data: {
          nickname: "runner1",
          password: "pass1234",
          groupId: group1.id
        }
      }),
      prisma.participant.create({
        data: {
          nickname: "runner2",
          password: "pass1234",
          groupId: group1.id
        }
      }),
      prisma.participant.create({
        data: {
          nickname: "runner3",
          password: "pass1234",
          groupId: group1.id
        }
      })
    ]);

    // 그룹 1의 달리기 기록 생성
    await prisma.record.createMany({
      data: [
        // runner1: 1등 예상
        {
          exerciseType: "달리기",
          description: "아침 조깅",
          duration: 3600,
          distance: 10.5,
          images: ["runner1-morning.jpg", "runner1-route.jpg"],
          groupId: group1.id,
          participantId: participants1[0].id
        },
        {
          exerciseType: "달리기",
          description: "저녁 러닝",
          duration: 2400,
          distance: 7.2,
          images: ["runner1-evening.jpg"],
          groupId: group1.id,
          participantId: participants1[0].id
        },
        // runner2: 2등 예상
        {
          exerciseType: "달리기",
          description: "주말 러닝",
          duration: 3000,
          distance: 8.0,
          images: ["runner2-weekend.jpg"],
          groupId: group1.id,
          participantId: participants1[1].id
        },
        // runner3: 3등 예상
        {
          exerciseType: "달리기",
          description: "가벼운 조깅",
          duration: 1800,
          distance: 5.0,
          images: [],
          groupId: group1.id,
          participantId: participants1[2].id
        }
      ]
    });

    // ============================================
    // 그룹 2: 아침 러닝 크루
    // ============================================
    const group2 = await prisma.group.create({
      data: {
        name: "아침 러닝 크루",
        description: "매일 아침 달리는 사람들",
        nickname: "morningcrew",
        password: "morning123",
        image: "morning-crew.jpg",
        tags: ["아침", "달리기", "건강"],
        targetCount: 20,
        discordWebhookUrl: "https://discord.com/webhook/morning",
        discordInviteUrl: "https://discord.gg/morning",
        recommendations: 10
      }
    });

    console.log(`✅ 그룹 2 생성 완료 (ID: ${group2.id})`);

    // 그룹 2의 참가자 2명 생성
    const participants2 = await Promise.all([
      prisma.participant.create({
        data: {
          nickname: "새벽러너",
          password: "pass1234",
          groupId: group2.id
        }
      }),
      prisma.participant.create({
        data: {
          nickname: "조깅마스터",
          password: "pass1234",
          groupId: group2.id
        }
      })
    ]);

    // 그룹 2의 달리기 기록 생성
    await prisma.record.createMany({
      data: [
        {
          exerciseType: "달리기",
          description: "새벽 5km",
          duration: 1500,
          distance: 5.0,
          images: [],
          groupId: group2.id,
          participantId: participants2[0].id
        },
        {
          exerciseType: "달리기",
          description: "아침 10km",
          duration: 3000,
          distance: 10.0,
          images: [],
          groupId: group2.id,
          participantId: participants2[1].id
        }
      ]
    });

    // ============================================
    // 그룹 3: 주말 마라톤 동호회
    // ============================================
    const group3 = await prisma.group.create({
      data: {
        name: "주말 마라톤 동호회",
        description: "주말에 장거리 달리기",
        nickname: "weekendmarathon",
        password: "weekend123",
        image: "marathon-club.jpg",
        tags: ["주말", "마라톤", "장거리"],
        targetCount: 15,
        discordWebhookUrl: "https://discord.com/webhook/marathon",
        discordInviteUrl: "https://discord.gg/marathon",
        recommendations: 8
      }
    });

    console.log(`✅ 그룹 3 생성 완료 (ID: ${group3.id})`);

    // 그룹 3의 참가자 4명 생성
    const participants3 = await Promise.all([
      prisma.participant.create({
        data: {
          nickname: "장거리왕",
          password: "pass1234",
          groupId: group3.id
        }
      }),
      prisma.participant.create({
        data: {
          nickname: "주말러너",
          password: "pass1234",
          groupId: group3.id
        }
      }),
      prisma.participant.create({
        data: {
          nickname: "마라톤맨",
          password: "pass1234",
          groupId: group3.id
        }
      }),
      prisma.participant.create({
        data: {
          nickname: "달리기초보",
          password: "pass1234",
          groupId: group3.id
        }
      })
    ]);

    // 그룹 3의 달리기 기록 생성
    await prisma.record.createMany({
      data: [
        {
          exerciseType: "달리기",
          description: "하프 마라톤",
          duration: 6000,
          distance: 21.0,
          images: [],
          groupId: group3.id,
          participantId: participants3[0].id
        },
        {
          exerciseType: "달리기",
          description: "10km 연습",
          duration: 2700,
          distance: 10.0,
          images: [],
          groupId: group3.id,
          participantId: participants3[1].id
        },
        {
          exerciseType: "달리기",
          description: "풀 마라톤",
          duration: 12000,
          distance: 42.195,
          images: [],
          groupId: group3.id,
          participantId: participants3[2].id
        },
        {
          exerciseType: "달리기",
          description: "첫 5km",
          duration: 2000,
          distance: 5.0,
          images: [],
          groupId: group3.id,
          participantId: participants3[3].id
        }
      ]
    });

    console.log("✅ 모든 운동 기록 생성 완료\n");

    // 점수 계산 공식: duration + (distance × 15)
    console.log("📊 그룹별 예상 랭킹:");
    console.log("\n그룹 1 - 테스트 러닝 그룹:");
    console.log("  1위: runner1 = (3600 + 2400) + (10.5 + 7.2) × 15 = 6265.5점");
    console.log("  2위: runner2 = 3000 + (8.0 × 15) = 3120점");
    console.log("  3위: runner3 = 1800 + (5.0 × 15) = 1875점");

    console.log("\n그룹 2 - 아침 러닝 크루:");
    console.log("  1위: 조깅마스터 = 3000 + (10.0 × 15) = 3150점");
    console.log("  2위: 새벽러너 = 1500 + (5.0 × 15) = 1575점");

    console.log("\n그룹 3 - 주말 마라톤 동호회:");
    console.log("  1위: 마라톤맨 = 12000 + (42.195 × 15) = 12632.925점");
    console.log("  2위: 장거리왕 = 6000 + (21.0 × 15) = 6315점");
    console.log("  3위: 주말러너 = 2700 + (10.0 × 15) = 2850점");
    console.log("  4위: 달리기초보 = 2000 + (5.0 × 15) = 2075점");

    console.log("\n🎉 테스트 데이터 설정 완료!\n");
    console.log("📌 생성된 정보:");
    console.log(`   - 그룹 1 ID: ${group1.id} (참가자 ${participants1.length}명)`);
    console.log(`   - 그룹 2 ID: ${group2.id} (참가자 ${participants2.length}명)`);
    console.log(`   - 그룹 3 ID: ${group3.id} (참가자 ${participants3.length}명)`);
    console.log("\n🧪 테스트 API 엔드포인트:");
    console.log(`   - 그룹 1 랭킹: GET http://localhost:3000/groups/${group1.id}/rank`);
    console.log(`   - 그룹 2 랭킹: GET http://localhost:3000/groups/${group2.id}/rank`);
    console.log(`   - 그룹 3 랭킹: GET http://localhost:3000/groups/${group3.id}/rank`);
    console.log(`   - 이미지 업로드: POST http://localhost:3000/images/upload`);

    return { groups: [group1, group2, group3], participants: [...participants1, ...participants2, ...participants3] };

  } catch (error) {
    console.error("❌ 에러 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
