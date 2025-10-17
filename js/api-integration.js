// 조리식품 레시피 DB API 연동 (목업 데이터 제거됨)
class RecipeAPIManager {
    constructor() {
        this.apiKey = "fee0a951c8d7426aa79e"; // 공공데이터포털 API 키
        
        // 프록시 서버 URL (로컬 Python 서버)
        this.proxyUrl = "http://localhost:5000/api/recipes";
        this.proxyUrlAll = "http://localhost:5000/api/recipes/all";
        
        this.cache = new Map(); // API 응답 캐시
        this.cacheTimeout = 5 * 60 * 1000; // 5분 캐시
        
        // 로컬 저장소 키들
        this.localStorageKeys = {
            apiRecipes: 'api_recipes_local',
            lastUpdate: 'api_recipes_last_update',
            totalCount: 'api_recipes_total_count'
        };
    }

    // API에서 레시피 목록 가져오기 (프록시 서버 사용)
    async fetchRecipesFromAPI(pageSize = 20) {
        try {
            console.log("🔍 조리식품 레시피 DB API에서 레시피 조회 중...");
            
            const response = await fetch(`${this.proxyUrl}?pageSize=${pageSize}&pageNo=1`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.COOKRCP01 && data.COOKRCP01.row && data.COOKRCP01.row.length > 0) {
                const recipes = data.COOKRCP01.row.map(item => this.formatRecipeData(item));
                
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
            localStorage.setItem(this.localStorageKeys.lastUpdate, new Date().toLocaleString());
            localStorage.setItem(this.localStorageKeys.totalCount, recipes.length.toString());
            
            console.log(`💾 API 레시피 ${recipes.length}개를 로컬 저장소에 저장했습니다.`);
        } catch (error) {
            console.error("❌ 로컬 저장소 저장 실패:", error);
        }
    }

    // 로컬 저장소에서 API 레시피 로드 (HTTPS 변환 포함)
    loadAPIRecipesFromLocal() {
        try {
            const data = localStorage.getItem(this.localStorageKeys.apiRecipes);
            if (data) {
                const parsedData = JSON.parse(data);
                const recipes = parsedData.recipes || [];
                
                // 기존 저장된 레시피들의 이미지 URL을 HTTPS로 변환
                const updatedRecipes = recipes.map(recipe => {
                    if (recipe.image_main && recipe.image_main.startsWith('http://')) {
                        recipe.image_main = recipe.image_main.replace('http://', 'https://');
                        console.log(`🔒 이미지 URL HTTPS 변환: ${recipe.name}`);
                    }
                    return recipe;
                });
                
                // 변환된 레시피들을 다시 로컬 저장소에 저장
                this.saveAPIRecipesToLocal(updatedRecipes);
                console.log(`💾 HTTPS 변환된 레시피들을 로컬 저장소에 업데이트했습니다.`);
                
                return updatedRecipes;
            }
        } catch (error) {
            console.warn("⚠️ 로컬 저장소에서 API 레시피 로드 실패:", error);
        }
        return [];
    }

    // 대량 API 레시피 다운로드 (프록시 서버 사용 - 1000개)
    async downloadAllAPIRecipes() {
        console.log("📥 프록시 서버를 통한 전체 레시피 다운로드 시작...");
        console.log("⚠️ 프록시 서버가 실행 중이어야 합니다!");
        
        try {
            // 프록시 서버의 /api/recipes/all 엔드포인트 사용
            console.log(`🌐 프록시 서버 호출: ${this.proxyUrlAll}`);
            
            const response = await fetch(this.proxyUrlAll);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.recipes && data.recipes.length > 0) {
                const recipes = data.recipes.map(item => this.formatRecipeData(item));
                
                console.log(`✅ API에서 ${recipes.length}개 실제 레시피 다운로드 완료`);
                
                // 로컬 저장소에 저장
                this.saveAPIRecipesToLocal(recipes);
                
                // 캐시에도 저장
                this.cache.set('api_recipes', {
                    data: recipes,
                    timestamp: Date.now()
                });
                
                console.log(`🎉 전체 다운로드 완료: ${recipes.length}개 레시피`);
                console.log(`💾 로컬 저장소에 저장 완료`);
                
                return recipes;
            } else {
                console.error("❌ API 응답에 레시피 데이터가 없습니다.");
                console.log("💡 프록시 서버를 확인하세요: python api_proxy_server.py");
                return [];
            }
            
        } catch (error) {
            console.error("❌ 전체 레시피 다운로드 실패:", error.message);
            console.log("");
            console.log("🔧 프록시 서버 실행 방법:");
            console.log("1. 새 터미널 열기");
            console.log("2. 명령어 실행: python api_proxy_server.py");
            console.log("3. 서버가 실행되면 다시 시도");
            console.log("");
            return [];
        }
    }

