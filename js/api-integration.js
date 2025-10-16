// 조리식품 레시피 DB API 연동
class RecipeAPIManager {
    constructor() {
        this.apiKey = "fee0a951c8d7426aa79e"; // 공공데이터포털 API 키
        this.baseUrl = "http://apis.data.go.kr/1390802/AgriFood/Recipe/getRecipeList";
        this.cache = new Map(); // API 응답 캐시
        this.cacheTimeout = 5 * 60 * 1000; // 5분 캐시
        
        // 로컬 저장소 키들
        this.localStorageKeys = {
            apiRecipes: 'api_recipes_local',
            lastUpdate: 'api_recipes_last_update',
            totalCount: 'api_recipes_total_count'
        };
    }

    // API에서 레시피 목록 가져오기 (JSONP 방식)
    async fetchRecipesFromAPI(pageSize = 20) {
        try {
            console.log("🔍 조리식품 레시피 DB API에서 레시피 조회 중...");
            
            // JSONP 방식으로 API 호출 시도
            const data = await this.fetchWithJSONP(pageSize);
            
            if (data && data.response && data.response.body && data.response.body.items) {
                const recipes = data.response.body.items.map(item => this.formatRecipeData(item));
                
                // 캐시에 저장
                this.cache.set('api_recipes', {
                    data: recipes,
                    timestamp: Date.now()
                });
                
                console.log(`✅ API에서 ${recipes.length}개 레시피 조회 완료`);
                return recipes;
            } else {
                console.warn("⚠️ API 응답 형식이 예상과 다름");
                return this.getMockRecipes(pageSize); // 목업 데이터 반환
            }
            
        } catch (error) {
            console.error("❌ API 레시피 조회 실패:", error);
            console.log("🔄 목업 데이터로 대체합니다...");
            return this.getMockRecipes(pageSize); // 목업 데이터 반환
        }
    }


