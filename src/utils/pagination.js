/**
 * 페이지네이션 헬퍼
 * @param {number} page - 현재 페이지 (1부터 시작)
 * @param {number} limit - 페이지당 항목 수
 * @returns {object} - { skip, take } Prisma용 페이지네이션 파라미터
 */
function getPaginationParams(page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // 최대 100개로 제한

  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
  };
}

/**
 * 페이지네이션 메타데이터 생성
 */
function getPaginationMeta(totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = {
  getPaginationParams,
  getPaginationMeta,
};