    // 로컬 저장소 기반 레시피 통합 (스케줄러 없음)
    async getCombinedRecipes(localRecipes = [], apiPageSize = 100) {
        try {
            console.log("📂 로컬 저장소에서 레시피 로드 (스케줄러 없음)");
            
            // 로컬 저장소에서만 데이터 가져오기
            const localApiRecipes = this.loadAPIRecipesFromLocal();
            
            if (localApiRecipes.length > 0) {
                console.log(`✅ 로컬 저장소에서 ${localApiRecipes.length}개 API 레시피 로드`);
                
                // 중복 제거
                const localRecipeNames = new Set(localRecipes.map(r => r.name));
                const uniqueApiRecipes = localApiRecipes.filter(r => !localRecipeNames.has(r.name));
                
                // 모든 API 레시피 반환 (스케줄러 없음)
                const allRecipes = [...localRecipes, ...uniqueApiRecipes];
                console.log(`🎯 총 ${allRecipes.length}개 레시피 반환 (스케줄러 없음)`);
                
                return allRecipes;
            } else {
                console.log("⚠️ 로컬 저장소에 API 레시피가 없습니다.");
                console.log("💡 'testSchedule.downloadAll()' 명령으로 먼저 다운로드하세요.");
                
                return localRecipes;
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
            const lastUpdate = localStorage.getItem(this.localStorageKeys.lastUpdate);
            console.log(`📦 로컬 저장소 상태: ${localRecipes.length}개 레시피 저장됨 (${lastUpdate})`);
            return {
                connected: true,
                message: `로컬 저장소에서 레시피 로드됨 (${localRecipes.length}개)`,
                count: localRecipes.length,
                lastUpdate: lastUpdate
            };
        } else {
            console.log("📦 로컬 저장소 상태: 데이터 없음");
            return {
                connected: false,
                message: "로컬 저장소에 데이터 없음",
                count: 0,
                lastUpdate: null
            };
        }
    }

    // 레시피 데이터 포맷팅 (조리식품 레시피 DB API용)
    formatRecipeData(item) {
        // 이미지 URL 처리 (HTTPS 우선, 없으면 기본 이미지)
        let imageUrl = item.ATT_FILE_NO_MK || "https://picsum.photos/400/200?random=1";
        
        // HTTP URL을 HTTPS로 변환 (Mixed Content 방지)
        if (imageUrl && imageUrl.startsWith('http://')) {
            imageUrl = imageUrl.replace('http://', 'https://');
        }
        
        // URL이 유효하지 않으면 기본 이미지 사용
        if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') {
            imageUrl = "https://picsum.photos/400/200?random=1";
        }
        
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
            image_main: imageUrl,
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
                // 조리순서 이미지 URL을 HTTPS로 변환
                let stepImage = item[imgField] || null;
                if (stepImage && stepImage.startsWith('http://')) {
                    stepImage = stepImage.replace('http://', 'https://');
                }
                
                steps.push({
                    step: i,
                    text: item[manualField].trim(),
                    image: stepImage
                });
            }
        }
        
        return steps.length > 0 ? steps : [
            { step: 1, text: "상세 조리 과정은 레시피 상세 페이지에서 확인하세요.", image: null }
        ];
    }
}

// 전역 인스턴스 생성
const recipeAPIManager = new RecipeAPIManager();

// 개발자 콘솔용 도구들
window.testSchedule = {
    // 스케줄 리셋
    reset: function() {
        localStorage.removeItem('recipe_schedule_displayed_ids');
        localStorage.removeItem('recipe_schedule_last_update');
        localStorage.removeItem('recipe_schedule_total_count');
        console.log("🔄 스케줄 리셋 완료");
    },
    
    // 로컬 저장소 상태 확인
    checkLocalStorage: function() {
        const apiData = localStorage.getItem('api_recipes_local');
        const lastUpdate = localStorage.getItem('api_recipes_last_update');
        const totalCount = localStorage.getItem('api_recipes_total_count');
        
        let recipes = [];
        if (apiData) {
            try {
                const parsed = JSON.parse(apiData);
                recipes = parsed.recipes || [];
            } catch (e) {
                console.error("로컬 저장소 데이터 파싱 오류:", e);
            }
        }
        
        const result = {
            storedRecipes: recipes.length,
            totalCount: totalCount || '없음',
            lastUpdate: lastUpdate || '없음'
        };
        
        console.log("💾 로컬 저장소 상태:", result);
        console.log({ count: recipes.length, lastUpdate: lastUpdate, recipes: recipes });
        
        return result;
    },
    
    // 로컬 저장소 초기화
    clearLocalStorage: function() {
        localStorage.removeItem('api_recipes_local');
        localStorage.removeItem('api_recipes_last_update');
        localStorage.removeItem('api_recipes_total_count');
        localStorage.removeItem('recipe_schedule_displayed_ids');
        localStorage.removeItem('recipe_schedule_last_update');
        localStorage.removeItem('recipe_schedule_total_count');
        console.log("🗑️ 로컬 저장소 초기화 완료");
    },
    
    // 전체 API 레시피 다운로드
    downloadAll: async function() {
        console.log("📥 전체 API 레시피 다운로드 시작...");
        try {
            const recipes = await recipeAPIManager.downloadAllAPIRecipes();
            console.log(`✅ 다운로드 완료: ${recipes.length}개 레시피`);
            
            console.log("🔄 페이지를 새로고침하여 새 데이터를 반영합니다...");
            setTimeout(() => window.location.reload(), 2000);
            
            return recipes;
        } catch (error) {
            console.error("❌ 다운로드 실패:", error);
        }
    }
};
