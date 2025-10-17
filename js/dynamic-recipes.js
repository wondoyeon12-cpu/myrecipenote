// 동적 레시피 추가 및 관리 시스템
class DynamicRecipeManager {
    constructor() {
        this.localStorageKey = 'myrecipenote_dynamic_recipes';
        this.dynamicRecipes = this.loadDynamicRecipes();
    }

    // 동적 레시피 로드
    loadDynamicRecipes() {
        try {
            const stored = localStorage.getItem(this.localStorageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('동적 레시피 로드 실패:', error);
            return [];
        }
    }

    // 동적 레시피 저장
    saveDynamicRecipes() {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.dynamicRecipes));
            console.log(`✅ 동적 레시피 ${this.dynamicRecipes.length}개 저장 완료`);
        } catch (error) {
            console.error('동적 레시피 저장 실패:', error);
        }
    }

    // 새 레시피 추가
    addRecipe(recipeData) {
        const newRecipe = {
            id: `dynamic_${Date.now()}`,
            name: recipeData.name || "새 레시피",
            category: recipeData.category || "기타",
            cooking_time: recipeData.cooking_time || "30분",
            difficulty: recipeData.difficulty || "초급",
            servings: recipeData.servings || "2인분",
            ingredients: Array.isArray(recipeData.ingredients) 
                ? recipeData.ingredients 
                : (recipeData.ingredients || "").split(',').map(i => i.trim()),
            cooking_steps: Array.isArray(recipeData.cooking_steps) 
                ? recipeData.cooking_steps 
                : [{ step: 1, text: recipeData.cooking_steps || "" }],
            tips: recipeData.tips || "",
            image_main: recipeData.image_main || "https://picsum.photos/400/200?random=1",
            source: "사용자 추가",
            nutrition: {
                calories: recipeData.calories || "정보 없음",
                protein: recipeData.protein || "정보 없음",
                fat: recipeData.fat || "정보 없음"
            },
            created_at: new Date().toISOString()
        };

        this.dynamicRecipes.push(newRecipe);
        this.saveDynamicRecipes();
        
        console.log(`✅ 새 레시피 추가: ${newRecipe.name}`);
        return newRecipe;
    }

    // 레시피 삭제
    removeRecipe(recipeId) {
        const index = this.dynamicRecipes.findIndex(r => r.id === recipeId);
        if (index !== -1) {
            const removed = this.dynamicRecipes.splice(index, 1)[0];
            this.saveDynamicRecipes();
            console.log(`🗑️ 레시피 삭제: ${removed.name}`);
            return true;
        }
        return false;
    }

    // 모든 동적 레시피 가져오기
    getAllDynamicRecipes() {
        return [...this.dynamicRecipes];
    }

    // 샘플 레시피 생성
    generateSampleRecipes() {
        const sampleRecipes = [
            {
                name: "간단한 김치찌개",
                category: "한식",
                cooking_time: "20분",
                difficulty: "초급",
                servings: "2인분",
                ingredients: ["김치 1컵", "돼지고기 100g", "두부 1/2모", "대파 1대", "물 2컵"],
                cooking_steps: [
                    { step: 1, text: "김치를 적당한 크기로 썬다" },
                    { step: 2, text: "돼지고기를 볶는다" },
                    { step: 3, text: "김치와 물을 넣고 끓인다" },
                    { step: 4, text: "두부와 대파를 넣고 마무리한다" }
                ],
                tips: "김치가 신맛이 강하면 설탕을 조금 넣어보세요",
                calories: "250kcal"
            },
            {
                name: "크림 파스타",
                category: "양식",
                cooking_time: "15분",
                difficulty: "중급",
                servings: "1인분",
                ingredients: ["파스타 100g", "베이컨 50g", "생크림 100ml", "파마산 치즈 2큰술", "마늘 2쪽"],
                cooking_steps: [
                    { step: 1, text: "파스타를 끓는 물에 삶는다" },
                    { step: 2, text: "베이컨과 마늘을 볶는다" },
                    { step: 3, text: "생크림을 넣고 끓인다" },
                    { step: 4, text: "파스타와 치즈를 넣고 섞는다" }
                ],
                tips: "생크림 대신 우유를 사용해도 됩니다",
                calories: "450kcal"
            },
            {
                name: "달걀볶음밥",
                category: "한식",
                cooking_time: "10분",
                difficulty: "초급",
                servings: "1인분",
                ingredients: ["밥 1공기", "달걀 2개", "양파 1/4개", "당근 1/4개", "대파 1대"],
                cooking_steps: [
                    { step: 1, text: "달걀을 풀어서 스크램블한다" },
                    { step: 2, text: "야채를 잘게 썬다" },
                    { step: 3, text: "야채를 볶는다" },
                    { step: 4, text: "밥과 달걀을 넣고 볶는다" }
                ],
                tips: "밥이 서로 붙지 않도록 강불에서 볶으세요",
                calories: "320kcal"
            }
        ];

        // 기존 샘플 레시피가 없으면 추가
        const existingSampleIds = this.dynamicRecipes.filter(r => r.name.includes("샘플")).map(r => r.id);
        if (existingSampleIds.length === 0) {
            sampleRecipes.forEach(recipe => {
                this.addRecipe({...recipe, name: `샘플 - ${recipe.name}`});
            });
            console.log(`✅ 샘플 레시피 ${sampleRecipes.length}개 추가 완료`);
        }
    }
}

