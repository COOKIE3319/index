const MAX_ROTATION = 12;
const MAX_FLOAT_Z = 30;

// 3D卡片效果
function init3DCards() {
    const cards = document.querySelectorAll('.movie-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const xAxis = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
            const yAxis = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
            const rotateY = xAxis * MAX_ROTATION * -1;
            const rotateX = yAxis * MAX_ROTATION;

            card.style.setProperty('--rotateX', `${rotateX}deg`);
            card.style.setProperty('--rotateY', `${rotateY}deg`);
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${MAX_FLOAT_Z}px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rotateX', '0deg');
            card.style.setProperty('--rotateY', '0deg');
            card.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0)`;
        });
    });
}

// 移除不允许展示的词汇
function sanitizeText(text) {
    if (!text) return text;
    return text.replace(/音范丝/gi, '').replace(/yinfans/gi, '');
}

// 从本地JSON文件获取电影数据并显示
async function fetchYinfansContent(containerId = 'yinfans-content') {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--primary);">加载中...</div>';
    
    try {
        // 先加载movies-index.json的4个电影
        const localResp = await fetch('js/movies-index.json');
        if (localResp && localResp.ok) {
            const localMovies = await localResp.json();
            container.innerHTML = '';
            
            // 渲染本地四部电影（带标签）
            localMovies.forEach((lm, idx) => {
                const movieTitle = sanitizeText(lm['译名'] || lm['片名'] || '未知片名');
                const link = `movie-detail.html?local=${idx}`;
                const imgUrl = lm.poster || 'https://via.placeholder.com/220x330?text=No+Poster';

                const card = document.createElement('div');
                card.className = 'movie-card';

                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = movieTitle;
                img.onerror = function() { this.src = 'https://via.placeholder.com/220x330?text=No+Poster'; };

                const cardImageWrapper = document.createElement('div');
                cardImageWrapper.className = 'card-image-wrapper';
                cardImageWrapper.appendChild(img);

                const cardInfo = document.createElement('div');
                cardInfo.className = 'card-info';
                
                // 处理标签字段，分割成多个tag并添加颜色类
                const tags = lm['标签'] ? lm['标签'].split('/').map(t => {
                    const tag = t.trim();
                    const tagLower = tag.toLowerCase();
                    let className = 'tag';
                    
                    // 根据标签内容添加对应的类名
                    if (tagLower.includes('4k')) className += ' res-4k';
                    else if (tagLower.includes('hdr')) className += ' hdr';
                    else if (tagLower.includes('atmos') || tagLower.includes('全景声')) className += ' atmos';
                    else if (tagLower.includes('1080')) className += ' tag-1080';
                    else if (tagLower.includes('720')) className += ' tag-720';
                    else if (tagLower.includes('remux')) className += ' tag-remux';
                    else if (tagLower.includes('web-dl') || tagLower.includes('web')) className += ' tag-web-dl';
                    else if (tagLower.includes('bdrip') || tagLower.includes('蓝光')) className += ' tag-bdrip';
                    else if (tagLower.includes('dolby') || tagLower.includes('杜比')) className += ' atmos';
                    
                    return `<span class="${className}">${tag}</span>`;
                }).join('') : '';
                
                cardInfo.innerHTML = `
                    <h3>${movieTitle}</h3>
                    <div class="tags">
                        ${tags}
                    </div>
                `;

                card.appendChild(cardImageWrapper);
                card.appendChild(cardInfo);
                card.addEventListener('click', () => { window.location.href = link; });
                container.appendChild(card);
            });
        }
        
        // 再加载movies-more.json的电影（只显示标题和海报，随机添加标签）
        const moreResp = await fetch('js/movies-more.json');
        if (moreResp && moreResp.ok) {
            const moreMovies = await moreResp.json();
            
            // 标签池
            const tagPool = [
                { text: '4K', class: 'res-4k' },
                { text: '1080P', class: 'tag-1080' },
                { text: 'HDR', class: 'hdr' },
                { text: 'REMUX', class: 'tag-remux' },
                { text: 'WEB-DL', class: 'tag-web-dl' },
                { text: 'BluRay', class: 'tag-bdrip' },
                { text: 'Atmos', class: 'atmos' },
                { text: '杜比视界', class: 'hdr' }
            ];
            
            moreMovies.forEach((movie) => {
                const card = document.createElement('div');
                card.className = 'movie-card';

                const img = document.createElement('img');
                img.src = movie.poster || 'https://via.placeholder.com/220x330?text=No+Poster';
                img.alt = movie.title || '电影';
                img.onerror = function() { this.src = 'https://via.placeholder.com/220x330?text=No+Poster'; };

                const cardImageWrapper = document.createElement('div');
                cardImageWrapper.className = 'card-image-wrapper';
                cardImageWrapper.appendChild(img);

                const cardInfo = document.createElement('div');
                cardInfo.className = 'card-info';
                
                // 随机选择2-4个标签
                const numTags = Math.floor(Math.random() * 3) + 2; // 2-4个标签
                const shuffled = [...tagPool].sort(() => 0.5 - Math.random());
                const selectedTags = shuffled.slice(0, numTags);
                
                const tagsHtml = selectedTags.map(tag => 
                    `<span class="tag ${tag.class}">${tag.text}</span>`
                ).join('');
                
                cardInfo.innerHTML = `
                    <h3>${movie.title}</h3>
                    <div class="tags">
                        ${tagsHtml}
                    </div>
                `;

                card.appendChild(cardImageWrapper);
                card.appendChild(cardInfo);
                container.appendChild(card);
            });
        }
        
        // 初始化3D效果
        init3DCards();
        
    } catch (e) {
        console.error('加载电影失败:', e);
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--secondary);">加载失败</div>';
    }
}

// 随机加载movies-more中的电影
async function fetchRandomMovies(containerId, count = 12) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--primary);">加载中...</div>';
    
    // 检查是否是collection页面
    const isCollectionPage = containerId === 'collection-content';
    
    try {
        const resp = await fetch('js/movies-more.json');
        if (resp && resp.ok) {
            const allMovies = await resp.json();
            
            // 随机打乱数组并取前count个
            const shuffled = [...allMovies].sort(() => 0.5 - Math.random());
            const selectedMovies = shuffled.slice(0, count);
            
            container.innerHTML = '';
            
            // 标签池
            const tagPool = [
                { text: '4K', class: 'res-4k' },
                { text: '1080P', class: 'tag-1080' },
                { text: 'HDR', class: 'hdr' },
                { text: 'REMUX', class: 'tag-remux' },
                { text: 'WEB-DL', class: 'tag-web-dl' },
                { text: 'BluRay', class: 'tag-bdrip' },
                { text: 'Atmos', class: 'atmos' },
                { text: '杜比视界', class: 'hdr' }
            ];
            
            selectedMovies.forEach((movie) => {
                if (isCollectionPage) {
                    // COLLECTION页面特殊样式
                    const card = document.createElement('div');
                    card.className = 'movie-card collection-card';
                    card.style.backgroundImage = `url('${movie.poster || 'https://via.placeholder.com/220x330?text=No+Poster'}')`;
                    
                    const overlay = document.createElement('div');
                    overlay.className = 'collection-overlay';
                    
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'collection-title';
                    
                    // 处理标题，将"/"替换为换行
                    const titleParts = movie.title.split('/');
                    titleDiv.innerHTML = titleParts.map(part => `<span>${part.trim()}</span>`).join('');
                    
                    overlay.appendChild(titleDiv);
                    card.appendChild(overlay);
                    container.appendChild(card);
                } else {
                    // 其他页面正常样式
                    const card = document.createElement('div');
                    card.className = 'movie-card';

                    const img = document.createElement('img');
                    img.src = movie.poster || 'https://via.placeholder.com/220x330?text=No+Poster';
                    img.alt = movie.title || '电影';
                    img.onerror = function() { this.src = 'https://via.placeholder.com/220x330?text=No+Poster'; };

                    const cardImageWrapper = document.createElement('div');
                    cardImageWrapper.className = 'card-image-wrapper';
                    cardImageWrapper.appendChild(img);

                    const cardInfo = document.createElement('div');
                    cardInfo.className = 'card-info';
                    
                    // 随机选择2-4个标签
                    const numTags = Math.floor(Math.random() * 3) + 2;
                    const shuffledTags = [...tagPool].sort(() => 0.5 - Math.random());
                    const selectedTags = shuffledTags.slice(0, numTags);
                    
                    const tagsHtml = selectedTags.map(tag => 
                        `<span class="tag ${tag.class}">${tag.text}</span>`
                    ).join('');
                    
                    cardInfo.innerHTML = `
                        <h3>${movie.title}</h3>
                        <div class="tags">
                            ${tagsHtml}
                        </div>
                    `;

                    card.appendChild(cardImageWrapper);
                    card.appendChild(cardInfo);
                    container.appendChild(card);
                }
            });
            
            // 初始化3D效果
            init3DCards();
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--secondary);">加载失败</div>';
        }
    } catch (e) {
        console.error('加载随机电影失败:', e);
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--secondary);">加载失败</div>';
    }
}

