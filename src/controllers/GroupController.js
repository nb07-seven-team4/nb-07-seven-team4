// GroupController.js
import { BadRequestError } from "../utils/errors.js";
import GroupService from "../services/GroupService.js";

class GroupController {
  // POST /groups - 그룹 생성
  async createGroup(req, res, next) {
    console.log("[백엔드] 받은 req.body:", JSON.stringify(req.body, null, 2));

    const {
      name,
      description,
      photoUrl,
      tags,
      goalRep,
      discordWebhookUrl,
      discordInviteUrl,
      ownerNickname,
      ownerPassword,
    } = req.body;
  // Debug: 필드 타입 출력
    console.log("[백엔드] 필드 체크:", {
      name: `"${name}" (${typeof name})`,
      ownerNickname: `"${ownerNickname}" (${typeof ownerNickname})`,
      ownerPassword: `"${ownerPassword}" (${typeof ownerPassword})`,
      photoUrl: `"${photoUrl}" (${typeof photoUrl})`,
      description: `"${description}" (${typeof description})`,
      tags: tags,
      goalRep: `"${goalRep}" (${typeof goalRep})`,
      discordWebhookUrl: `"${discordWebhookUrl}" (${typeof discordWebhookUrl})`,
      discordInviteUrl: `"${discordInviteUrl}" (${typeof discordInviteUrl})`,
    });

    if (!name || !ownerNickname || !ownerPassword) {
      return res.status(400).json({
        path: "body",
        message:
          "필수 필드를 모두 입력해주세요 (name, ownerNickname, ownerPassword)",
      });
    }

    const finalPhotoUrl = photoUrl || "https://via.placeholder.com/150";
    const finalDescription = description || "";
    const finalTags = tags || [];
    const finalGoalRep = goalRep || 0;
    const finalDiscordWebhookUrl = discordWebhookUrl || "";
    const finalDiscordInviteUrl = discordInviteUrl || "";

    try {
      const result = await GroupService.createGroup(
        {
          name,
          description: finalDescription,
          photoUrl: finalPhotoUrl,
          tags: finalTags,
          goalRep: finalGoalRep,
          discordWebhookUrl: finalDiscordWebhookUrl,
          discordInviteUrl: finalDiscordInviteUrl,
        },
        {
          nickname: ownerNickname,
          password: ownerPassword,
        }
      );

      const owner = result.participants.find((p) => p.isOwner);
      const response = {
        id: Number(result.id),
        name: result.name,
        description: result.description,
        photoUrl: result.photoUrl,
        goalRep: result.goalRep,
        discordWebhookUrl: result.discordWebhookUrl,
        discordInviteUrl: result.discordInviteUrl,
        likeCount: result.likeCount,
        tags: result.tags,
        owner: {
          id: Number(owner.id),
          nickname: owner.nickname,
          createdAt: owner.joinedAt.getTime(),
          updatedAt: owner.joinedAt.getTime(),
        },
        participants: result.participants.map((p) => ({
          id: Number(p.id),
          nickname: p.nickname,
          createdAt: p.joinedAt.getTime(),
          updatedAt: p.joinedAt.getTime(),
        })),
        createdAt: result.createdAt.getTime(),
        updatedAt: result.updatedAt.getTime(),
        badges: result.badges.map((b) => b.type),
      };

      return res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // GET /groups - 그룹 목록 조회 및 검색 (페이지네이션 지원)
  async getGroups(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const orderBy = req.query.orderBy || "createdAt";
      const order = req.query.order || "desc";

      const validOrderBy = ["likeCount", "participantCount", "createdAt"];
      if (!validOrderBy.includes(orderBy)) {
        return res.status(400).json({
          path: "orderBy",
          message: `The orderBy parameter must be one of the following values: ${JSON.stringify(validOrderBy)}.`,
        });
      }

      const { groups, totalCount } = await GroupService.getGroups({
        page,
        limit,
        search,
        orderBy,
        order,
      });

      const formattedGroups = groups.map((group) => {
        const owner = group.participants[0];

        return {
          id: Number(group.id),
          name: group.name,
          description: group.description,
          photoUrl: group.photoUrl,
          goalRep: group.goalRep,
          discordWebhookUrl: group.discordWebhookUrl,
          discordInviteUrl: group.discordInviteUrl,
          likeCount: group.likeCount,
          recordCount: group._count.records,
          participantCount: group._count.participants,
          tags: group.tags,
          owner: owner
            ? {
                id: Number(owner.id),
                nickname: owner.nickname,
                createdAt: owner.joinedAt.getTime(),
                updatedAt: owner.joinedAt.getTime(),
              }
            : {
                id: 0,
                nickname: "Unknown",
                createdAt: group.createdAt.getTime(),
                updatedAt: group.updatedAt.getTime(),
              },
          createdAt: group.createdAt.getTime(),
          updatedAt: group.updatedAt.getTime(),
          badges: group.badges.map((b) => b.type),
        };
      });

      return res.status(200).json({
        data: formattedGroups,
        total: totalCount,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /groups/:groupId - 그룹 상세 조회
  async getGroupById(req, res, next) {
    try {
      const { groupId } = req.params;
      const id = BigInt(groupId);

      const group = await GroupService.getGroupById(id);

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      let owner = group.participants.find((p) => p.isOwner);
      if (!owner) {
        owner = group.participants.find((p) => p.id === group.ownerId);
      }

      const response = {
        id: Number(group.id),
        name: group.name,
        description: group.description,
        photoUrl: group.photoUrl,
        goalRep: group.goalRep,
        discordWebhookUrl: group.discordWebhookUrl,
        discordInviteUrl: group.discordInviteUrl,
        likeCount: group.likeCount,
        tags: group.tags,
        owner: owner
          ? {
              id: Number(owner.id),
              nickname: owner.nickname,
              createdAt: owner.joinedAt.getTime(),
              updatedAt: owner.joinedAt.getTime(),
            }
          : {
              id: 0,
              nickname: "Unknown",
              createdAt: group.createdAt.getTime(),
              updatedAt: group.updatedAt.getTime(),
            },
        participants: group.participants.map((p) => ({
          id: Number(p.id),
          nickname: p.nickname,
          createdAt: p.joinedAt.getTime(),
          updatedAt: p.joinedAt.getTime(),
        })),
        createdAt: group.createdAt.getTime(),
        updatedAt: group.updatedAt.getTime(),
        badges: group.badges.map((b) => b.type),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /groups/:groupId - 그룹 수정
  async updateGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const id = BigInt(groupId);

      const {
        name,
        description,
        photoUrl,
        tags,
        goalRep,
        discordWebhookUrl,
        discordInviteUrl,
        ownerNickname,
        ownerPassword,
      } = req.body;

      // Owner 인증
      const authResult = await GroupService.verifyOwner(id, ownerNickname, ownerPassword);
      if (!authResult.valid) {
        return res.status(authResult.error === "Group not found" ? 404 : 401).json({
          path: "password",
          message: authResult.error,
        });
      }

      const { owner } = authResult;

      // 업데이트 데이터 구성
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
      if (tags !== undefined) updateData.tags = tags;
      if (goalRep !== undefined) updateData.goalRep = goalRep;
      if (discordWebhookUrl !== undefined)
        updateData.discordWebhookUrl = discordWebhookUrl;
      if (discordInviteUrl !== undefined)
        updateData.discordInviteUrl = discordInviteUrl;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          path: "body",
          message: "수정할 데이터가 요청에 포함되어 있지 않습니다.",
        });
      }

      const updatedGroup = await GroupService.updateGroup(id, updateData);

      const response = {
        id: Number(updatedGroup.id),
        name: updatedGroup.name,
        description: updatedGroup.description,
        photoUrl: updatedGroup.photoUrl,
        goalRep: updatedGroup.goalRep,
        discordWebhookUrl: updatedGroup.discordWebhookUrl,
        discordInviteUrl: updatedGroup.discordInviteUrl,
        likeCount: updatedGroup.likeCount,
        tags: updatedGroup.tags,
        owner: {
          id: Number(owner.id),
          nickname: owner.nickname,
          createdAt: owner.joinedAt.getTime(),
          updatedAt: owner.joinedAt.getTime(),
        },
        participants: updatedGroup.participants.map((p) => ({
          id: Number(p.id),
          nickname: p.nickname,
          createdAt: p.joinedAt.getTime(),
          updatedAt: p.joinedAt.getTime(),
        })),
        createdAt: updatedGroup.createdAt.getTime(),
        updatedAt: updatedGroup.updatedAt.getTime(),
        badges: updatedGroup.badges.map((b) => b.type),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /groups/:groupId - 그룹 삭제
  async deleteGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const id = BigInt(groupId);

      const { ownerPassword } = req.body;

      // Owner 인증 (닉네임 없이 비밀번호만으로 인증)
      const group = await GroupService.getGroupById(id);
      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      const owner = group.participants.find((p) => p.isOwner);
      if (!owner || owner.password !== ownerPassword) {
        return res.status(401).json({
          path: "password",
          message: "Wrong password",
        });
      }

      await GroupService.deleteGroup(id);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  // POST /groups/:groupId/likes - 그룹 추천
  async likeGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      if (!groupId) {
        throw new BadRequestError("ID는 필수");
      }
      const id = BigInt(groupId);

      await GroupService.likeGroup(id);

      res.status(200).json({ message: "그룹추천 성공" });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /groups/:groupId/likes - 그룹 추천 취소
  async unlikeGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      if (!groupId) {
        throw new BadRequestError("ID는 필수");
      }

      await GroupService.unlikeGroup(BigInt(groupId));

      res.status(200).json({ message: "그룹추천 취소" });
    } catch (error) {
      next(error);
    }
  }
}

export default new GroupController();
