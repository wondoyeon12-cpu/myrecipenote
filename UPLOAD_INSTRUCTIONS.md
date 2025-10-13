# MyRecipeNote.com 업로드 가이드

## ⚠️ 중요! 파일 업로드 순서

### 1. 폴더 구조 그대로 업로드
```
서버의 루트 디렉토리 (public_html/ 또는 www/)에:

✅ index.html
✅ recipes.html
✅ recipe_detail.html
✅ css/ (폴더 전체)
✅ js/ (폴더 전체)
✅ data/ (폴더 전체) ⭐ 중요!
```

### 2. 최종 서버 구조
```
public_html/
├── index.html
├── recipes.html
├── recipe_detail.html
├── css/
│   ├── style.css
│   └── recipe_detail.css
├── js/
│   ├── main.js
│   ├── recipes.js
│   └── recipe_detail.js
└── data/          ⭐ 이 폴더가 꼭 있어야 합니다!
    ├── recipes.json
    └── categories.json
```

---

## 🔍 문제 해결

### "데이터가 null"로 나오는 경우

#### 원인 1: data 폴더가 업로드 안 됨
```
해결: data/ 폴더를 반드시 업로드하세요!
```

#### 원인 2: 경로 문제
```
브라우저 개발자 도구(F12) > Console 탭 확인
→ 어떤 경로에서 에러가 나는지 확인
```

#### 원인 3: 파일 권한 문제 (Linux 서버)
```bash
# SSH로 접속 후
cd public_html/
chmod 644 data/*.json
chmod 755 data/
```

#### 원인 4: CORS 문제
```
해결: .htaccess 파일 추가 (아래 참조)
```

---

## 📄 .htaccess 파일 추가 (선택사항)

서버 루트에 `.htaccess` 파일 생성:

```apache
# CORS 허용
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# JSON 파일 MIME 타입
AddType application/json .json

# 캐싱 설정
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType application/json "access plus 1 day"
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>

# Gzip 압축
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

---

## 🧪 업로드 후 테스트

### 1. 브라우저 개발자 도구 열기
```
F12 키 누르기
```

### 2. Console 탭 확인
```
✅ 정상: "✅ 460개 레시피 로드 완료"
❌ 에러: "❌ 레시피 데이터 로드 실패"
```

### 3. Network 탭 확인
```
data/recipes.json 파일이:
✅ 200 OK → 정상
❌ 404 Not Found → 파일이 없음 (재업로드)
❌ 403 Forbidden → 권한 문제
```

### 4. 직접 JSON 파일 접속
```
https://myrecipenote.com/data/recipes.json
```
이 주소로 접속했을 때 JSON 데이터가 보이면 정상!

---

## 🔧 디버깅 단계

### Step 1: 파일 존재 확인
```
https://myrecipenote.com/data/recipes.json
→ JSON 데이터가 보이나요?
```

### Step 2: Console 로그 확인
```
F12 > Console 탭
→ 어떤 에러가 나오나요?
```

### Step 3: Network 요청 확인
```
F12 > Network 탭
→ recipes.json 요청이 있나요?
→ 상태 코드는 무엇인가요?
```

---

## 📦 재업로드 방법

### FTP 사용 시
```
1. data/ 폴더를 삭제
2. 다시 data/ 폴더 업로드
3. 브라우저에서 Ctrl+F5 (강력 새로고침)
```

### cPanel 사용 시
```
1. 파일 관리자에서 data/ 폴더 확인
2. recipes.json 파일이 있는지 확인
3. 없으면 재업로드
```

---

## ✅ 체크리스트

### 필수 확인사항
- [ ] index.html 업로드됨
- [ ] recipes.html 업로드됨
- [ ] recipe_detail.html 업로드됨
- [ ] css/ 폴더 업로드됨
- [ ] js/ 폴더 업로드됨
- [ ] **data/ 폴더 업로드됨** ⭐ 중요!
- [ ] data/recipes.json 파일 있음
- [ ] data/categories.json 파일 있음

### 접속 테스트
- [ ] https://myrecipenote.com/data/recipes.json 직접 접속
- [ ] F12 > Console에서 "✅ 460개 레시피 로드 완료" 확인
- [ ] 메인 페이지에 레시피 카드 8개 표시

---

## 💡 가장 흔한 문제

### 문제: "data/recipes.json를 불러올 수 없습니다"
```
원인: data 폴더가 업로드되지 않음
해결: data 폴더를 다시 업로드
```

### 문제: "404 Not Found"
```
원인: 파일 경로가 틀림
해결: 폴더 구조 확인
```

### 문제: "CORS 에러"
```
원인: 보안 정책
해결: .htaccess 파일 추가 (위 참조)
```

---

## 📞 긴급 지원

F12 > Console 탭의 에러 메시지를 알려주시면 정확한 해결 방법을 안내해드리겠습니다!

---

**data 폴더를 꼭 업로드하세요!** 📁✨




