// GroupService.js
import prisma from "../prismaClient.js";
import { awardBadge, BADGE_TYPES } from "./badgeService.js";
import { promises as fs } from "fs";
import path from "path";

class GroupService {
  /**
   * 그룹 생성 (트랜잭션 포함)
   */
  async createGroup(groupData, ownerData) {
    const result = await prisma.$transaction(async (tx) => {
      const tempGroup = await tx.group.create({
        data: {
          ...groupData,
          ownerId: BigInt(0), // 임시값
        },
      });

      const owner = await tx.participant.create({
        data: {
          nickname: ownerData.nickname,
          password: ownerData.password,
          isOwner: true,
          groupId: tempGroup.id,
        },
      });

      await tx.group.update({
        where: { id: tempGroup.id },
        data: { ownerId: owner.id },
      });

      return await tx.group.findUnique({
        where: { id: tempGroup.id },
        include: {
          participants: true,
          badges: true,
        },
      });
    });

    return result;
  }

  /**
   * 그룹 목록 조회 (페이지네이션, 검색, 정렬)
   */
  async getGroups(options) {
    const { page = 1, limit = 10, search = "", orderBy = "createdAt", order = "desc" } = options;

    const skip = (page - 1) * limit;

    const whereConditions = {};
    if (search) {
      whereConditions.name = { contains: search, mode: "insensitive" };
    }

    const totalCount = await prisma.group.count({
      where: whereConditions,
    });

    let prismaOrderBy = {};
    if (orderBy === "likeCount") {
      prismaOrderBy = { likeCount: order };
    } else if (orderBy === "participantCount") {
      prismaOrderBy = { participants: { _count: order } };
    } else {
      prismaOrderBy = { [orderBy]: order };
    }
    
    // 그룹 조회
    const groups = await prisma.group.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      orderBy: prismaOrderBy,
      include: {
        participants: {
          where: { isOwner: true },
          take: 1,
        },
        badges: true,
        _count: {
          select: {
            records: true,
            participants: true,
          },
        },
      },
    });

    return { groups, totalCount };
  }

  /**
   * 그룹 상세 조회
   */
  async getGroupById(groupId) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
        badges: true,
      },
    });

    return group;
  }

  /**
   * 그룹 업데이트
   */
  async updateGroup(groupId, updateData) {
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData,
      include: {
        participants: true,
        badges: true,
      },
    });

    return updatedGroup;
  }

  /**
   * 그룹 삭제 (이미지 파일도 함께 삭제)
   */
  async deleteGroup(groupId) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
        records: {
          select: { images: true },
        },
      },
    });
    // 그룹이 존재하지 않으면 null 반환
    if (!group) {
      return null;
    }

    const imagesToDelete = [];

    // 그룹 썸네일 이미지 수집
    if (group.photoUrl) {
      const filename = group.photoUrl.split("/").pop();
      if (
        filename &&
        !filename.startsWith("http") &&
        !filename.includes("placeholder")
      ) {
        imagesToDelete.push(filename);
      }
    }

    // 운동 기록 이미지 수집
    group.records.forEach((record) => {
      record.images.forEach((imageUrl) => {
        const filename = imageUrl.split("/").pop();
        if (
          filename &&
          !filename.startsWith("http") &&
          !filename.includes("placeholder")
        ) {
          imagesToDelete.push(filename);
        }
      });
    });

    // DB에서 그룹 삭제
    await prisma.group.delete({
      where: { id: groupId },
    });

    // 파일 시스템에서 이미지 삭제
    for (const filename of imagesToDelete) {
      try {
        const filePath = path.join("uploads", filename);
        await fs.unlink(filePath);
        console.log(`✅ 이미지 삭제 성공: ${filename}`);
      } catch (err) {
        console.error(`⚠️ 이미지 삭제 실패 (무시됨): ${filename}`, err.message);
      }
    }

    return group;
  }

  /**
   * 그룹 추천 (좋아요 증가)
   */
  async likeGroup(groupId) {
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        likeCount: { increment: 1 },
      },
    });

    // 추천 100개 달성 시 배지 수여
    if (updatedGroup.likeCount >= 100) {
      await awardBadge(groupId, BADGE_TYPES.LIKE_100);
    }

    return updatedGroup;
  }

  /**
   * 그룹 추천 취소 (좋아요 감소)
   */
  async unlikeGroup(groupId) {
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        likeCount: { decrement: 1 },
      },
    });

    return updatedGroup;
  }

  /**
   * Owner 인증 확인
   */
  async verifyOwner(groupId, ownerNickname, ownerPassword) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: {
          where: { isOwner: true },
        },
      },
    });

    if (!group) {
      return { valid: false, error: "그룹 찾을 수 없음" };
    }

    const owner = group.participants.find((p) => p.isOwner);
    if (
      !owner ||
      owner.nickname !== ownerNickname ||
      owner.password !== ownerPassword
    ) {
      return { valid: false, error: "틀린 비밀번호" };
    }

    return { valid: true, group, owner };
  }
}

export default new GroupService();