    // 목업 데이터 생성 (API 연결 실패 시 사용)
    getMockRecipes(count = 20) {
        const mockRecipes = [
            {
                id: `mock_${Date.now()}_1`,
                name: "🍲 된장찌개",
                category: "국&찌개",
                cooking_time: "20분",
                difficulty: "초급",
                servings: "2인분",
                ingredients: ["된장 2큰술", "두부 1/2모", "애호박 1/4개", "양파 1/2개", "대파 1대"],
                cooking_steps: [
                    { step: 1, text: "냄비에 물을 끓인다", image: null },
                    { step: 2, text: "된장을 풀어 넣는다", image: null },
                    { step: 3, text: "두부와 야채를 넣고 끓인다", image: null }
                ],
                tips: "된장은 체에 걸러서 넣으면 더 부드럽습니다.",
                image_main: "https://picsum.photos/400/200?random=1",
                source: "조리식품 레시피 DB (목업)",
                nutrition: { calories: "150kcal", protein: "8g", fat: "5g" }
            },
            {
                id: `mock_${Date.now()}_2`,
                name: "🥘 김치찌개",
                category: "국&찌개",
                cooking_time: "25분",
                difficulty: "초급",
                servings: "2인분",
                ingredients: ["김치 1컵", "돼지고기 100g", "두부 1/2모", "대파 1대"],
                cooking_steps: [
                    { step: 1, text: "돼지고기를 볶는다", image: null },
                    { step: 2, text: "김치를 넣고 볶는다", image: null },
                    { step: 3, text: "물을 넣고 끓인다", image: null }
                ],
                tips: "김치가 신맛이 날수록 더 맛있습니다.",
                image_main: "https://picsum.photos/400/200?random=2",
                source: "조리식품 레시피 DB (목업)",
                nutrition: { calories: "180kcal", protein: "12g", fat: "8g" }
            },
            {
                id: `mock_${Date.now()}_3`,
                name: "🍖 불고기",
                category: "일품",
                cooking_time: "30분",
                difficulty: "중급",
                servings: "3인분",
                ingredients: ["소고기 300g", "양파 1개", "당근 1/2개", "불고기 양념"],
                cooking_steps: [
                    { step: 1, text: "고기를 양념에 재운다", image: null },
                    { step: 2, text: "야채를 썬다", image: null },
                    { step: 3, text: "팬에서 볶는다", image: null }
                ],
                tips: "고기는 얇게 썰어야 부드럽습니다.",
                image_main: "https://picsum.photos/400/200?random=3",
                source: "조리식품 레시피 DB (목업)",
                nutrition: { calories: "250kcal", protein: "20g", fat: "12g" }
            },
            {
                id: `mock_${Date.now()}_4`,
                name: "🍜 라면",
                category: "일품",
                cooking_time: "10분",
                difficulty: "초급",
                servings: "1인분",
                ingredients: ["라면 1봉지", "물 500ml", "계란 1개", "대파 1대"],
                cooking_steps: [
                    { step: 1, text: "물을 끓인다", image: null },
                    { step: 2, text: "라면을 넣고 끓인다", image: null },
                    { step: 3, text: "계란을 넣고 완성한다", image: null }
                ],
                tips: "계란은 마지막에 넣어야 더 맛있습니다.",
                image_main: "https://picsum.photos/400/200?random=4",
                source: "조리식품 레시피 DB (목업)",
                nutrition: { calories: "400kcal", protein: "15g", fat: "20g" }
            },
            {
                id: `mock_${Date.now()}_5`,
                name: "🍱 비빔밥",
                category: "밥",
                cooking_time: "25분",
                difficulty: "초급",
                servings: "2인분",
                ingredients: ["밥 2공기", "나물 100g", "고추장 2큰술", "참기름 1큰술"],
                cooking_steps: [
                    { step: 1, text: "나물을 준비한다", image: null },
                    { step: 2, text: "고추장 양념을 만든다", image: null },
                    { step: 3, text: "밥과 나물을 비빈다", image: null }
                ],
                tips: "참기름을 넣으면 더 고소합니다.",
                image_main: "https://picsum.photos/400/200?random=5",
                source: "조리식품 레시피 DB (목업)",
                nutrition: { calories: "320kcal", protein: "12g", fat: "8g" }
            },
            {
                id: `mock_${Date.now()}_6`,
                name: "🥗 나물무침",
                category: "반찬",
                cooking_time: "15분",
                difficulty: "초급",
                servings: "4인분",
                ingredients: ["시금치 1단", "참기름 1큰술", "깨 1큰술", "소금 약간"],
                cooking_steps: [
                    { step: 1, text: "시금치를 데친다", image: null },
                    { step: 2, text: "참기름과 깨를 넣는다", image: null },
                    { step: 3, text: "무친다", image: null }
                ],
                tips: "시금치는 너무 오래 데치지 마세요.",
                image_main: "https://picsum.photos/400/200?random=6",
                source: "조리식품 레시피 DB (목업)",
                nutrition: { calories: "80kcal", protein: "5g", fat: "4g" }
            },
            {
                id: `mock_${Date.now()}_7`,
                name: "🍰 초코케이크",
                category: "후식",
                cooking_time: "60분",
                difficulty: "고급",
                servings: "8인분",
                ingredients: ["밀가루 200g", "초콜릿 100g", "버터 100g", "설탕 150g", "계란 3개"],
                cooking_steps: [
                    { step: 1, text: "재료를 준비한다", image: null },
                    { step: 2, text: "반죽을 만든다", image: null },
                    { step: 3, text: "오븐에서 굽는다", image: null }
                ],
                tips: "오븐 온도를 정확히 맞춰야 합니다.",
                image_main: "https://picsum.photos/400/200?random=7",
                source: "조리식품 레시피 DB (목업)",
                nutrition: { calories: "450kcal", protein: "8g", fat: "25g" }
            }
        ];

        // 요청한 개수만큼 반환 (순환)
        const result = [];
        for (let i = 0; i < count; i++) {
            const recipe = { ...mockRecipes[i % mockRecipes.length] };
            recipe.id = `mock_${Date.now()}_${i + 1}`;
            result.push(recipe);
        }
        return result;
    }