// 전역 동적 레시피 매니저
const dynamicRecipeManager = new DynamicRecipeManager();

// 기존 loadRecipes 함수 확장
async function loadRecipesWithDynamic() {
    console.log("🚀 동적 레시피 시스템 로드 시작...");
    
    // 로컬 JSON 데이터 직접 로드
    let localRecipes = [];
    try {
        const response = await fetch('recipes.json');
        if (response.ok) {
            localRecipes = await response.json();
            console.log(`✅ 로컬 레시피 ${localRecipes.length}개 로드 완료`);
        }
    } catch (error) {
        console.log("⚠️ 로컬 레시피 로드 실패:", error);
    }
    
    // 동적 레시피 로드
    const dynamicRecipes = dynamicRecipeManager.getAllDynamicRecipes();
    
    // 통합
    allRecipes = [...localRecipes, ...dynamicRecipes];
    
    console.log(`✅ 총 ${allRecipes.length}개 레시피 (로컬: ${localRecipes.length}, 동적: ${dynamicRecipes.length})`);
    
    // UI 업데이트
    if ($('#popularRecipes').length) {
        if (typeof displayPopularRecipes === 'function') {
            displayPopularRecipes();
        } else {
            console.warn('⚠️ displayPopularRecipes 함수가 정의되지 않음');
            // 직접 인기 레시피 표시
            displayPopularRecipesDirectly();
        }
    }
    
    if ($('#recipeList').length) {
        if (typeof displayAllRecipes === 'function') {
            displayAllRecipes();
        } else {
            console.warn('⚠️ displayAllRecipes 함수가 정의되지 않음');
        }
    }
    
    // 카테고리 버튼 업데이트 (실제 데이터 기반)
    if (typeof displayCategories === 'function') {
        displayCategories();
    } else {
        console.warn('⚠️ displayCategories 함수가 정의되지 않음');
    }
    
    // 더보기 버튼 추가
    addLoadMoreButton();
}

// 직접 인기 레시피 표시 함수 (main.js 함수가 없을 때 사용)
function displayPopularRecipesDirectly() {
    const popularCount = 8;
    const recipes = allRecipes.slice(0, popularCount);
    
    let html = '';
    recipes.forEach(recipe => {
        html += createRecipeCardDirectly(recipe);
    });
    
    $('#popularRecipes').html(html);
    console.log(`✅ ${recipes.length}개 인기 레시피 직접 표시 완료`);
}