// 为collection页面加载电影的专用函数
async function fetchCollectionMovies(containerId, count = 6) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--primary);">加载中...</div>';
    
    try {
        const resp = await fetch('js/movies-more.json');
        if (resp && resp.ok) {
            const allMovies = await resp.json();
            
            // 随机打乱数组并取前count个
            const shuffled = [...allMovies].sort(() => 0.5 - Math.random());
            const selectedMovies = shuffled.slice(0, count);
            
            container.innerHTML = '';
            
            selectedMovies.forEach((movie) => {
                const card = document.createElement('div');
                card.className = 'movie-card collection-card';
                card.style.backgroundImage = `url('${movie.poster || 'https://via.placeholder.com/220x330?text=No+Poster'}')`;
                
                const overlay = document.createElement('div');
                overlay.className = 'collection-overlay';
                
                const titleDiv = document.createElement('div');
                titleDiv.className = 'collection-title';
                
                // 处理标题，将"/"替换为换行
                const titleParts = movie.title.split('/');
                titleDiv.innerHTML = titleParts.map(part => `<span>${part.trim()}</span>`).join('');
                
                overlay.appendChild(titleDiv);
                card.appendChild(overlay);
                container.appendChild(card);
            });
            
            // 初始化3D效果
            init3DCards();
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--secondary);">加载失败</div>';
        }
    } catch (e) {
        console.error('加载collection电影失败:', e);
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--secondary);">加载失败</div>';
    }
}

// 更新时间
function updateTime() {
    const now = new Date();
    const datePart = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const timePart = now.toTimeString().split(' ')[0];
    const timeString = datePart + ' ' + timePart;
    document.getElementById('sys-time').innerText = 'SYS_TIME: ' + timeString;
}

// 搜索功能初始化
function initSearch() {
    const searchBox = document.getElementById('floating-search');
    const searchInput = searchBox.querySelector('input');
    
    // 点击搜索框展开/收起
    searchBox.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            searchInput.focus();
        }
    });
    
    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            // 跳转到搜索结果页面
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化页面');
    
    // 初始化搜索功能
    initSearch();
    
    // 初始化3D卡片效果（所有页面都需要）
    init3DCards();
    
    // 更新系统时间（所有页面都需要）
    setInterval(updateTime, 1000);
    updateTime();
    
    // 首页(index.html)获取电影数据
    if (document.getElementById('yinfans-content')) {
        fetchYinfansContent();
    }
});

// Script loaded successfully - v1.0