    // API 레시피를 로컬 저장소에 저장
    saveAPIRecipesToLocal(recipes) {
        try {
            const data = {
                recipes: recipes,
                timestamp: Date.now(),
                count: recipes.length,
                source: 'API'
            };
            
            localStorage.setItem(this.localStorageKeys.apiRecipes, JSON.stringify(data));
            localStorage.setItem(this.localStorageKeys.lastUpdate, Date.now().toString());
            localStorage.setItem(this.localStorageKeys.totalCount, recipes.length.toString());
            
            console.log(`💾 API 레시피 ${recipes.length}개를 로컬 저장소에 저장했습니다.`);
            return true;
        } catch (error) {
            console.error("❌ 로컬 저장소 저장 실패:", error);
            return false;
        }
    }

    // 로컬 저장소에서 API 레시피 불러오기
    loadAPIRecipesFromLocal() {
        try {
            const saved = localStorage.getItem(this.localStorageKeys.apiRecipes);
            if (saved) {
                const data = JSON.parse(saved);
                const lastUpdate = localStorage.getItem(this.localStorageKeys.lastUpdate);
                const daysSinceUpdate = (Date.now() - parseInt(lastUpdate)) / (1000 * 60 * 60 * 24);
                
                console.log(`📂 로컬 저장소에서 ${data.count}개 API 레시피 로드 (${daysSinceUpdate.toFixed(1)}일 전 저장)`);
                return data.recipes;
            }
        } catch (error) {
            console.warn("⚠️ 로컬 저장소에서 API 레시피 로드 실패:", error);
        }
        return [];
    }

    // 대량 API 레시피 다운로드 (전체 저장용)
    async downloadAllAPIRecipes() {
        console.log("📥 API에서 전체 레시피 다운로드 시작...");
        
        try {
            const allRecipes = [];
            const batchSize = 100; // 한 번에 100개씩
            let pageNo = 1;
            let hasMoreData = true;
            
            while (hasMoreData && pageNo <= 10) { // 최대 10페이지 (1000개)
                console.log(`📄 페이지 ${pageNo} 다운로드 중...`);
                
                try {
                    const batchRecipes = await this.fetchWithJSONP(batchSize, pageNo);
                    
                    if (batchRecipes && batchRecipes.response && batchRecipes.response.body && batchRecipes.response.body.items) {
                        const recipes = batchRecipes.response.body.items.map(item => this.formatRecipeData(item));
                        allRecipes.push(...recipes);
                        
                        console.log(`✅ 페이지 ${pageNo}: ${recipes.length}개 레시피 다운로드`);
                        
                        // 다음 페이지가 있는지 확인
                        if (recipes.length < batchSize) {
                            hasMoreData = false;
                        }
                        pageNo++;
                        
                        // API 부하 방지를 위한 딜레이
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        hasMoreData = false;
                    }
                } catch (error) {
                    console.warn(`⚠️ 페이지 ${pageNo} 다운로드 실패:`, error);
                    hasMoreData = false;
                }
            }
            
            if (allRecipes.length > 0) {
                // 로컬 저장소에 저장
                this.saveAPIRecipesToLocal(allRecipes);
                
                // 캐시에도 저장
                this.cache.set('api_recipes', {
                    data: allRecipes,
                    timestamp: Date.now()
                });
                
                console.log(`🎉 전체 다운로드 완료: ${allRecipes.length}개 레시피`);
                return allRecipes;
            } else {
                console.warn("⚠️ 다운로드된 레시피가 없습니다.");
                return [];
            }
            
        } catch (error) {
            console.error("❌ 전체 API 레시피 다운로드 실패:", error);
            return [];
        }
    }

