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
async function loadRecipeDetail(recipeId) {
    console.log(`🔍 레시피 ID ${recipeId} 검색 시작...`);
    
    // 1. 먼저 API 레시피에서 검색 (API ID인 경우)
    if (recipeId.startsWith('api_')) {
        console.log("🌐 API 레시피 검색 중...");
        try {
            if (typeof recipeAPIManager !== 'undefined') {
                const combinedRecipes = await recipeAPIManager.getCombinedRecipes([], 1000);
                const apiRecipe = combinedRecipes.find(r => r.id === recipeId);
                
                if (apiRecipe) {
                    console.log("✅ API 레시피 발견:", apiRecipe.name);
                    currentRecipe = apiRecipe;
                    displayRecipeDetail(apiRecipe);
                    return;
                }
            }
        } catch (error) {
            console.error("❌ API 레시피 검색 실패:", error);
        }
    }
    
    // 2. 로컬 JSON 파일에서 검색
    console.log("📁 로컬 JSON 파일에서 검색 중...");
    const paths = ['recipes.json', './recipes.json', '/recipes.json', 'data/recipes.json', './data/recipes.json', '/data/recipes.json'];
    
    function tryLoad(pathIndex) {
        if (pathIndex >= paths.length) {
            showError('레시피를 찾을 수 없습니다.');
            return;
        }
        
        $.getJSON(paths[pathIndex], function(data) {
            const recipe = data.find(r => r.id == recipeId);
            
            if (!recipe) {
                showError('레시피를 찾을 수 없습니다.');
                return;
            }
            
            console.log("✅ 로컬 레시피 발견:", recipe.name);
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
        <!-- 레시피 헤더 박스 -->
        <div class="card mb-4 shadow-sm">
            <div class="card-body">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html">홈</a></li>
                        <li class="breadcrumb-item active">${recipe.name}</li>
                    </ol>
                </nav>
                
                <h1 class="mb-3 fw-bold">${recipe.name}</h1>
                
                <div class="d-flex gap-2 mb-3">
                    <span class="badge bg-primary">${recipe.category || '기타'}</span>
                    <span class="badge bg-secondary">${recipe.method || '조리'}</span>
                </div>
                
                ${recipe.image_large || recipe.image_main ? `
                <div class="text-center">
                    <img src="${recipe.image_large || recipe.image_main}" 
                         class="img-fluid rounded" 
                         alt="${recipe.name}"
                         style="max-height: 400px; object-fit: contain;">
                </div>
                ` : ''}
            </div>
        </div>
        
        <!-- 광고 영역 박스 -->
        <div class="card mb-4 border-warning">
            <div class="card-body text-center bg-warning bg-opacity-10">
                <i class="fas fa-ad fa-3x mb-3 text-warning"></i>
                <p class="mb-0 fw-bold">광고 영역 (728x90)</p>
            </div>
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
            <!-- 재료 박스 -->
            <div class="col-md-5 mb-4">
                <div class="card shadow-sm h-100">
                    <div class="card-header bg-success text-white">
                        <h4 class="mb-0"><i class="fas fa-carrot me-2"></i>재료</h4>
                    </div>
                    <div class="card-body">
                        <div class="ingredients-list">
                            ${formatIngredients(recipe.ingredients)}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 조리 순서 박스 -->
            <div class="col-md-7 mb-4">
                <div class="card shadow-sm h-100">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0"><i class="fas fa-list-ol me-2"></i>조리순서</h4>
                    </div>
                    <div class="card-body">
                        ${displayCookingSteps(recipe.cooking_steps || recipe.steps)}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 영양 정보 -->
        ${displayNutritionInfo(recipe.nutrition)}
        
        <!-- 꿀팁 영역 박스 -->
        <div class="card mb-4 shadow-sm">
            <div class="card-header bg-warning text-dark">
                <h4 class="mb-0"><i class="fas fa-lightbulb me-2"></i>꿀팁 & 관련 상품</h4>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="text-warning"><i class="fas fa-star me-2"></i>요리 꿀팁</h5>
                        <p class="text-muted">${recipe.tips || '이 레시피를 더 맛있게 만드는 특별한 팁을 확인해보세요!'}</p>
                    </div>
                    <div class="col-md-6">
                        <h5 class="text-success"><i class="fas fa-shopping-cart me-2"></i>관련 상품</h5>
                        <p class="text-muted">이 레시피에 필요한 재료와 도구를 구매해보세요!</p>
                        <button class="btn btn-success btn-sm">
                            <i class="fas fa-shopping-bag me-1"></i>상품 보러가기
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 광고 영역 2 박스 -->
        <div class="card mb-4 border-info">
            <div class="card-body text-center bg-info bg-opacity-10">
                <i class="fas fa-ad fa-3x mb-3 text-info"></i>
                <p class="mb-0 fw-bold">광고 영역 (728x90)</p>
            </div>
        </div>
        
        <!-- 관련 레시피 영역 -->
        <div class="card mb-4 shadow-sm">
            <div class="card-header bg-secondary text-white">
                <h4 class="mb-0"><i class="fas fa-utensils me-2"></i>이 레시피는 어떠세요?</h4>
                <small>같은 카테고리의 다른 레시피들을 확인해보세요</small>
            </div>
            <div class="card-body">
                <div class="row" id="relatedRecipes">
                    <div class="col-12 text-center">
                        <div class="spinner-border text-secondary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 text-muted">관련 레시피를 불러오는 중...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 목록으로 돌아가기 버튼 -->
        <div class="text-center my-5">
            <a href="index.html" class="btn btn-outline-primary btn-lg">
                <i class="fas fa-home me-2"></i>메인으로 돌아가기
            </a>
        </div>
    `;
    
    $('#recipeContent').html(html).show();
    $('#loadingSpinner').hide();
    
    // 관련 레시피 로드
    loadRelatedRecipes(recipe);
}

// 관련 레시피 로드
async function loadRelatedRecipes(currentRecipe) {
    try {
        console.log(`🔍 관련 레시피 로드 시작: ${currentRecipe.category} 카테고리`);
        
        let allRecipes = [];
        
        // API 레시피와 로컬 레시피 모두 가져오기
        if (typeof recipeAPIManager !== 'undefined') {
            allRecipes = await recipeAPIManager.getCombinedRecipes([], 1000);
        }
        
        // 같은 카테고리의 다른 레시피 필터링 (현재 레시피 제외)
        const relatedRecipes = allRecipes.filter(recipe => 
            recipe.category === currentRecipe.category && 
            recipe.id !== currentRecipe.id
        );
        
        // 최대 4개만 표시
        const displayRecipes = relatedRecipes.slice(0, 4);
        
        let html = '';
        if (displayRecipes.length > 0) {
            displayRecipes.forEach(recipe => {
                html += `
                    <div class="col-md-3 mb-3">
                        <div class="card h-100 recipe-card" style="cursor: pointer;" onclick="window.location.href='recipe_detail.html?id=${recipe.id}'">
                            <div style="height: 180px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa;">
                                <img src="${recipe.image_main}" class="card-img-top" alt="${recipe.name}" style="max-height: 180px; object-fit: contain; width: auto;">
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h6 class="card-title">${recipe.name}</h6>
                                <p class="card-text text-muted small">
                                    <i class="fas fa-clock me-1"></i>${recipe.cooking_time}
                                </p>
                                <div class="mt-auto">
                                    <span class="badge bg-primary">${recipe.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            html = `
                <div class="col-12 text-center">
                    <p class="text-muted">같은 카테고리의 다른 레시피가 없습니다.</p>
                </div>
            `;
        }
        
        $('#relatedRecipes').html(html);
        console.log(`✅ 관련 레시피 ${displayRecipes.length}개 로드 완료`);
        
    } catch (error) {
        console.error('❌ 관련 레시피 로드 실패:', error);
        $('#relatedRecipes').html(`
            <div class="col-12 text-center">
                <p class="text-muted">관련 레시피를 불러오는데 실패했습니다.</p>
            </div>
        `);
    }
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
            <div class="card mb-3 border-primary">
                <div class="card-header bg-light">
                    <h5 class="mb-0 text-primary">
                        <i class="fas fa-step-forward me-2"></i>
                        STEP ${step.step}
                    </h5>
                </div>
                <div class="card-body">
                    ${step.image ? `
                    <div class="text-center mb-3">
                        <img src="${step.image}" 
                             alt="조리 ${step.step}단계" 
                             class="img-fluid rounded"
                             style="max-height: 300px; object-fit: contain;"
                             onerror="this.style.display='none'">
                    </div>
                    ` : ''}
                    <p class="mb-0">${step.text}</p>
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
            <a href="index.html" class="btn btn-primary mt-3">
                <i class="fas fa-home"></i> 메인으로 돌아가기
            </a>
        </div>
    `).show();
}

// URL 파라미터 가져오기
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
