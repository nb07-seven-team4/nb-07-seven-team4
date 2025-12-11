# 이미지 업로드 & 랭킹 기능 테스트 가이드

## 1. 사전 준비

### 1.1 데이터베이스 마이그레이션
```bash
npx prisma migrate dev
```

### 1.2 테스트 데이터 시딩
```bash
npx prisma db seed
```

시딩 후 출력되는 **그룹 ID**를 기억하세요! (예: `1`)

### 1.3 uploads 폴더 생성
```bash
mkdir uploads
```

### 1.4 서버 실행
```bash
node src/app.js
```

서버가 `http://localhost:3000`에서 실행됩니다.

---

## 2. 랭킹 기능 테스트 (rankRoutes.js)

### 2.1 그룹 랭킹 조회
```bash
curl http://localhost:3000/groups/1/rank
```

**예상 결과:**
```json
{
  "message": "그룹 랭킹 조회 성공",
  "rankings": [
    {
      "participantId": "3",
      "nickname": "박마라톤",
      "totalScore": 530,
      "rank": 1
    },
    {
      "participantId": "1",
      "nickname": "김러너",
      "totalScore": 262.5,
      "rank": 2
    },
    {
      "participantId": "2",
      "nickname": "이스프린트",
      "totalScore": 210,
      "rank": 3
    }
  ]
}
```

**점수 계산 공식:** `duration + (distance × 15)` -> 데베에서 저장되는 데이터값을 rank에서도 사용?

---

## 3. 이미지 업로드 기능 테스트 (imageRoutes.js + multer.js)

### 3.1 이미지 파일 준비
테스트용 이미지 파일을 준비하세요 (예: `test.jpg`, `test.png`)

### 3.2 이미지 업로드 (Postman 사용)

**Postman 설정:**
- Method: `POST`
- URL: `http://localhost:3000/images/upload`
- Body: `form-data`
  - Key: `image` (type: File)
  - Value: 이미지 파일 선택

**curl 명령어 (터미널):**
```bash
curl -X POST http://localhost:3000/images/upload \
  -F "image=@/path/to/your/test.jpg"
```

**예상 응답:**
```json
{
  "message": "이미지 업로드 성공",
  "imageUrl": "http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
  "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
  "metadata": {
    "mimetype": "image/jpeg",
    "size": "245.67 KB"
  }
}
```

### 3.3 multer 검증 사항 코드잇 규칙에 맞게?
- ✅ 허용 형식: JPG, PNG, GIF, WEBP, SVG, BMP
- ✅ 최대 파일 크기: 5MB
- ✅ 파일명: UUID로 자동 생성 (중복 방지)
- ✅ 저장 위치: `uploads/` 폴더

### 3.4 이미지 삭제
```bash
curl -X DELETE http://localhost:3000/images/550e8400-e29b-41d4-a716-446655440000.jpg
```

**예상 응답:**
```json
{
  "message": "이미지 삭제 성공",
  "filename": "550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

### 3.5 특정 운동 기록의 이미지 조회
```bash
curl http://localhost:3000/images/records/1/images
```

**예상 응답:**
```json
{
  "message": "이미지 목록 조회 성공",
  "recordId": "1",
  "images": [],
  "count": 0
}
```

---

## 4. 통합 테스트 시나리오

### 시나리오: 운동 기록에 이미지 첨부하기

1. **이미지 업로드**
   ```bash
   curl -X POST http://localhost:3000/images/upload \
     -F "image=@test.jpg"
   ```
   → `filename` 값 저장 (예: `abc-123.jpg`)

2. **운동 기록 생성 시 이미지 첨부** (recordRoutes.js 사용)
   ```bash
   curl -X POST http://localhost:3000/groups/1/records \
     -H "Content-Type: application/json" \
     -d '{
       "participantId": 1,
       "exerciseType": "달리기",
       "description": "이미지 테스트",
       "duration": 30,
       "distance": 5.0,
       "images": ["abc-123.jpg"]
     }'
   ```

3. **기록의 이미지 조회**
   ```bash
   curl http://localhost:3000/images/records/8/images
   ```

4. **랭킹 재조회** (새 기록 반영 확인)
   ```bash
   curl http://localhost:3000/groups/1/rank
   ```

---

## 5. 에러 및 예외 케이스 테스트

### 5.1 잘못된 파일 형식 업로드
```bash
curl -X POST http://localhost:3000/images/upload \
  -F "image=@test.txt"
```
**예상:** `400 Bad Request` - "허용되지 않는 파일 형식입니다"

### 5.2 파일 크기 초과 (6MB 파일)
**예상:** `400 Bad Request` - "파일 크기가 제한을 초과했습니다 (최대 5MB)"

### 5.3 존재하지 않는 그룹의 랭킹 조회
```bash
curl http://localhost:3000/groups/999/rank
```
**예상:** `404 Not Found` - "그룹을 찾을 수 없습니다"

### 5.4 존재하지 않는 이미지 삭제
```bash
curl -X DELETE http://localhost:3000/images/nonexistent.jpg
```
**예상:** `404 Not Found` - "이미지를 찾을 수 없습니다"

---

## 6. 테스트 체크리스트

### rankRoutes.js
- [ ] 그룹 랭킹 조회 성공
- [ ] 점수 계산 정확성 확인 (duration + distance × 15)
- [ ] 순위 정렬 확인 (내림차순)
- [ ] "달리기" 기록만 포함 확인
- [ ] 존재하지 않는 그룹 처리

### imageRoutes.js
- [ ] 단일 이미지 업로드 성공
- [ ] 이미지 URL 생성 확인
- [ ] 이미지 삭제 성공
- [ ] 특정 기록 이미지 조회 성공
- [ ] 에러 시 파일 롤백 확인

### multer.js
- [ ] 허용된 형식 업로드 성공 (JPG, PNG, GIF, WEBP)
- [ ] 파일 크기 제한 동작 (5MB)
- [ ] UUID 파일명 생성 확인
- [ ] uploads 폴더 저장 확인
- [ ] 잘못된 형식 차단 확인

---

## 7. 시딩 데이터 정보

### 생성된 그룹
- **이름:** 런닝 크루 테스트
- **그룹 ID:** 1 (자동 생성)

### 생성된 참가자
1. **김러너** (ID: 1) - 달리기 2개 + 웨이트 1개
2. **이스프린트** (ID: 2) - 달리기 1개
3. **박마라톤** (ID: 3) - 달리기 3개

### 예상 랭킹
1. 박마라톤 - 530점
2. 김러너 - 262.5점
3. 이스프린트 - 210점

---

## 8. 문제 해결

### uploads 폴더가 없다는 에러
```bash
mkdir uploads
```

### Prisma Client 에러
```bash
npx prisma generate
```

### 데이터베이스 연결 에러
`.env` 파일의 `DATABASE_URL` 확인

### 포트 충돌
`.env`에서 `PORT=3001` 등으로 변경

### 김민기 한테 물어보기