    // JSONP 호출 (페이지 번호 지원)
    fetchWithJSONP(pageSize, pageNo = 1) {
        return new Promise((resolve, reject) => {
            const callbackName = `jsonp_callback_${Date.now()}`;
            const script = document.createElement('script');
            
            const url = new URL(this.baseUrl);
            url.searchParams.set('serviceKey', this.apiKey);
            url.searchParams.set('pageNo', pageNo);
            url.searchParams.set('numOfRows', pageSize);
            url.searchParams.set('type', 'json');
            url.searchParams.set('callback', callbackName);
            
            // 글로벌 콜백 함수 설정
            window[callbackName] = (data) => {
                document.head.removeChild(script);
                delete window[callbackName];
                resolve(data);
            };
            
            // 에러 처리
            script.onerror = () => {
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('JSONP request failed'));
            };
            
            // 타임아웃 설정 (15초)
            setTimeout(() => {
                if (window[callbackName]) {
                    document.head.removeChild(script);
                    delete window[callbackName];
                    reject(new Error('JSONP request timeout'));
                }
            }, 15000);
            
            script.src = url.toString();
            document.head.appendChild(script);
        });
    }

    // API 데이터를 웹사이트 형식으로 변환
    formatRecipeData(item) {
        return {
            id: `api_${item.RCP_SEQ || Date.now()}`,
            name: item.RCP_NM || "레시피명 없음",
            category: item.RCP_PAT2 || "기타",
            cooking_time: item.INFO_ENG || "30분",
            difficulty: item.RCP_PAT3 || "초급",
            servings: item.INFO_WGT || "2인분",
            ingredients: item.RCP_PARTS_DTLS ? item.RCP_PARTS_DTLS.split(',') : [],
            cooking_steps: this.parseCookingSteps(item),
            tips: item.RCP_TIPS || "",
            image_main: item.ATT_FILE_NO_MK || "https://picsum.photos/400/200?random=1",
            source: "조리식품 레시피 DB",
            nutrition: {
                calories: item.INFO_CAR || "정보 없음",
                protein: item.INFO_PRO || "정보 없음",
                fat: item.INFO_FAT || "정보 없음"
            }
        };
    }

    // 조리 과정 파싱 (조리식품 레시피 DB API용)
    parseCookingSteps(item) {
        const steps = [];
        
        // MANUAL01~MANUAL20 필드에서 조리 과정 추출
        for (let i = 1; i <= 20; i++) {
            const manualField = `MANUAL${i.toString().padStart(2, '0')}`;
            const imgField = `MANUAL_IMG${i.toString().padStart(2, '0')}`;
            
            if (item[manualField] && item[manualField].trim()) {
                steps.push({
                    step: i,
                    text: item[manualField].trim(),
                    image: item[imgField] || null
                });
            }
        }
        
        return steps;
    }

    // 캐시에서 데이터 가져오기
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    // 로컬 저장소 데이터만 사용 (API 연결 없음)
    async getCombinedRecipes(localRecipes = [], apiPageSize = 100) {
        try {
            console.log("📂 로컬 저장소에서만 레시피 로드 (API 연결 없음)");
            
            // 로컬 저장소에서만 데이터 가져오기
            const localApiRecipes = this.loadAPIRecipesFromLocal();
            
            if (localApiRecipes.length > 0) {
                console.log(`✅ 로컬 저장소에서 ${localApiRecipes.length}개 API 레시피 로드`);
                
                // 스케줄러를 통해 점진적 업데이트 적용
                if (typeof contentScheduler !== 'undefined') {
                    console.log("📅 스케줄러를 통한 점진적 업데이트 적용");
                    return await contentScheduler.scheduleRecipeUpdates(localApiRecipes, localRecipes);
                } else {
                    // 스케줄러가 없는 경우 기존 방식 사용
                    const localRecipeNames = new Set(localRecipes.map(r => r.name));
                    const uniqueApiRecipes = localApiRecipes.filter(r => !localRecipeNames.has(r.name));
                    return [...localRecipes, ...uniqueApiRecipes.slice(0, 20)]; // 최대 20개만
                }
            } else {
                console.log("⚠️ 로컬 저장소에 API 레시피가 없습니다.");
                console.log("💡 'testSchedule.downloadAll()' 명령으로 먼저 다운로드하세요.");
                
                // 로컬 저장소에 데이터가 없으면 목업 데이터 사용
                const mockRecipes = this.getMockRecipes(10);
                console.log(`🔄 목업 데이터 ${mockRecipes.length}개로 대체`);
                
                if (typeof contentScheduler !== 'undefined') {
                    return await contentScheduler.scheduleRecipeUpdates(mockRecipes, localRecipes);
                } else {
                    return [...localRecipes, ...mockRecipes];
                }
            }
            
        } catch (error) {
            console.error("❌ 레시피 통합 실패:", error);
            return localRecipes; // 실패시 로컬 데이터만 반환
        }
    }

    // 로컬 저장소 상태 확인 (API 연결 없음)
    checkAPIStatus() {
        const localRecipes = this.loadAPIRecipesFromLocal();
        const hasLocalData = localRecipes.length > 0;
        
        if (hasLocalData) {
            console.log(`📂 로컬 저장소: ${localRecipes.length}개 레시피 사용 가능`);
            return true;
        } else {
            console.log("⚠️ 로컬 저장소에 레시피가 없습니다. 먼저 다운로드하세요.");
            return false;
        }
    }
}

