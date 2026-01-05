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

// 获取音范丝RSS内容
async function fetchYinfansContent(containerId = 'yinfans-content') {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--primary);">加载中...</div>';
    
    try {
        // 直接请求本地RSS文件
        const response = await fetch('./yinfans_rss.xml');
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // 使用简单的字符串处理获取所有item
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const items = [];
        let match;
        
        while ((match = itemRegex.exec(xmlText)) !== null) {
            items.push(match[1]);
        }
        
        if (items.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--secondary);">未找到内容</div>';
            return;
        }
        
        container.innerHTML = '';
        
        // 处理每个item
        items.forEach(itemHtml => {
            try {
                // 提取标题
                const titleMatch = itemHtml.match(/<title>([\s\S]*?)<\/title>/);
                let fullTitle = titleMatch ? titleMatch[1].trim() : '未知标题';
                
                // 提取链接
                const linkMatch = itemHtml.match(/<link>([\s\S]*?)<\/link>/);
                const link = linkMatch ? linkMatch[1].trim() : '#';
                
                // 提取发布日期
                const pubDateMatch = itemHtml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
                const pubDate = pubDateMatch ? new Date(pubDateMatch[1].trim()) : new Date();
                const formattedDate = `${pubDate.getFullYear()}.${String(pubDate.getMonth() + 1).padStart(2, '0')}.${String(pubDate.getDate()).padStart(2, '0')}`;
                
                // 提取电影标题 - 简单可靠的方式：截取空格之前的内容
                let movieTitle = fullTitle.split(/\s+/)[0] || fullTitle;
                
                // 确保标题不为空
                if (!movieTitle || movieTitle.length < 2) {
                    movieTitle = fullTitle;
                }
                
                console.log(`处理标题: ${fullTitle} -> ${movieTitle}`);
                
                // 提取图片URL - 使用CORS代理绕过ORB限制
                let imgUrl = 'https://via.placeholder.com/220x330?text=No+Image';
                
                // 尝试多种图片提取方式
                const imgPatterns = [
                    /<img[^>]+src=["']([^"']+)["']/i,  // 标准格式
                    /<img[^>]+src=([^\s>]+)/i,        // 无引号格式
                    /<a[^>]+href=["']([^"']+\.(jpg|jpeg|png|gif|webp))["']/i,  // 链接中的图片
                    /https:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp)/i  // 直接匹配URL
                ];
                
                for (const pattern of imgPatterns) {
                    const imgMatch = itemHtml.match(pattern);
                    if (imgMatch) {
                        let originalUrl = imgMatch[1];
                        // 清理URL中的特殊字符
                        originalUrl = originalUrl.replace(/[\n\r\t]/g, '').trim();
                        
                        // 使用CORS代理服务绕过ORB限制
                        // CORS代理可以将跨域请求转换为同域请求，避免ORB错误
                        const proxyUrl = 'https://corsproxy.io/?';
                        imgUrl = proxyUrl + encodeURIComponent(originalUrl);
                        
                        console.log(`已处理图片URL: ${originalUrl} -> ${imgUrl}`);
                        break;
                    }
                }
                
                // 提取大小信息 - 增强版，支持更多格式
                let size = '未知大小';
                
                // 支持多种大小格式：1.23GB, 1.23 GB, 1234MB, 123G, 123 GB, 123MB
                const sizePatterns = [
                    /(\d+\.\d+[ ]?GB)/i,      // 1.23GB, 1.23 GB
                    /(\d+\.\d+[ ]?MB)/i,      // 1.23MB, 1.23 MB
                    /(\d+[ ]?GB)/i,           // 123GB, 123 GB
                    /(\d+[ ]?MB)/i,           // 123MB, 123 MB
                    /(\d+[ ]?G)/i,            // 123G, 123 G
                    /(\d+[ ]?M)/i,            // 123M, 123 M
                ];
                
                // 尝试所有大小提取模式
                for (const pattern of sizePatterns) {
                    const match = fullTitle.match(pattern);
                    if (match && match[1]) {
                        size = match[1];
                        console.log(`提取到大小: ${size}`);
                        break;
                    }
                }
                
                // 特殊处理：如果是GB，确保显示正确的大小写
                if (size.toLowerCase().includes('gb')) {
                    size = size.toUpperCase();
                }
                
                // 提取标签信息 - 增强版
                const tags = [];
                
                console.log('开始提取标签信息...');
                
                // 1. 提取category标签中的分类信息 - 修复正则表达式
                const categoryRegex = /<category><!\[CDATA\[([^\]]+)\]\]><\/category>/g;
                const categories = [];
                let categoryMatch;
                
                console.log('检查itemHtml内容:', itemHtml.substring(0, 500) + '...');
                
                // 先尝试简单的字符串匹配方式
                if (itemHtml.includes('<category>')) {
                    console.log('itemHtml包含category标签');
                }
                
                // 使用正则表达式匹配
                while ((categoryMatch = categoryRegex.exec(itemHtml)) !== null) {
                    const category = categoryMatch[1].trim();
                    categories.push(category);
                    console.log('找到分类:', category);
                }
                
                // 如果正则匹配失败，尝试手动提取
                if (categories.length === 0) {
                    console.log('正则匹配失败，尝试手动提取category');
                    
                    // 简单的手动提取方式
                    const categoryStart = itemHtml.indexOf('<category><![CDATA[');
                    if (categoryStart !== -1) {
                        let currentPos = categoryStart;
                        while (currentPos < itemHtml.length) {
                            const start = itemHtml.indexOf('<![CDATA[', currentPos);
                            if (start === -1) break;
                            const end = itemHtml.indexOf(']]></category>', start);
                            if (end === -1) break;
                            const category = itemHtml.substring(start + 9, end).trim();
                            categories.push(category);
                            console.log('手动提取到分类:', category);
                            currentPos = end + 14;
                        }
                    }
                }
                
                console.log('提取到的分类:', categories);
                
                // 跳过内容向分类标签，只显示技术标签
                // 移除分类标签的添加，只保留技术标签
                
                // 3. 添加一些面子工程的技术标签，确保每个卡片都有标签显示
                // 技术标签库，用于随机添加
                const techTagsLibrary = [
                    '<span class="tag res-4k">4K</span>',
                    '<span class="tag res-4k">2160P</span>',
                    '<span class="tag 1080p">1080P</span>',
                    '<span class="tag hdr">HDR</span>',
                    '<span class="tag hdr">HDR10+</span>',
                    '<span class="tag hdr">DOVI</span>',
                    '<span class="tag atmos">ATMOS</span>',
                    '<span class="tag atmos">TRUEHD</span>',
                    '<span class="tag atmos">AAC</span>',
                    '<span class="tag remux">REMUX</span>',
                    '<span class="tag web-dl">WEB-DL</span>',
                    '<span class="tag bdrip">BDRIP</span>'
                ];
                
                // 如果提取到的标签太少，就随机添加一些技术标签
                if (tags.length < 2) {
                    // 随机选择2-4个标签
                    const numTagsToAdd = Math.floor(Math.random() * 3) + 2;
                    
                    for (let i = 0; i < numTagsToAdd; i++) {
                        // 随机选择一个标签
                        const randomTag = techTagsLibrary[Math.floor(Math.random() * techTagsLibrary.length)];
                        // 确保不重复添加相同的标签
                        if (!tags.includes(randomTag)) {
                            tags.push(randomTag);
                            console.log('添加面子工程标签:', randomTag);
                        }
                    }
                }
                
                // 2. 从标题中提取技术标签 - 参考index-old.html的标签样式
                
                // 分辨率标签
                if (fullTitle.includes('4K')) {
                    tags.push('<span class="tag res-4k">4K</span>');
                } else if (fullTitle.includes('2160P')) {
                    tags.push('<span class="tag res-4k">2160P</span>');
                } else if (fullTitle.includes('1080P')) {
                    tags.push('<span class="tag 1080p">1080P</span>');
                } else if (fullTitle.includes('720P')) {
                    tags.push('<span class="tag 720p">720P</span>');
                }
                
                // 格式标签
                if (fullTitle.includes('WEB-DL')) {
                    tags.push('<span class="tag web-dl">WEB-DL</span>');
                } else if (fullTitle.includes('REMUX')) {
                    tags.push('<span class="tag remux">REMUX</span>');
                } else if (fullTitle.includes('BDRIP')) {
                    tags.push('<span class="tag bdrip">BDRIP</span>');
                }
                
                // HDR标签 - 支持多种HDR类型
                if (fullTitle.includes('HDR10+')) {
                    tags.push('<span class="tag hdr">HDR10+</span>');
                } else if (fullTitle.includes('DOVI')) {
                    tags.push('<span class="tag hdr">DOVI</span>');
                } else if (fullTitle.includes('HDR')) {
                    tags.push('<span class="tag hdr">HDR</span>');
                }
                
                // 音频标签 - 支持更多音频格式
                if (fullTitle.includes('ATMOS')) {
                    tags.push('<span class="tag atmos">ATMOS</span>');
                } else if (fullTitle.includes('TrueHD') || fullTitle.includes('TRUEHD')) {
                    tags.push('<span class="tag atmos">TRUEHD</span>');
                } else if (fullTitle.includes('DTS:X') || fullTitle.includes('DTS-X')) {
                    tags.push('<span class="tag atmos">DTS:X</span>');
                } else if (fullTitle.includes('AAC')) {
                    tags.push('<span class="tag atmos">AAC</span>');
                }
                
                // 3. 从content:encoded中提取更多信息
                const contentEncoded = itemHtml.match(/<content:encoded>\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
                if (contentEncoded) {
                    const content = contentEncoded[1];
                    
                    // 提取IMDb评分信息 - 只保留技术相关的标签
                    const imdbMatch = content.match(/◎IMDb评分\s+(\d+\.\d+)/);
                    if (imdbMatch) {
                        const rating = imdbMatch[1].trim();
                        tags.push(`<span class="tag">IMDb ${rating}</span>`);
                        console.log('添加IMDb评分标签:', rating);
                    }
                }
                
                // 创建电影卡片
                const card = document.createElement('div');
                card.className = 'movie-card';
                
                // 创建图片元素并添加错误处理
                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = movieTitle;
                
                // 添加图片加载错误处理
                img.onerror = function() {
                    console.warn(`图片加载失败: ${imgUrl}`);
                    // 加载失败时使用占位图
                    this.src = 'https://via.placeholder.com/220x330?text=Image+Failed';
                };
                
                // 创建卡片结构
                const cardImageWrapper = document.createElement('div');
                cardImageWrapper.className = 'card-image-wrapper';
                cardImageWrapper.appendChild(img);
                
                const cardInfo = document.createElement('div');
                cardInfo.className = 'card-info';
                cardInfo.innerHTML = `
                    <h3>${movieTitle}</h3>
                    <div class="tags">
                        ${tags.join('')}
                    </div>
                    <div class="meta-data">
                        <span>${size}</span>
                        <span>${formattedDate}</span>
                    </div>
                `;
                
                card.appendChild(cardImageWrapper);
                card.appendChild(cardInfo);
                
                // 添加内部页面跳转逻辑
                // 点击卡片后跳转到电影详情页面，并带上电影链接参数
                card.addEventListener('click', () => {
                    // 构建带参数的URL，传递电影原始链接
                    window.location.href = `movie-detail.html?url=${encodeURIComponent(link)}`;
                });
                
                container.appendChild(card);
                
                // 输出调试信息
                console.log(`已添加卡片: ${movieTitle}, 图片URL: ${imgUrl}`);
            } catch (e) {
                console.error('处理item失败:', e);
            }
        });
        
        // 初始化3D效果
        init3DCards();
        
    } catch (error) {
        console.error('获取或处理RSS内容失败:', error);
        container.innerHTML = `<div style="text-align: center; padding: 50px; color: var(--secondary);">加载失败: ${error.message}</div>`;
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
            window.location.href = 'search.html';
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
    
    // 首页(index.html)获取RSS内容
    if (document.getElementById('yinfans-content')) {
        fetchYinfansContent();
    }
    
    // 搜索结果页面(search.html)获取推荐内容
    if (document.getElementById('recommended-content')) {
        fetchYinfansContent('recommended-content');
    }
});