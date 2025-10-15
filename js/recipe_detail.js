// 레시피 상세 페이지 스크립트

let currentRecipe = null;

$(document).ready(function() {
    console.log("🔍 레시피 상세 페이지 로드 시작...");
    
    const recipeId = getUrlParameter('id');
    console.log("📋 레시피 ID:", recipeId);
    
    if (!recipeId) {
        console.log("❌ 레시피 ID가 없습니다.");
        showError('레시피 ID가 없습니다.');
        return;
    }
    
    console.log("🚀 레시피 상세 정보 로드 시작...");
    loadRecipeDetail(recipeId);
});

// 레시피 상세 정보 로드
function loadRecipeDetail(recipeId) {
    const paths = ['recipes.json', './recipes.json', '/recipes.json', 'data/recipes.json', './data/recipes.json', '/data/recipes.json'];
    
    function tryLoad(pathIndex) {
        if (pathIndex >= paths.length) {
            showError('레시피 데이터를 불러오는데 실패했습니다.');
            return;
        }
        
        $.getJSON(paths[pathIndex], function(data) {
            const recipe = data.find(r => r.id == recipeId);
            
            if (!recipe) {
                showError('레시피를 찾을 수 없습니다.');
                return;
            }
            
            currentRecipe = recipe;
            displayRecipeDetail(recipe);
        }).fail(function() {
            console.error(`경로 ${paths[pathIndex]} 실패`);
            tryLoad(pathIndex + 1);
        });
    }
    
    tryLoad(0);
}