// 전역 API 매니저 인스턴스
const recipeAPIManager = new RecipeAPIManager();

// 기존 loadRecipes 함수를 확장
async function loadRecipesWithAPI() {
    console.log("🚀 API 연동 레시피 로드 시작...");
    
    // API 상태 확인
    const apiStatus = await recipeAPIManager.checkAPIStatus();
    console.log(`📡 API 상태: ${apiStatus ? '연결됨' : '연결 실패'}`);
    
    // 로컬 레시피 먼저 로드
    const localRecipes = await loadLocalRecipes();
    
    if (apiStatus) {
        // API 데이터와 통합
        const combinedRecipes = await recipeAPIManager.getCombinedRecipes(localRecipes, 20);
        allRecipes = combinedRecipes;
    } else {
        console.log("📦 API 연결 실패, 로컬 데이터만 사용");
        allRecipes = localRecipes;
    }
    
    // UI 업데이트
    if ($('#popularRecipes').length) {
        displayPopularRecipes();
    }
    
    if ($('#recipeList').length) {
        displayAllRecipes();
    }
    
    // API 상태 표시
    updateAPIStatus(apiStatus);
}

// 로컬 레시피 로드 함수
async function loadLocalRecipes() {
    const paths = [
        'recipes.json',
        './recipes.json',
        '/recipes.json',
        'data/recipes.json',
        './data/recipes.json',
        '/data/recipes.json'
    ];
    
    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ 로컬 레시피 ${data.length}개 로드 (${path})`);
                return data;
            }
        } catch (error) {
            console.log(`❌ ${path} 로드 실패`);
        }
    }
    
    console.warn("⚠️ 로컬 레시피 데이터를 찾을 수 없음");
    return [];
}

// API 상태 표시 업데이트
function updateAPIStatus(isConnected) {
    const statusElement = document.getElementById('apiStatus');
    if (statusElement) {
        statusElement.innerHTML = isConnected 
            ? '<i class="fas fa-wifi text-success"></i> API 연결됨'
            : '<i class="fas fa-wifi text-warning"></i> API 연결 안됨 (로컬 데이터만 사용)';
    }
}

// 새로고침 버튼 추가
function addRefreshButton() {
    const apiControls = document.getElementById('apiControls');
    if (apiControls) {
        apiControls.innerHTML = `
            <div class="text-center mb-3">
                <button class="btn btn-outline-primary btn-sm" onclick="refreshAPIRecipes()">
                    <i class="fas fa-sync-alt"></i> API 데이터 새로고침
                </button>
                <span id="apiStatus" class="ms-3"></span>
            </div>
        `;
    }
}

// API 데이터 새로고침
async function refreshAPIRecipes() {
    console.log("🔄 API 데이터 새로고침 중...");
    
    // 캐시 클리어
    recipeAPIManager.cache.clear();
    
    // 새로 로드
    await loadRecipesWithAPI();
    
    console.log("✅ API 데이터 새로고침 완료");
}

// 페이지 로드 시 API 연동 초기화
$(document).ready(function() {
    console.log("🔌 API 연동 초기화...");
    
    // API 컨트롤 영역 추가
    if ($('#popularRecipes').length) {
        const controlsHtml = '<div id="apiControls" class="mb-4"></div>';
        $('#popularRecipes').before(controlsHtml);
        addRefreshButton();
    }
    
    // API 연동 레시피 로드
    loadRecipesWithAPI();
});