// 직접 레시피 카드 생성 함수
function createRecipeCardDirectly(recipe) {
    return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card h-100 recipe-card" data-category="${recipe.category}">
                <img src="${recipe.image_main}" class="card-img-top" alt="${recipe.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${recipe.name}</h5>
                    <p class="card-text text-muted">
                        <i class="fas fa-clock me-1"></i>${recipe.cooking_time}
                        <span class="ms-2"><i class="fas fa-users me-1"></i>${recipe.servings}</span>
                    </p>
                    <p class="card-text">
                        <span class="badge bg-primary">${recipe.category}</span>
                        <span class="badge bg-secondary ms-1">${recipe.difficulty}</span>
                    </p>
                    <div class="mt-auto">
                        <a href="recipe_detail.html?id=${recipe.id}" class="btn btn-primary btn-sm w-100">
                            <i class="fas fa-eye me-1"></i>자세히 보기
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 더보기 버튼 추가
function addLoadMoreButton() {
    // 기존 더보기 버튼이 없으면 추가
    if (!$('#loadMoreButton').length) {
        const loadMoreHtml = `
            <div class="text-center mt-4" id="loadMoreButton">
                <button class="btn btn-primary btn-lg" onclick="loadMoreRecipes()">
                    <i class="fas fa-plus"></i> 더보기
                </button>
            </div>
        `;
        $('#popularRecipes').after(loadMoreHtml);
    }
}

// 더보기 버튼 클릭 시 레시피 추가 로드
function loadMoreRecipes() {
    // 현재 표시된 레시피 개수 확인
    const currentCount = $('#popularRecipes .col-lg-3').length;
    const totalCount = allRecipes.length;
    
    if (currentCount >= totalCount) {
        // 더 이상 표시할 레시피가 없으면 버튼 숨기기
        $('#loadMoreButton').hide();
        return;
    }
    
    // 다음 8개 레시피 가져오기
    const nextRecipes = allRecipes.slice(currentCount, currentCount + 8);
    
    // 기존 레시피에 추가
    let html = '';
    nextRecipes.forEach(recipe => {
        html += createRecipeCardDirectly(recipe);
    });
    
    $('#popularRecipes').append(html);
    
    // 전체 레시피를 다 표시했으면 버튼 숨기기
    const newCount = $('#popularRecipes .col-lg-3').length;
    if (newCount >= totalCount) {
        $('#loadMoreButton').hide();
    }
    
    console.log(`✅ 더보기: ${nextRecipes.length}개 레시피 추가 (총 ${newCount}/${totalCount}개)`);
}

// 새 레시피 추가 모달 표시
function showAddRecipeModal() {
    const modalHtml = `
        <div class="modal fade" id="addRecipeModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">새 레시피 추가</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addRecipeForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">레시피 이름</label>
                                        <input type="text" class="form-control" name="name" required>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label">카테고리</label>
                                        <select class="form-select" name="category">
                                            <option value="한식">한식</option>
                                            <option value="양식">양식</option>
                                            <option value="일식">일식</option>
                                            <option value="중식">중식</option>
                                            <option value="기타">기타</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="mb-3">
                                        <label class="form-label">조리시간</label>
                                        <input type="text" class="form-control" name="cooking_time" placeholder="30분">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">재료 (쉼표로 구분)</label>
                                <textarea class="form-control" name="ingredients" rows="3" 
                                    placeholder="재료1, 재료2, 재료3..."></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">조리 과정</label>
                                <textarea class="form-control" name="cooking_steps" rows="5" 
                                    placeholder="1. 첫 번째 단계&#10;2. 두 번째 단계..."></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">조리 팁</label>
                                <textarea class="form-control" name="tips" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                        <button type="button" class="btn btn-primary" onclick="addNewRecipe()">추가</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 기존 모달 제거 후 새로 추가
    $('#addRecipeModal').remove();
    $('body').append(modalHtml);
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('addRecipeModal'));
    modal.show();
}

// 새 레시피 추가 처리
function addNewRecipe() {
    const form = document.getElementById('addRecipeForm');
    const formData = new FormData(form);
    
    const recipeData = {
        name: formData.get('name'),
        category: formData.get('category'),
        cooking_time: formData.get('cooking_time'),
        difficulty: '초급',
        servings: '2인분',
        ingredients: formData.get('ingredients'),
        cooking_steps: formData.get('cooking_steps'),
        tips: formData.get('tips')
    };
    
    // 레시피 추가
    const newRecipe = dynamicRecipeManager.addRecipe(recipeData);
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('addRecipeModal'));
    modal.hide();
    
    // 페이지 새로고침
    loadRecipesWithDynamic();
    
    // 성공 메시지
    showToast(`${newRecipe.name} 레시피가 추가되었습니다!`, 'success');
}

// 샘플 레시피 생성
function generateSampleRecipes() {
    dynamicRecipeManager.generateSampleRecipes();
    loadRecipesWithDynamic();
    showToast('샘플 레시피가 생성되었습니다!', 'info');
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type}" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // 토스트 컨테이너가 없으면 생성
    if (!$('#toastContainer').length) {
        $('body').append('<div id="toastContainer" class="toast-container position-fixed top-0 end-0 p-3"></div>');
    }
    
    $('#toastContainer').append(toastHtml);
    
    // 토스트 표시
    const toastElement = $('#toastContainer .toast').last()[0];
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // 자동 제거
    setTimeout(() => {
        $(toastElement).remove();
    }, 3000);
}

// 페이지 로드 시 동적 레시피 시스템 초기화
$(document).ready(function() {
    console.log("🔌 동적 레시피 시스템 초기화...");
    
    // 기존 loadRecipes 함수 대신 새로운 함수 사용
    if (typeof loadRecipes === 'function') {
        // 기존 함수 백업
        window.loadRecipesOriginal = loadRecipes;
    }
    
    // 새로운 함수로 교체
    window.loadRecipes = loadRecipesWithDynamic;
    
    // 초기 로드
    loadRecipesWithDynamic();
});

