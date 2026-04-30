// Configuration
const CONFIG = {
    gamesFolder: 'games/',
    excludeFiles: ['README.md', 'template.html', '.gitkeep'],
    defaultEmoji: '🎮',
    cacheTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Emoji mapping based on keywords in filename/title
const EMOJI_MAP = {
    'snake': '🐍',
    'math': '🧮',
    'puzzle': '🧩',
    'racing': '🏎️',
    'car': '🚗',
    'space': '🚀',
    'shooter': '🔫',
    'platformer': '🏃',
    'adventure': '🗺️',
    'rpg': '⚔️',
    'strategy': '♟️',
    'card': '🃏',
    'chess': '♟️',
    'tetris': '🟦',
    'minecraft': '⛏️',
    'eaglercraft': '🦅',
    'craft': '⛏️',
    'survival': '🏕️',
    'shooter': '🎯',
    'fps': '🎯',
    'simulation': '🎮',
    'sports': '⚽',
    'basketball': '🏀',
    'soccer': '⚽',
    'football': '🏈',
    'tennis': '🎾',
    'golf': '⛳',
    'retro': '👾',
    'arcade': '🕹️',
    'casual': '🎲',
    'trivia': '❓',
    'quiz': '❓',
    'music': '🎵',
    'rhythm': '🎵',
    'tower': '🗼',
    'defense': '🛡️',
    'zombie': '🧟',
    'horror': '👻',
    'clicker': '👆',
    'idle': '⏱️',
    'tycoon': '💰',
    'farming': '🌾',
    'cooking': '👨‍🍳',
    'drawing': '🎨',
    'paint': '🎨',
    'physics': '⚛️',
    '3d': '🎮',
    '2d': '🎮',
    'multiplayer': '👥',
    'io': '🌐'
};

// Game metadata cache
let gamesCache = {
    data: [],
    timestamp: 0
};

// Function to fetch file list from games directory
async function fetchGamesList() {
    try {
        const manifestResponse = await fetch('games-manifest.json');
        if (manifestResponse.ok) {
            const manifest = await manifestResponse.json();
            return manifest.games || [];
        }
    } catch (error) {
        console.log('No manifest found, attempting directory listing...');
    }
    
    // Fallback: try to fetch directory listing via GitHub API if available
    try {
        const repoInfo = getRepoInfo();
        if (repoInfo) {
            const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/games`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const files = await response.json();
                return files
                    .filter(file => file.name.endsWith('.html') && !CONFIG.excludeFiles.includes(file.name))
                    .map(file => file.name);
            }
        }
    } catch (error) {
        console.log('GitHub API fallback failed');
    }
    
    console.log('Please run the build script to generate games-manifest.json');
    return [];
}

// Extract repo info from current URL
function getRepoInfo() {
    const url = window.location.hostname;
    const path = window.location.pathname;
    
    if (url.includes('github.io')) {
        const parts = path.split('/').filter(p => p);
        if (parts.length > 0) {
            return {
                owner: url.split('.')[0],
                repo: parts[0]
            };
        }
    }
    return null;
}

// Smart emoji selection based on filename and content
function selectEmoji(filename, title, content) {
    const searchText = (filename + ' ' + title).toLowerCase();
    
    for (const [keyword, emoji] of Object.entries(EMOJI_MAP)) {
        if (searchText.includes(keyword)) {
            return emoji;
        }
    }
    
    // Additional content-based detection
    if (content) {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('canvas') || lowerContent.includes('webgl')) {
            return '🎮';
        }
        if (lowerContent.includes('three.js') || lowerContent.includes('babylon')) {
            return '🎮';
        }
    }
    
    return CONFIG.defaultEmoji;
}

// Generate tags from filename and content
function generateTags(filename, title, content) {
    const tags = new Set();
    const searchText = (filename + ' ' + title).toLowerCase();
    
    // Add tags based on keywords
    const tagKeywords = {
        'puzzle': ['puzzle', 'sudoku', 'match'],
        'action': ['action', 'shooter', 'fight'],
        'arcade': ['arcade', 'retro', 'classic'],
        'strategy': ['strategy', 'tower', 'defense'],
        'adventure': ['adventure', 'rpg', 'quest'],
        'casual': ['casual', 'clicker', 'idle'],
        'multiplayer': ['multiplayer', 'io', 'online'],
        '3d': ['3d', 'three', 'webgl', 'babylon'],
        'canvas': ['canvas', '2d'],
        'educational': ['math', 'learn', 'quiz', 'trivia'],
        'minecraft': ['minecraft', 'craft', 'eagler', 'voxel'],
        'simulation': ['sim', 'tycoon', 'manager']
    };
    
    for (const [tag, keywords] of Object.entries(tagKeywords)) {
        if (keywords.some(keyword => searchText.includes(keyword))) {
            tags.add(tag);
        }
    }
    
    // Content-based tags
    if (content) {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('canvas')) tags.add('canvas');
        if (lowerContent.includes('webgl') || lowerContent.includes('three.js')) tags.add('3d');
        if (lowerContent.includes('multiplayer') || lowerContent.includes('websocket')) tags.add('multiplayer');
    }
    
    // Default tag
    if (tags.size === 0) {
        tags.add('game');
    }
    
    return Array.from(tags);
}

// Format filename to readable title
function formatTitle(filename) {
    return filename
        .replace('.html', '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Generate description from content
function generateDescription(content, title) {
    // Try to find meta description
    const metaDescMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaDescMatch) {
        return metaDescMatch[1];
    }
    
    // Try to find first paragraph
    const pMatch = content.match(/<p[^>]*>([^<]{20,200})</i);
    if (pMatch) {
        return pMatch[1].trim().substring(0, 150) + '...';
    }
    
    // Try to find any text content
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        const bodyText = bodyMatch[1]
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        if (bodyText.length > 20) {
            return bodyText.substring(0, 150) + '...';
        }
    }
    
    // Fallback descriptions based on title
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('eaglercraft') || lowerTitle.includes('minecraft')) {
        return 'A Minecraft-like voxel game playable in your browser';
    }
    if (lowerTitle.includes('snake')) {
        return 'Classic snake arcade game';
    }
    if (lowerTitle.includes('tetris')) {
        return 'Block puzzle game';
    }
    if (lowerTitle.includes('chess')) {
        return 'Strategic board game';
    }
    
    return `Play ${title} - A browser-based game`;
}

// Extract author from content
function extractAuthor(content) {
    // Try meta author tag
    const metaAuthorMatch = content.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i);
    if (metaAuthorMatch) {
        return metaAuthorMatch[1];
    }
    
    // Try to find author in comments
    const commentMatch = content.match(/(?:author|by|created by):\s*([^\n<]+)/i);
    if (commentMatch) {
        return commentMatch[1].trim();
    }
    
    return 'Unknown';
}

// Function to extract metadata from HTML file
async function extractGameMetadata(filename) {
    try {
        const response = await fetch(`${CONFIG.gamesFolder}${filename}`);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Try to get metadata from meta tags (optional)
        const metaTitle = doc.querySelector('meta[name="game-title"]')?.content;
        const metaDescription = doc.querySelector('meta[name="game-description"]')?.content;
        const metaEmoji = doc.querySelector('meta[name="game-emoji"]')?.content;
        const metaTags = doc.querySelector('meta[name="game-tags"]')?.content;
        const metaAuthor = doc.querySelector('meta[name="game-author"]')?.content;
        
        // Fallback: extract from HTML
        const titleElement = doc.querySelector('title')?.textContent || formatTitle(filename);
        const title = metaTitle || titleElement;
        
        const description = metaDescription || 
                          doc.querySelector('meta[name="description"]')?.content ||
                          generateDescription(html, title);
        
        const emoji = metaEmoji || selectEmoji(filename, title, html);
        
        const tags = metaTags 
            ? metaTags.split(',').map(tag => tag.trim())
            : generateTags(filename, title, html);
        
        const author = metaAuthor || extractAuthor(html);
        
        return {
            title: title,
            description: description,
            emoji: emoji,
            tags: tags,
            author: author,
            type: 'local',
            url: `${CONFIG.gamesFolder}${filename}`,
            filename: filename
        };
    } catch (error) {
        console.error(`Error extracting metadata from ${filename}:`, error);
        
        // Return basic metadata even on error
        const basicTitle = formatTitle(filename);
        return {
            title: basicTitle,
            description: `Play ${basicTitle}`,
            emoji: CONFIG.defaultEmoji,
            tags: ['game'],
            author: 'Unknown',
            type: 'local',
            url: `${CONFIG.gamesFolder}${filename}`,
            filename: filename
        };
    }
}

// Function to load all games
async function loadGames() {
    const now = Date.now();
    if (gamesCache.data.length > 0 && (now - gamesCache.timestamp) < CONFIG.cacheTimeout) {
        return gamesCache.data;
    }
    
    showLoading(true);
    
    try {
        const gameFiles = await fetchGamesList();
        const games = [];
        
        for (const file of gameFiles) {
            if (CONFIG.excludeFiles.includes(file)) continue;
            if (!file.endsWith('.html')) continue;
            
            const metadata = await extractGameMetadata(file);
            if (metadata) {
                games.push(metadata);
            }
        }
        
        gamesCache.data = games;
        gamesCache.timestamp = now;
        
        showLoading(false);
        return games;
    } catch (error) {
        console.error('Error loading games:', error);
        showLoading(false);
        return [];
    }
}

// Function to show/hide loading indicator
function showLoading(show) {
    let loader = document.getElementById('loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.className = 'loader';
        loader.innerHTML = '<div class="spinner"></div><p>Discovering games...</p>';
        document.getElementById('gamesGrid').parentElement.insertBefore(
            loader, 
            document.getElementById('gamesGrid')
        );
    }
    loader.style.display = show ? 'block' : 'none';
}

// Function to create game card
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-game', game.filename);
    
    const tags = game.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    card.innerHTML = `
        <div class="game-thumbnail">${game.emoji}</div>
        <div class="game-info">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <div class="game-tags">${tags}</div>
            ${game.author !== 'Unknown' ? `<div class="game-meta"><small>By ${game.author}</small></div>` : ''}
            <a href="${game.url}" class="play-button" target="${game.type === 'external' ? '_blank' : '_self'}">
                Play Now
            </a>
        </div>
    `;
    
    return card;
}

// Function to render games
function renderGames(gamesToRender) {
    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = '';
    
    if (gamesToRender.length === 0) {
        gamesGrid.innerHTML = `
            <div class="no-games">
                <h2>No games found</h2>
                <p>Add HTML game files to the <code>games/</code> folder and run the build script:</p>
                <pre>python3 build-manifest.py</pre>
                <p>Or simply drag and drop HTML game files!</p>
            </div>
        `;
        return;
    }
    
    gamesToRender.forEach(game => {
        gamesGrid.appendChild(createGameCard(game));
    });
    
    updateGameCount(gamesToRender.length);
}

// Function to update game count
function updateGameCount(count) {
    let countElement = document.getElementById('gameCount');
    if (!countElement) {
        countElement = document.createElement('p');
        countElement.id = 'gameCount';
        countElement.style.textAlign = 'center';
        countElement.style.color = 'white';
        countElement.style.marginBottom = '1rem';
        countElement.style.fontSize = '1.1rem';
        document.querySelector('.search-bar').after(countElement);
    }
    countElement.textContent = `${count} game${count !== 1 ? 's' : ''} available`;
}

// Search functionality
let allGames = [];

document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredGames = allGames.filter(game => 
        game.title.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        game.author.toLowerCase().includes(searchTerm) ||
        game.filename.toLowerCase().includes(searchTerm)
    );
    renderGames(filteredGames);
});

// Refresh button functionality
function addRefreshButton() {
    const searchBar = document.querySelector('.search-bar');
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refreshBtn';
    refreshBtn.className = 'refresh-button';
    refreshBtn.innerHTML = '🔄 Refresh Games';
    refreshBtn.onclick = async () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '🔄 Refreshing...';
        gamesCache.timestamp = 0;
        allGames = await loadGames();
        renderGames(allGames);
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '🔄 Refresh Games';
    };
    searchBar.appendChild(refreshBtn);
}

// Initialize on page load
async function init() {
    addRefreshButton();
    allGames = await loadGames();
    renderGames(allGames);
    
    // Show helpful message if no games found
    if (allGames.length === 0) {
        showFirstTimeMessage();
    }
}

// Show first-time setup message
function showFirstTimeMessage() {
    const message = document.createElement('div');
    message.className = 'setup-message';
    message.innerHTML = `
        <h2>🎮 Welcome to Web Games Portal!</h2>
        <p>To get started:</p>
        <ol>
            <li>Add HTML game files to the <code>games/</code> folder</li>
            <li>Run: <code>python3 build-manifest.py</code></li>
            <li>Refresh this page</li>
        </ol>
        <p>No metadata required! Just drop in any HTML game file (like Eaglercraft) and it will automatically work.</p>
    `;
    document.querySelector('main').prepend(message);
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}