// 레시피 상세 정보 표시
function displayRecipeDetail(recipe) {
    // 페이지 제목 설정
    $('#pageTitle').text(`${recipe.name} - MyRecipeNote`);
    document.title = `${recipe.name} - MyRecipeNote`;
    
    let html = `
        <!-- 레시피 헤더 -->
        <div class="mb-4">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.html">홈</a></li>
                    <li class="breadcrumb-item"><a href="recipes.html">레시피</a></li>
                    <li class="breadcrumb-item active">${recipe.name}</li>
                </ol>
            </nav>
            
            <h1 class="mb-3 fw-bold">${recipe.name}</h1>
            
            <div class="d-flex gap-2 mb-3">
                <span class="badge bg-primary">${recipe.category || '기타'}</span>
                <span class="badge bg-secondary">${recipe.method || '조리'}</span>
            </div>
        </div>
        
        <!-- 메인 이미지 -->
        ${recipe.image_large || recipe.image_main ? `
        <div class="text-center mb-4">
            <img src="${recipe.image_large || recipe.image_main}" 
                 class="img-fluid rounded" 
                 alt="${recipe.name}"
                 style="max-height: 400px; width: 100%; object-fit: cover;">
        </div>
        ` : ''}
        
        <!-- 광고 영역 1 -->
        <div class="ad-banner-horizontal">
            <i class="fas fa-ad fa-3x mb-3"></i>
            <p>광고 영역 (728x90)</p>
        </div>
        
        <!-- 레시피 정보 카드 -->
        <div class="row mb-4">
            ${recipe.nutrition.calories ? `
            <div class="col-md-3 mb-3">
                <div class="card text-center border-0 shadow-sm">
                    <div class="card-body">
                        <h6 class="text-muted mb-1">열량</h6>
                        <p class="fw-bold mb-0">${recipe.nutrition.calories} kcal</p>
                    </div>
                </div>
            </div>
            ` : ''}
            ${recipe.nutrition.carbs ? `
            <div class="col-md-3 mb-3">
                <div class="card text-center border-0 shadow-sm">
                    <div class="card-body">
                        <h6 class="text-muted mb-1">탄수화물</h6>
                        <p class="fw-bold mb-0">${recipe.nutrition.carbs} g</p>
                    </div>
                </div>
            </div>
            ` : ''}
            ${recipe.nutrition.protein ? `
            <div class="col-md-3 mb-3">
                <div class="card text-center border-0 shadow-sm">
                    <div class="card-body">
                        <h6 class="text-muted mb-1">단백질</h6>
                        <p class="fw-bold mb-0">${recipe.nutrition.protein} g</p>
                    </div>
                </div>
            </div>
            ` : ''}
            ${recipe.nutrition.fat ? `
            <div class="col-md-3 mb-3">
                <div class="card text-center border-0 shadow-sm">
                    <div class="card-body">
                        <h6 class="text-muted mb-1">지방</h6>
                        <p class="fw-bold mb-0">${recipe.nutrition.fat} g</p>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="row">
            <!-- 재료 -->
            <div class="col-md-5 mb-4">
                <div class="ingredients-section">
                    <h3><i class="fas fa-carrot"></i> 재료</h3>
                    <div class="ingredients-list">
                        ${formatIngredients(recipe.ingredients)}
                    </div>
                </div>
            </div>
            
            <!-- 조리 순서 -->
            <div class="col-md-7 mb-4">
                <div class="cooking-steps-section">
                    <h3><i class="fas fa-list-ol"></i> 조리순서</h3>
                    ${displayCookingSteps(recipe.steps)}
                </div>
            </div>
        </div>
        
        <!-- 영양 정보 -->
        ${displayNutritionInfo(recipe.nutrition)}
        
        <!-- 광고 영역 2 -->
        <div class="ad-banner-horizontal">
            <i class="fas fa-ad fa-3x mb-3"></i>
            <p>광고 영역 (728x90)</p>
        </div>
        
        <!-- 관련 상품 -->
        <div class="related-section">
            <h4>${recipe.name} 관련 상품</h4>
            <p class="text-muted">이 레시피와 관련된 상품을 확인해보세요</p>
            <!-- 상품 목록은 추후 추가 -->
        </div>
        
        <!-- 목록으로 버튼 -->
        <div class="text-center my-5">
            <a href="recipes.html" class="btn btn-outline-primary btn-lg">
                <i class="fas fa-list"></i> 목록으로 돌아가기
            </a>
        </div>
    `;
    
    $('#recipeContent').html(html).show();
    $('#loadingSpinner').hide();
}

// 재료 포맷팅
function formatIngredients(ingredientsText) {
    if (!ingredientsText) return '<p>재료 정보가 없습니다.</p>';
    
    // 배열인 경우 그대로 사용, 문자열인 경우 split
    let items;
    if (Array.isArray(ingredientsText)) {
        items = ingredientsText.filter(item => item);
    } else if (typeof ingredientsText === 'string') {
        items = ingredientsText.split(',').map(item => item.trim()).filter(item => item);
    } else {
        return '<p>재료 정보가 없습니다.</p>';
    }
    
    let html = '<ul class="list-unstyled">';
    items.forEach(item => {
        html += `<li class="ingredient-item">
            <i class="fas fa-check text-primary me-2"></i> ${item}
        </li>`;
    });
    html += '</ul>';
    
    return html;
}

// 조리 순서 표시
function displayCookingSteps(steps) {
    if (!steps || steps.length === 0) {
        return '<p class="text-muted">조리 순서 정보가 없습니다.</p>';
    }
    
    let html = '';
    steps.forEach((step, index) => {
        html += `
            <div class="cooking-step">
                ${step.image ? `
                <img src="${step.image}" 
                     alt="조리 ${step.step}단계" 
                     class="step-image"
                     onerror="this.style.display='none'">
                ` : ''}
                <div class="step-content">
                    <div class="mb-2">
                        <span class="step-number">${step.step}</span>
                        <strong>STEP ${step.step}</strong>
                    </div>
                    <p class="step-text">${step.text}</p>
                </div>
            </div>
        `;
    });
    
    return html;
}

// 영양 정보 표시
function displayNutritionInfo(nutrition) {
    if (!nutrition.calories && !nutrition.carbs && !nutrition.protein) {
        return '';
    }
    
    let html = `
        <div class="nutrition-info">
            <h4><i class="fas fa-heartbeat"></i> 영양 정보 (1인분 기준)</h4>
            <div class="row">
    `;
    
    if (nutrition.calories) {
        html += `
            <div class="col-md-6 nutrition-item">
                <span>열량</span>
                <span class="fw-bold">${nutrition.calories} kcal</span>
            </div>
        `;
    }
    
    if (nutrition.carbs) {
        html += `
            <div class="col-md-6 nutrition-item">
                <span>탄수화물</span>
                <span class="fw-bold">${nutrition.carbs} g</span>
            </div>
        `;
    }
    
    if (nutrition.protein) {
        html += `
            <div class="col-md-6 nutrition-item">
                <span>단백질</span>
                <span class="fw-bold">${nutrition.protein} g</span>
            </div>
        `;
    }
    
    if (nutrition.fat) {
        html += `
            <div class="col-md-6 nutrition-item">
                <span>지방</span>
                <span class="fw-bold">${nutrition.fat} g</span>
            </div>
        `;
    }
    
    if (nutrition.sodium) {
        html += `
            <div class="col-md-6 nutrition-item">
                <span>나트륨</span>
                <span class="fw-bold">${nutrition.sodium} mg</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// 에러 표시
function showError(message) {
    $('#loadingSpinner').hide();
    $('#recipeContent').html(`
        <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
            <h3>${message}</h3>
            <a href="recipes.html" class="btn btn-primary mt-3">
                <i class="fas fa-arrow-left"></i> 목록으로 돌아가기
            </a>
        </div>
    `).show();
}

// URL 파라미터 가져오기
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
