// 레시피 목록 페이지 전용 스크립트

$(document).ready(function() {
    // URL 파라미터 확인
    const category = getUrlParameter('category');
    const search = getUrlParameter('search');
    const page = parseInt(getUrlParameter('page')) || 1;
    
    // 검색어가 있으면 검색창에 표시
    if (search) {
        $('#searchInput').val(decodeURIComponent(search));
    }
    
    // 레시피 로드 후 필터링
    const paths = ['data/recipes.json', './data/recipes.json', '/data/recipes.json'];
    
    function tryLoad(pathIndex) {
        if (pathIndex >= paths.length) {
            $('#recipeList').html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <p>레시피 데이터를 불러오는데 실패했습니다.</p>
                </div>
            `);
            return;
        }
        
        $.getJSON(paths[pathIndex], function(data) {
        allRecipes = data;
        
        let filtered = allRecipes;
        
        // 카테고리 필터
        if (category && category !== 'all') {
            filtered = filtered.filter(r => r.category === category);
        }
        
        // 검색 필터
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(r => 
                r.name.toLowerCase().includes(searchLower) || 
                r.ingredients.toLowerCase().includes(searchLower) ||
                (r.hashtags && r.hashtags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }
        
        // 결과 수 표시
        $('#recipeCount').text(`총 ${filtered.length}개의 레시피`);
        
        // 페이지네이션 적용
        const itemsPerPage = 12;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginated = filtered.slice(start, end);
        
        // 레시피 표시
        let html = '';
        paginated.forEach(recipe => {
            html += createRecipeCard(recipe);
        });
        
        if (html) {
            $('#recipeList').html(html);
        } else {
            $('#recipeList').html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p>검색 결과가 없습니다.</p>
                    <a href="recipes.html" class="btn btn-primary mt-3">
                        <i class="fas fa-redo"></i> 전체 레시피 보기
                    </a>
                </div>
            `);
        }
        
        // 페이지네이션 생성
        createPagination(filtered.length, page, itemsPerPage, category, search);
    }).fail(function(jqXHR, textStatus) {
        console.error(`경로 ${paths[pathIndex]} 실패, 다음 경로 시도`);
        tryLoad(pathIndex + 1);
    });
    }
    
    tryLoad(0);
    
    // 카테고리 로드
    const catPaths = ['data/categories.json', './data/categories.json', '/data/categories.json'];
    
    function tryLoadCat(pathIndex) {
        if (pathIndex >= catPaths.length) return;
        
        $.getJSON(catPaths[pathIndex], function(data) {
            categories = data;
            displayCategoryButtons(category);
        }).fail(function() {
            tryLoadCat(pathIndex + 1);
        });
    }
    
    tryLoadCat(0);
});

// 카테고리 버튼 표시
function displayCategoryButtons(currentCategory) {
    let html = `<a href="recipes.html" class="btn category-btn ${!currentCategory ? 'active' : ''}">모두보기</a>`;
    
    for (let category in categories) {
        const isActive = category === currentCategory ? 'active' : '';
        html += `<a href="recipes.html?category=${encodeURIComponent(category)}" class="btn category-btn ${isActive}">
            ${category} (${categories[category]})
        </a>`;
    }
    
    $('#categoryButtons').html(html);
}

// 페이지네이션 생성
function createPagination(totalItems, currentPage, itemsPerPage, category, search) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        $('#pagination').html('');
        return;
    }
    
    let baseUrl = 'recipes.html?';
    if (category) baseUrl += `category=${encodeURIComponent(category)}&`;
    if (search) baseUrl += `search=${encodeURIComponent(search)}&`;
    
    let html = '<nav><ul class="pagination justify-content-center">';
    
    // 이전 버튼
    if (currentPage > 1) {
        html += `<li class="page-item">
            <a class="page-link" href="${baseUrl}page=${currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>`;
    }
    
    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
        } else if (i >= currentPage - 2 && i <= currentPage + 2) {
            html += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${i}">${i}</a></li>`;
        } else if (i === 1 || i === totalPages) {
            html += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${i}">${i}</a></li>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        html += `<li class="page-item">
            <a class="page-link" href="${baseUrl}page=${currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>`;
    }
    
    html += '</ul></nav>';
    $('#pagination').html(html);
}
