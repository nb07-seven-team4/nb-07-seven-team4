[맨 아래로](#bottom)

#  팀 프로젝트 Git 협업 규칙 입니다.


브렌치 규칙<details> 

# ✅ **1) 브랜치 규칙 (Branch Rule)**


### **예시 구조**

* `main` — 완성된 안정 버전만

* `feature/지산-auth`
* `feature/서준-participant`
* `feature/동우-group`
* `feature/민기-record`

* `hotfix` - 버그수정
* `test` - 테스트용 브렌치 // 뒤에 숫자붙여서 사용 가능


브렌치명을 한글로? 설명 내용을 한글로?

``` 
## 깃 커밋 할때 접두사 (Type),목적 및 내용,예시

feat (Feature)
,새로운 기능을 추가하는 경우. 애플리케이션의 동작 방식에 변화를 주는 사용자에게 보이는 변경사항.,feat: 사용자 로그인 기능 구현

fix
(Bug Fix),버그를 수정하는 경우. 잘못된 동작이나 오작동을 수정하는 변경사항.,fix: 모바일 환경에서 버튼 클릭 안 되는 오류 수정

docs
 (Documentation),"문서와 관련된 변경사항. 코드의 동작에는 영향을 주지 않음 (예: README, 주석, API 문서).",docs: README에 설치 가이드 추가

style
,"코드 포맷팅, 세미콜론 누락, 공백 등 코드 스타일 관련 변경사항. 기능 변경은 없음.",style: 함수 간 공백 2줄로 조정
refactor,코드 리팩토링. 버그 수정이나 새로운 기능 추가 없이 코드를 개선하거나 구조를 변경하는 경우.,refactor: 함수명을 더 명확하게 변경

test
,"테스트 코드를 추가, 수정 또는 제거하는 경우.",test: 특정 컴포넌트에 대한 유닛 테스트 추가
chore,"빌드 시스템, 라이브러리 업데이트 등 기타 잡다한 변경사항. 주 개발 코드와 직접 관련 없는 환경 설정 등.",chore: 라이브러리 버전 업데이트

perf
(Performance),성능 개선을 위한 코드 변경.,perf: 이미지 로딩 속도 최적화

후 뒤에 내용 적는 형식으로
```

### ✔ 브랜치 이름 규칙

```
feature/본인이름-기능명
```

예:

```
feature/min-article
feature/seojun-auth
feature/jisan-group
```

---
</details>

---
팀원에게 알려주는 방식<details> 

# ✅ **2) 팀원이 자신의 브랜치에서 작업했을 때, 팀에게 알려주는 방식**

### **1. 커밋 푸시 후 Discord/단톡/노션에 간단 보고**

메시지 형식 통일시키면 팀 관리가 편함.

```
[업데이트] feature/min-article 브랜치 푸시함

변경 사항:
- Article 작성 API 완성
- Prisma schema에 Article 모델 추가
- Post 요청 validation 추가

다른 브랜치랑 충돌 가능성: 거의 없음 / 약간 있음 / 있음
```

이런 식으로 **줄 요약** 방식으로 보고하면 됨.

---
</details> 

---
Pull Request 규칙 (PR Rule) <details> 
# ✅ **3) Pull Request 규칙 (PR Rule)**

### ✔ PR 보낼 때 꼭 포함해야 하는 정보

PR은 팀 문서라고 생각하면 됨.

```
### 작업 내용
- what: 무엇을 만들었는지
- why: 왜 필요한지
- how: 어떻게 구현했는지

### 테스트 방법
- 로컬에서 postman 사용해 테스트한 기록 추가

### 리뷰 요청 포인트
- validation 이 부분 확인 필요
- prisma 명세 추가된 부분 확인 필요
```

### ✔ PR Reviewer 지정

팀원 두 명 이상이 리뷰 후 approve 해야 머지 가능
→ 이걸 강제하려면 GitHub에서 Protect Branch 설정 가능 -> team4는 총 4명 한명이 부재중일경우 대비

---

</details> 

---

팀원들이 변경 사항 가져오는 규칙<details> 
# ✅ **4) 팀원들이 서로의 변경 사항을 가져오는 규칙**

### **항상 다음 순서로 진행:**

1. PR 머지됨
2. 팀장이 메인 업데이트 알림 전송
3. 팀원 명령어 실행

```
git checkout main
git pull origin main
```

4. 각자 브랜치 최신화:

```
git checkout feature/min-article
git merge main
```

또는

```
git rebase main
```

→ **팀원들의 브랜치는 항상 main 기반이어야 한다.**

---

</details> 

---

충돌 발생 시 규칙 <details> 
# ✅ **5) 충돌(conflict) 발생 시 규칙**

마스터가 팀장이라면 아래처럼 공표하면 됨:

1. 충돌 난 사람은 **절대 혼자 해결하지 말고** 단톡방에 알려라
2. 충돌 메시지를 그대로 캡쳐하고 공유
3. 충돌난 파일을 팀원 2명 이상 함께 보면서 해결
4. 충돌 해결 후 푸시할 때는:

```
git add .
git commit -m "fix: conflict resolved"
git push
```

---
</details>

---

메시지 템플릿 (팀 보고용) 방식 <details> 
# ✅ **6) 메시지 템플릿(팀에게 보고용)**

### 👤 **작업 완료 보고 템플릿 예시 입니다.**

```
[작업 완료] feature/min-article 브랜치

수정 사항:
- Article CRUD 구현
등등

다음 작업:
- 댓글 API 예정

PR 보냄 → 리뷰 부탁!
```

### 📌 **main 업데이트 템플릿**

```
📌 main 브랜치 최신화 알림

머지된 내용:
- 서준 auth 기능
- 지산 group 기능 일부

👇 업데이트 명령어
git checkout main
git pull origin main

👇 본인 브랜치 최신화 명령어
git checkout feature/min-article
git merge main
```

---

</details>

---

# 🚀 **7) 팀에서 반드시 금지해야 할 5가지**
1. ❌ main에서 직접 코딩
2. ❌ 팀원 브랜치 코드에 허락 없이 수정
3. ❌ PR 없이 바로 merge
4. ❌ 로컬 main을 pull 안 받아놓고 PR 보내는 행위
5. ❌ “commit 1, commit 2, final” 같은 의미 없는 커밋 메시지


<a id="bottom"></a>

# 관련 사이트 모음

프로젝트 간반 보드 - https://github.com/orgs/nb07-seven-team4/projects/1/views/1

프로젝트 소개 및 설명 - https://www.notion.so/nb07-seven-team4-2c38ae14c17b80f6b838d0e53302b307?showMoveTo=true&saveParent=true


프로젝트 prisma command - https://github.com/mimgggg4444/command/blob/main/projCommand.md
//위 링크의 다른 탭에 git command도 있어 팀에 도움되고자 올림

prisma docs - https://www.prisma.io/docs/getting-started/prisma-orm/add-to-existing-project/postgresql

express docs - https://devdocs.io/express/

postgresql docs - https://www.postgresql.org/docs/current/

# 팀원 깃 주소

하동우 - https://github.com/hadongwoo02

이서준 - https://github.com/qjdqjd1234

이지산 - https://github.com/jisan-lee

김민기 - https://github.com/mimgggg4444


