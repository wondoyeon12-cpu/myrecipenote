// 점진적 콘텐츠 업데이트 스케줄러
class ContentScheduler {
    constructor() {
        this.INITIAL_COUNT = 30; // 초기 레시피 개수
        this.UPDATE_INTERVAL = 3; // 업데이트 주기 (일)
        this.UPDATE_COUNT = 2; // 한 번에 추가되는 레시피 개수
        this.START_DATE = new Date('2025-01-16'); // 시작 날짜 (오늘)
        this.UPDATE_TIME = '09:00'; // 업데이트 시간 (오전 9시)
        
        this.storageKey = 'recipe_schedule_progress';
        this.allApiRecipes = []; // API에서 가져온 모든 레시피
        this.displayedRecipeIds = new Set(); // 이미 표시된 레시피 ID들
    }

    // 오늘 표시해야 할 레시피 개수 계산
    getTodayRecipeCount() {
        const today = new Date();
        const daysSinceStart = Math.floor((today - this.START_DATE) / (1000 * 60 * 60 * 24));
        
        // 초기 30개 + (경과 일수 / 3일 주기) * 2개
        const additionalCount = Math.floor(daysSinceStart / this.UPDATE_INTERVAL) * this.UPDATE_COUNT;
        
        return Math.min(this.INITIAL_COUNT + additionalCount, 1000); // 최대 1000개 제한
    }

    // 다음 업데이트 날짜 계산
    getNextUpdateDate() {
        const today = new Date();
        const daysSinceStart = Math.floor((today - this.START_DATE) / (1000 * 60 * 60 * 24));
        
        // 다음 업데이트까지 남은 일수 계산
        const nextUpdateDays = this.UPDATE_INTERVAL - (daysSinceStart % this.UPDATE_INTERVAL);
        
        const nextUpdate = new Date(today);
        nextUpdate.setDate(today.getDate() + nextUpdateDays);
        
        // 업데이트 시간 설정 (오전 9시)
        const [hours, minutes] = this.UPDATE_TIME.split(':');
        nextUpdate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        return nextUpdate;
    }

    // 진행 상태 저장
    saveProgress(recipeIds, totalCount) {
        const progress = {
            displayedRecipeIds: Array.from(recipeIds),
            totalDisplayedCount: totalCount,
            lastUpdateDate: new Date().toISOString(),
            nextUpdateDate: this.getNextUpdateDate().toISOString()
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(progress));
        console.log("💾 레시피 진행 상태 저장:", progress);
    }

    // 진행 상태 불러오기
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const progress = JSON.parse(saved);
                this.displayedRecipeIds = new Set(progress.displayedRecipeIds || []);
                console.log("📂 저장된 진행 상태 로드:", progress);
                return progress;
            }
        } catch (error) {
            console.warn("⚠️ 진행 상태 로드 실패:", error);
        }
        return null;
    }

    // API 레시피 목록에서 표시할 레시피 선택
    selectRecipesToDisplay(apiRecipes, targetCount) {
        if (!apiRecipes || apiRecipes.length === 0) {
            return [];
        }

        // 이미 표시된 레시피 제외
        const availableRecipes = apiRecipes.filter(recipe => 
            !this.displayedRecipeIds.has(recipe.id)
        );

        // 필요한 만큼 선택 (랜덤하게)
        const recipesToAdd = [];
        const countToAdd = Math.min(targetCount, availableRecipes.length);
        
        for (let i = 0; i < countToAdd; i++) {
            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            const selectedRecipe = availableRecipes.splice(randomIndex, 1)[0];
            recipesToAdd.push(selectedRecipe);
            this.displayedRecipeIds.add(selectedRecipe.id);
        }

        console.log(`🎯 ${recipesToAdd.length}개 새 레시피 선택 (총 ${this.displayedRecipeIds.size}개 표시됨)`);
        return recipesToAdd;
    }

    // 스케줄 정보 표시
    displayScheduleInfo() {
        const todayCount = this.getTodayRecipeCount();
        const nextUpdate = this.getNextUpdateDate();
        const daysUntilNext = Math.ceil((nextUpdate - new Date()) / (1000 * 60 * 60 * 24));

        const scheduleInfo = `
            <div class="schedule-info bg-light p-3 rounded mb-4">
                <div class="row text-center">
                    <div class="col-md-4">
                        <h6 class="text-primary mb-1">📅 오늘의 레시피</h6>
                        <strong>${todayCount}개</strong>
                    </div>
                    <div class="col-md-4">
                        <h6 class="text-success mb-1">⏰ 다음 업데이트</h6>
                        <strong>${daysUntilNext}일 후</strong>
                        <small class="d-block text-muted">${nextUpdate.toLocaleDateString('ko-KR')} ${this.UPDATE_TIME}</small>
                    </div>
                    <div class="col-md-4">
                        <h6 class="text-info mb-1">🔄 업데이트 주기</h6>
                        <strong>3일마다 2개씩</strong>
                    </div>
                </div>
            </div>
        `;

        // 기존 스케줄 정보 제거
        $('.schedule-info').remove();
        
        // 새 스케줄 정보 추가
        if ($('#popularRecipes').length) {
            $('#popularRecipes').before(scheduleInfo);
        }
    }

    // 메인 스케줄링 로직
    async scheduleRecipeUpdates(apiRecipes, localRecipes = []) {
        try {
            console.log("📅 레시피 업데이트 스케줄링 시작...");
            
            // 진행 상태 로드
            const progress = this.loadProgress();
            
            // 오늘 표시해야 할 레시피 개수
            const todayCount = this.getTodayRecipeCount();
            console.log(`🎯 오늘 표시할 레시피: ${todayCount}개`);
            
            // 이미 표시된 레시피들
            let displayedRecipes = [...localRecipes];
            
            // API에서 새로 표시할 레시피 선택
            if (apiRecipes && apiRecipes.length > 0) {
                const neededCount = Math.max(0, todayCount - localRecipes.length);
                console.log(`🔍 API에서 추가로 필요한 레시피: ${neededCount}개`);
                
                if (neededCount > 0) {
                    const newRecipes = this.selectRecipesToDisplay(apiRecipes, neededCount);
                    displayedRecipes = [...displayedRecipes, ...newRecipes];
                }
            }
            
            // 진행 상태 저장
            this.saveProgress(this.displayedRecipeIds, displayedRecipes.length);
            
            // 스케줄 정보 표시
            this.displayScheduleInfo();
            
            console.log(`✅ 스케줄링 완료: 총 ${displayedRecipes.length}개 레시피 (로컬: ${localRecipes.length}, API: ${displayedRecipes.length - localRecipes.length})`);
            
            return displayedRecipes;
            
        } catch (error) {
            console.error("❌ 스케줄링 실패:", error);
            return localRecipes;
        }
    }

    // 스케줄 리셋 (테스트용)
    resetSchedule() {
        localStorage.removeItem(this.storageKey);
        this.displayedRecipeIds.clear();
        console.log("🔄 스케줄 리셋 완료");
    }

    // 수동으로 레시피 추가 (테스트용)
    forceAddRecipes(apiRecipes, count = 2) {
        const newRecipes = this.selectRecipesToDisplay(apiRecipes, count);
        this.saveProgress(this.displayedRecipeIds, this.displayedRecipeIds.size);
        console.log(`🔧 수동으로 ${newRecipes.length}개 레시피 추가`);
        return newRecipes;
    }
}

// 전역 스케줄러 인스턴스
const contentScheduler = new ContentScheduler();
