// 레시피 데이터 로드
let allRecipes = [];
let categories = {};
let apiManager = new RecipeAPIManager();

// 페이지 로드 시 데이터 가져오기
$(document).ready(function() {
    loadRecipes();
    loadCategories();
    loadAPIRecipes(); // API 레시피도 함께 로드
});

// 레시피 데이터 로드
function loadRecipes() {
    // 여러 경로 시도
    const paths = [
        'recipes.json',
        './recipes.json',
        '/recipes.json',
        'data/recipes.json',
        './data/recipes.json',
        '/data/recipes.json'
    ];
    
    function tryLoadRecipes(pathIndex) {
        if (pathIndex >= paths.length) {
            console.error('❌ 모든 경로에서 레시피 데이터 로드 실패');
            $('#popularRecipes, #recipeList').html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <p>레시피를 불러오는데 실패했습니다.</p>
                    <p class="text-muted small">data/recipes.json 파일을 확인해주세요.</p>
                </div>
            `);
            return;
        }
        
        const path = paths[pathIndex];
        console.log(`시도 중: ${path}`);
        
        $.getJSON(path, function(data) {
            allRecipes = data;
            console.log(`✅ ${allRecipes.length}개 레시피 로드 완료 (경로: ${path})`);
            
            // 메인 페이지면 인기 레시피 표시
            if ($('#popularRecipes').length) {
                displayPopularRecipes();
            }
            
            // 레시피 목록 페이지면 전체 레시피 표시
            if ($('#recipeList').length) {
                displayAllRecipes();
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(`❌ ${path} 로드 실패: ${textStatus}`);
            tryLoadRecipes(pathIndex + 1);
        });
    }
    
    tryLoadRecipes(0);
}

// API에서 레시피 로드
async function loadAPIRecipes() {
    try {
        console.log("🌐 API에서 추가 레시피 로드 중...");
        const apiRecipes = await apiManager.fetchRecipesFromAPI(20); // 20개 레시피 가져오기
        
        if (apiRecipes && apiRecipes.length > 0) {
            console.log(`✅ API에서 ${apiRecipes.length}개 레시피 로드 완료`);
            
            // 기존 레시피와 합치기
            allRecipes = [...allRecipes, ...apiRecipes];
            
            // 화면 업데이트
            displayRecipes(allRecipes);
            
            // 카테고리도 업데이트
            updateCategories();
        }
    } catch (error) {
        console.log("⚠️ API 레시피 로드 실패:", error);
        // API 실패해도 로컬 데이터는 계속 사용
    }
}

// 카테고리 데이터 로드
function loadCategories() {
    const paths = [
        'categories.json',
        './categories.json',
        '/categories.json',
        'data/categories.json',
        './data/categories.json',
        '/data/categories.json'
    ];
    
    function tryLoadCategories(pathIndex) {
        if (pathIndex >= paths.length) {
            console.error('❌ 카테고리 데이터 로드 실패');
            return;
        }
        
        const path = paths[pathIndex];
        
        $.getJSON(path, function(data) {
            categories = data;
            console.log(`✅ ${Object.keys(categories).length}개 카테고리 로드 완료`);
            displayCategories();
        }).fail(function() {
            tryLoadCategories(pathIndex + 1);
        });
    }
    
    tryLoadCategories(0);
}

// 인기 레시피 표시 (메인 페이지)
function displayPopularRecipes() {
    const popularCount = 8;
    const recipes = allRecipes.slice(0, popularCount);
    
    let html = '';
    recipes.forEach(recipe => {
        html += createRecipeCard(recipe);
    });
    
    $('#popularRecipes').html(html);
}

// 전체 레시피 표시 (레시피 목록 페이지)
function displayAllRecipes(filterCategory = null, searchQuery = null) {
    let filteredRecipes = allRecipes;
    
    // 카테고리 필터
    if (filterCategory && filterCategory !== 'all') {
        filteredRecipes = filteredRecipes.filter(r => r.category === filterCategory);
    }
    
    // 검색 필터
    if (searchQuery) {
        filteredRecipes = filteredRecipes.filter(r => 
            r.name.includes(searchQuery) || 
            r.ingredients.includes(searchQuery)
        );
    }
    
    // 페이지네이션
    const itemsPerPage = 12;
    const currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);
    
    let html = '';
    paginatedRecipes.forEach(recipe => {
        html += createRecipeCard(recipe);
    });
    
    if (html) {
        $('#recipeList').html(html);
    } else {
        $('#recipeList').html(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p>검색 결과가 없습니다.</p>
            </div>
        `);
    }
    
    // 페이지네이션 생성
    if ($('#pagination').length) {
        displayPagination(filteredRecipes.length, currentPage, itemsPerPage);
    }
}

// 레시피 카드 HTML 생성
function createRecipeCard(recipe) {
    const defaultImage = 'https://picsum.photos/400/200?random=1';
    const imageUrl = recipe.image_main || defaultImage;
    
    return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card recipe-card">
                <img src="${imageUrl}" 
                     class="card-img-top" 
                     alt="${recipe.name}"
                     onerror="this.src='${defaultImage}'">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="recipe-category">${recipe.category || '기타'}</span>
                        <span class="recipe-difficulty">${recipe.method || '조리'}</span>
                    </div>
                    <h5 class="card-title">${recipe.name}</h5>
                    <p class="card-text text-muted">${truncateText(recipe.ingredients, 50)}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        ${recipe.nutrition.calories ? `
                        <span class="recipe-time">
                            <i class="fas fa-fire"></i> ${recipe.nutrition.calories} kcal
                        </span>
                        ` : '<span></span>'}
                        <a href="recipe_detail.html?id=${recipe.id}" class="btn btn-primary btn-sm">
                            자세히 보기
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 카테고리 버튼 표시
function displayCategories() {
    if ($('#categoryButtons').length) {
        let html = '<a href="recipes.html" class="btn category-btn active">모두보기</a>';
        
        for (let category in categories) {
            html += `<a href="recipes.html?category=${encodeURIComponent(category)}" class="btn category-btn">
                ${category} (${categories[category]})
            </a>`;
        }
        
        $('#categoryButtons').html(html);
    }
}

// 페이지네이션 표시
function displayPagination(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        $('#pagination').html('');
        return;
    }
    
    let html = '<nav><ul class="pagination justify-content-center">';
    
    // 이전 버튼
    if (currentPage > 1) {
        html += `<li class="page-item">
            <a class="page-link" href="?page=${currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>`;
    }
    
    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
        } else if (i >= currentPage - 2 && i <= currentPage + 2) {
            html += `<li class="page-item"><a class="page-link" href="?page=${i}">${i}</a></li>`;
        }
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        html += `<li class="page-item">
            <a class="page-link" href="?page=${currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>`;
    }
    
    html += '</ul></nav>';
    $('#pagination').html(html);
}

// 검색 기능
function searchRecipes() {
    const query = $('#searchInput').val();
    if (query.trim()) {
        window.location.href = `recipes.html?search=${encodeURIComponent(query)}`;
    }
}

// 엔터키로 검색
$(document).on('keypress', '#searchInput', function(e) {
    if (e.key === 'Enter') {
        searchRecipes();
    }
});

// 텍스트 자르기
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// URL 파라미터 가져오기
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
