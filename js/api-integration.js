// 조리식품 레시피 DB API 연동
class RecipeAPIManager {
    constructor() {
        this.apiKey = "fee0a951c8d7426aa79e"; // 공공데이터포털 API 키
        this.baseUrl = "http://apis.data.go.kr/1390802/AgriFood/Recipe/getRecipeList";
        this.cache = new Map(); // API 응답 캐시
        this.cacheTimeout = 5 * 60 * 1000; // 5분 캐시
    }

    // API에서 레시피 목록 가져오기
    async fetchRecipesFromAPI(pageSize = 20) {
        try {
            console.log("🔍 조리식품 레시피 DB API에서 레시피 조회 중...");
            
            const url = this.baseUrl;
            const params = new URLSearchParams({
                'serviceKey': this.apiKey,
                'pageNo': 1,
                'numOfRows': pageSize,
                'type': 'json'
            });

            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response && data.response.body && data.response.body.items) {
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
                return [];
            }
            
        } catch (error) {
            console.error("❌ API 레시피 조회 실패:", error);
            return [];
        }
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

    // 로컬 데이터와 API 데이터 통합 (스케줄러 연동)
    async getCombinedRecipes(localRecipes = [], apiPageSize = 100) {
        try {
            // API에서 더 많은 데이터 가져오기 (스케줄링을 위해)
            const cachedApiRecipes = this.getCachedData('api_recipes');
            let apiRecipes = [];
            
            if (cachedApiRecipes) {
                console.log("📦 캐시에서 API 레시피 로드");
                apiRecipes = cachedApiRecipes;
            } else {
                console.log("🌐 API에서 레시피 대량 로드 (스케줄링용)");
                apiRecipes = await this.fetchRecipesFromAPI(apiPageSize);
            }
            
            // 스케줄러를 통해 점진적 업데이트 적용
            if (typeof contentScheduler !== 'undefined') {
                console.log("📅 스케줄러를 통한 점진적 업데이트 적용");
                return await contentScheduler.scheduleRecipeUpdates(apiRecipes, localRecipes);
            } else {
                // 스케줄러가 없는 경우 기존 방식 사용
                const localRecipeNames = new Set(localRecipes.map(r => r.name));
                const uniqueApiRecipes = apiRecipes.filter(r => !localRecipeNames.has(r.name));
                return [...localRecipes, ...uniqueApiRecipes.slice(0, 20)]; // 최대 20개만
            }
            
        } catch (error) {
            console.error("❌ 레시피 통합 실패:", error);
            return localRecipes; // 실패시 로컬 데이터만 반환
        }
    }

    // API 상태 확인
    async checkAPIStatus() {
        try {
            const testRecipes = await this.fetchRecipesFromAPI(1);
            return testRecipes.length > 0;
        } catch (error) {
            console.error("API 상태 확인 실패:", error);
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
