# MyRecipeNote 정적 웹사이트

## 📦 배포 파일

**도메인**: myrecipenote.com  
**파일 형식**: HTML / CSS / JavaScript (정적 웹사이트)

---

## 📁 파일 구조

```
myrecipenote_static/
├── index.html              # 메인 페이지
├── recipes.html            # 레시피 목록
├── recipe_detail.html      # 레시피 상세
│
├── css/
│   ├── style.css           # 메인 스타일
│   └── recipe_detail.css   # 상세 페이지 스타일
│
├── js/
│   ├── main.js             # 메인 스크립트
│   ├── recipes.js          # 목록 페이지 스크립트
│   └── recipe_detail.js    # 상세 페이지 스크립트
│
├── data/
│   ├── recipes.json        # 레시피 데이터 (460개)
│   └── categories.json     # 카테고리 데이터
│
└── images/                 # 이미지 폴더 (필요시 추가)
```

---

## 🚀 배포 방법

### 방법 1: FTP 업로드 (가장 간단)

1. **FTP 클라이언트 사용** (FileZilla 등)
   ```
   호스트: myrecipenote.com FTP 주소
   사용자: [FTP 계정]
   비밀번호: [FTP 비밀번호]
   ```

2. **파일 업로드**
   ```
   로컬: C:\Users\user\Desktop\test\myrecipenote_static\*
   서버: public_html/ (또는 /var/www/html/)
   ```

3. **완료!**
   ```
   https://myrecipenote.com 접속
   ```

---

### 방법 2: cPanel 파일 관리자

1. **cPanel 로그인**
2. **파일 관리자** 클릭
3. **public_html 폴더** 이동
4. **업로드** 버튼 클릭
5. **모든 파일 업로드**

---

### 방법 3: ZIP 압축 후 서버에서 해제

1. **ZIP 파일 업로드**
   ```
   myrecipenote_static_website.zip
   ```

2. **서버에서 압축 해제**
   ```bash
   cd public_html/
   unzip myrecipenote_static_website.zip
   ```

---

## ✅ 배포 체크리스트

### 파일 확인
- [ ] index.html
- [ ] recipes.html  
- [ ] recipe_detail.html
- [ ] css/ 폴더
- [ ] js/ 폴더
- [ ] data/ 폴더

### 권한 설정 (Linux 서버인 경우)
```bash
chmod 755 public_html/
chmod 644 public_html/*.html
chmod 644 public_html/css/*
chmod 644 public_html/js/*
chmod 644 public_html/data/*
```

### 테스트
- [ ] https://myrecipenote.com (메인 페이지)
- [ ] https://myrecipenote.com/recipes.html (목록)
- [ ] https://myrecipenote.com/recipe_detail.html?id=28 (상세)
- [ ] 검색 기능
- [ ] 카테고리 필터
- [ ] 모바일 반응형

---

## 🎯 주요 기능

### 완벽 구현 ✅
- 메인 페이지
- 레시피 목록 (460개)
- 레시피 검색
- 카테고리 필터
- 페이지네이션
- 레시피 상세 (조리순서 + 이미지)
- 영양 정보
- 광고 영역
- 반응형 디자인

### 제외 기능 (동적 기능 불필요)
- 사용자 로그인
- 댓글 시스템
- 좋아요 기능
- 데이터베이스 연동

---

## 📊 데이터 정보

### 레시피 데이터
```
총 460개 레시피
5개 카테고리
파일 크기: 약 315 KB
```

### 카테고리
- 국&찌개
- 반찬
- 후식
- 일품
- 기타

---

## 🔧 수정 방법

### HTML 수정
```
index.html, recipes.html, recipe_detail.html 편집
→ FTP로 재업로드
→ 완료! (재시작 불필요)
```

### CSS 수정
```
css/style.css 편집
→ FTP로 재업로드
→ 브라우저 캐시 삭제 (Ctrl+F5)
```

### 데이터 수정
```
1. 로컬에서 wtable_recipes.db 수정
2. python export_recipes_to_json.py 실행
3. data/recipes.json 업로드
→ 완료!
```

---

## 🌐 외부 라이브러리 (CDN)

```
✅ Bootstrap 5.1.3
✅ Font Awesome 6.0.0
✅ jQuery 3.6.0
✅ Google Fonts (Noto Sans KR)
```

모두 CDN으로 로드되므로 인터넷 연결 필요

---

## 💡 장점

### 정적 웹사이트 장점
```
✅ 배포 간단 (FTP만 있으면 됨)
✅ 서버 설정 불필요 (Python, DB 불필요)
✅ 빠른 속도
✅ 저렴한 호스팅 비용
✅ 높은 보안성
✅ 수정 간편
```

### 단점
```
❌ 실시간 데이터 업데이트 불가
❌ 사용자 인터랙션 제한
❌ 검색 엔진 최적화 제한적
```

---

## 🔄 업데이트 방법

### 레시피 추가/수정
```
1. 로컬 DB 수정
2. export_recipes_to_json.py 실행
3. data/recipes.json 재업로드
→ 즉시 반영!
```

### 디자인 수정
```
1. HTML/CSS 수정
2. FTP 재업로드
→ 즉시 반영!
```

---

## 📞 배포 후 확인

### 필수 체크
```
✅ 메인 페이지 로딩
✅ 레시피 카드 표시
✅ 검색 기능
✅ 카테고리 필터
✅ 상세 페이지
✅ 조리 순서 + 이미지
✅ 모바일 반응형
```

---

## 🎉 완성!

이 폴더 안의 모든 파일을:
1. ZIP으로 압축하거나
2. FTP로 직접 업로드

하면 됩니다!

**myrecipenote.com에서 바로 작동합니다!** 🚀




