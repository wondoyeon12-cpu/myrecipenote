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

// API에서 레시피 로드 (현재 비활성화 - CORS 문제로 인해)
async function loadAPIRecipes() {
    console.log("🌐 API 연동은 현재 CORS 문제로 인해 비활성화됨");
    console.log("📋 로컬 데이터 98개 레시피만 사용 중");
    // API 호출 대신 로컬 데이터만 사용
}

// 카테고리 데이터 로드 (기본 카테고리 포함)
function loadCategories() {
    const paths = [
        'categories.json',
        './categories.json',
        '/categories.json',
        '/myrecipenote/categories.json',
        'data/categories.json',
        './data/categories.json',
        '/data/categories.json'
    ];
    
    function tryLoadCategories(pathIndex) {
        if (pathIndex >= paths.length) {
            console.log('⚠️ 카테고리 파일을 찾을 수 없음, 기본 카테고리 사용');
            // 기본 카테고리 설정
            categories = {
                "모두보기": { name: "모두보기", count: 0, color: "#ff6b35" },
                "밥": { name: "밥", count: 0, color: "#f7931e" },
                "국&찌개": { name: "국&찌개", count: 0, color: "#ffd23f" },
                "반찬": { name: "반찬", count: 0, color: "#27ae60" },
                "일품": { name: "일품", count: 0, color: "#3498db" },
                "후식": { name: "후식", count: 0, color: "#9b59b6" }
            };
            console.log(`✅ ${Object.keys(categories).length}개 기본 카테고리 로드 완료`);
            console.log('📋 카테고리:', Object.keys(categories));
            displayCategories();
            return;
        }
        
        const path = paths[pathIndex];
        console.log(`🔍 카테고리 시도 중: ${path}`);
        
        $.getJSON(path, function(data) {
            categories = data;
            console.log(`✅ ${Object.keys(categories).length}개 카테고리 로드 완료`);
            console.log('📋 카테고리:', Object.keys(data));
            displayCategories();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log(`❌ ${path} 로드 실패: ${textStatus}`);
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

// 로컬 저장소 기반 레시피 로드 (API 연결 없음)
async function loadRecipesWithAPI() {
    console.log("🚀 로컬 저장소 기반 레시피 로드 시작...");
    
    try {
        // 로컬 저장소 상태 확인
        const localStatus = recipeAPIManager.checkAPIStatus();
        console.log(`📂 로컬 저장소 상태: ${localStatus ? '데이터 있음' : '데이터 없음'}`);
        
        if (localStatus) {
            // 로컬 저장소 데이터와 통합
            const combinedRecipes = await recipeAPIManager.getCombinedRecipes(allRecipes, 1000);
            allRecipes = combinedRecipes;
            console.log(`✅ 로컬 저장소 연동 완료: 총 ${allRecipes.length}개 레시피`);
            
            // UI 업데이트
            if ($('#popularRecipes').length) {
                displayPopularRecipes();
            }
            
            if ($('#recipeList').length) {
                displayAllRecipes();
            }
        } else {
            console.log("📦 로컬 저장소에 데이터 없음, 기존 데이터만 사용");
        }
        
        // 상태 표시 업데이트
        updateAPIStatus(localStatus);
        
    } catch (error) {
        console.error("❌ 로컬 저장소 연동 실패:", error);
    }
}

// 로컬 저장소 상태 표시 업데이트
function updateAPIStatus(hasLocalData) {
    let statusElement = document.getElementById('apiStatus');
    if (!statusElement) {
        // 상태 표시 요소가 없으면 생성
        const statusHtml = `
            <div class="text-center mb-3">
                <span id="apiStatus" class="badge bg-${hasLocalData ? 'success' : 'warning'}">
                    <i class="fas fa-database"></i> 
                    ${hasLocalData ? '로컬 저장소에서 레시피 로드됨' : '로컬 저장소에 데이터 없음'}
                </span>
                ${!hasLocalData ? `
                    <button class="btn btn-outline-primary btn-sm ms-2" onclick="testSchedule.downloadAll()">
                        <i class="fas fa-download"></i> 전체 다운로드
                    </button>
                ` : `
                    <button class="btn btn-outline-secondary btn-sm ms-2" onclick="testSchedule.checkLocalStorage()">
                        <i class="fas fa-info-circle"></i> 저장소 상태
                    </button>
                `}
            </div>
        `;
        
        if ($('#popularRecipes').length) {
            $('#popularRecipes').before(statusHtml);
        }
    } else {
        statusElement.className = `badge bg-${hasLocalData ? 'success' : 'warning'}`;
        statusElement.innerHTML = `
            <i class="fas fa-database"></i> 
            ${hasLocalData ? '로컬 저장소에서 레시피 로드됨' : '로컬 저장소에 데이터 없음'}
        `;
    }
}

// 로컬 저장소 데이터 새로고침
async function refreshAPIRecipes() {
    console.log("🔄 로컬 저장소 데이터 새로고침 중...");
    
    // 캐시 클리어
    recipeAPIManager.cache.clear();
    
    // 새로 로드
    await loadRecipesWithAPI();
    
    console.log("✅ 로컬 저장소 데이터 새로고침 완료");
}

// 스케줄 테스트 함수들 (개발자 콘솔에서 사용)
window.testSchedule = {
    // 스케줄 리셋
    reset: function() {
        contentScheduler.resetSchedule();
        console.log("🔄 스케줄이 리셋되었습니다. 페이지를 새로고침하세요.");
    },
    
    // 수동으로 레시피 추가
    addRecipes: function(count = 2) {
        const apiRecipes = recipeAPIManager.getCachedData('api_recipes') || [];
        const newRecipes = contentScheduler.forceAddRecipes(apiRecipes, count);
        console.log(`🔧 ${newRecipes.length}개 레시피가 수동으로 추가되었습니다.`);
        return newRecipes;
    },
    
    // 현재 상태 확인
    status: function() {
        const todayCount = contentScheduler.getTodayRecipeCount();
        const nextUpdate = contentScheduler.getNextUpdateDate();
        const progress = contentScheduler.loadProgress();
        
        console.log("📊 스케줄 상태:", {
            todayRecipeCount: todayCount,
            nextUpdateDate: nextUpdate.toLocaleString('ko-KR'),
            displayedCount: progress ? progress.totalDisplayedCount : 0,
            displayedIds: Array.from(contentScheduler.displayedRecipeIds)
        });
    },
    
    // 전체 API 레시피 다운로드
    downloadAll: async function() {
        console.log("📥 전체 API 레시피 다운로드 시작...");
        try {
            const recipes = await recipeAPIManager.downloadAllAPIRecipes();
            console.log(`✅ 다운로드 완료: ${recipes.length}개 레시피`);
            
            // 페이지 새로고침하여 새 데이터 반영
            console.log("🔄 페이지를 새로고침하여 새 데이터를 반영합니다...");
            setTimeout(() => window.location.reload(), 2000);
            
            return recipes;
        } catch (error) {
            console.error("❌ 다운로드 실패:", error);
        }
    },
    
    // 로컬 저장소 상태 확인
    checkLocalStorage: function() {
        const localRecipes = recipeAPIManager.loadAPIRecipesFromLocal();
        const lastUpdate = localStorage.getItem('api_recipes_last_update');
        const totalCount = localStorage.getItem('api_recipes_total_count');
        
        console.log("💾 로컬 저장소 상태:", {
            storedRecipes: localRecipes.length,
            totalCount: totalCount,
            lastUpdate: lastUpdate ? new Date(parseInt(lastUpdate)).toLocaleString('ko-KR') : '없음'
        });
        
        return {
            count: localRecipes.length,
            lastUpdate: lastUpdate,
            recipes: localRecipes
        };
    },
    
    // 로컬 저장소 초기화
    clearLocalStorage: function() {
        localStorage.removeItem('api_recipes_local');
        localStorage.removeItem('api_recipes_last_update');
        localStorage.removeItem('api_recipes_total_count');
        console.log("🗑️ 로컬 저장소가 초기화되었습니다.");
    }
};

// 페이지 로드 시 API 연동 초기화
$(document).ready(function() {
    console.log("🔌 조리식품 레시피 DB API 연동 초기화...");
    
    // 기존 레시피 로드 후 API 연동 시도
    setTimeout(async () => {
        if (allRecipes && allRecipes.length > 0) {
            await loadRecipesWithAPI();
        } else {
            console.log("⚠️ 로컬 레시피가 먼저 로드되지 않음, API 연동 건너뜀");
        }
    }, 1000); // 1초 후 실행
});
