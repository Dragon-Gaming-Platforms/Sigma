// Configuration
const CONFIG = {
    gamesFolder: 'games/',
    excludeFiles: ['README.md', 'template.html', '.gitkeep'],
    defaultEmoji: '🎮',
    cacheTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Game metadata cache
let gamesCache = {
    data: [],
    timestamp: 0
};

// Function to fetch file list from games directory
async function fetchGamesList() {
    try {
        // Try to fetch the games-manifest.json first (if it exists)
        const manifestResponse = await fetch('games-manifest.json');
        if (manifestResponse.ok) {
            const manifest = await manifestResponse.json();
            return manifest.games || [];
        }
    } catch (error) {
        console.log('No manifest found, will scan directory');
    }
    
    // Fallback: Return empty array and log message
    console.log('Please run the build script to generate games-manifest.json');
    return [];
}

// Function to extract metadata from HTML file
async function extractGameMetadata(filename) {
    try {
        const response = await fetch(`${CONFIG.gamesFolder}${filename}`);
        const html = await response.text();
        
        // Create a temporary DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract metadata from meta tags or fallback to defaults
        const title = doc.querySelector('meta[name="game-title"]')?.content || 
                     doc.querySelector('title')?.textContent || 
                     filename.replace('.html', '').replace(/-/g, ' ');
        
        const description = doc.querySelector('meta[name="game-description"]')?.content || 
                           doc.querySelector('meta[name="description"]')?.content || 
                           'No description available';
        
        const emoji = doc.querySelector('meta[name="game-emoji"]')?.content || 
                     CONFIG.defaultEmoji;
        
        const tagsContent = doc.querySelector('meta[name="game-tags"]')?.content || '';
        const tags = tagsContent ? tagsContent.split(',').map(tag => tag.trim()) : ['game'];
        
        const author = doc.querySelector('meta[name="game-author"]')?.content || 'Unknown';
        
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
        return null;
    }
}

// Function to load all games
async function loadGames() {
    // Check cache first
    const now = Date.now();
    if (gamesCache.data.length > 0 && (now - gamesCache.timestamp) < CONFIG.cacheTimeout) {
        return gamesCache.data;
    }
    
    showLoading(true);
    
    try {
        const gameFiles = await fetchGamesList();
        const games = [];
        
        // Process each game file
        for (const file of gameFiles) {
            if (CONFIG.excludeFiles.includes(file)) continue;
            if (!file.endsWith('.html')) continue;
            
            const metadata = await extractGameMetadata(file);
            if (metadata) {
                games.push(metadata);
            }
        }
        
        // Update cache
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
        loader.innerHTML = '<div class="spinner"></div><p>Loading games...</p>';
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
            <div class="game-meta">
                <small>By ${game.author}</small>
            </div>
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
                <p style="text-align: center; color: white; font-size: 1.2rem;">
                    No games found. Add HTML games to the games/ folder!
                </p>
            </div>
        `;
        return;
    }
    
    gamesToRender.forEach(game => {
        gamesGrid.appendChild(createGameCard(game));
    });
    
    // Update game count
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
        game.author.toLowerCase().includes(searchTerm)
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
        gamesCache.timestamp = 0; // Invalidate cache
        allGames = await loadGames();
        renderGames(allGames);
    };
    searchBar.appendChild(refreshBtn);
}

// Initialize on page load
async function init() {
    addRefreshButton();
    allGames = await loadGames();
    renderGames(allGames);
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}