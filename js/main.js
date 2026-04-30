// Game database - Add your games here
const games = [
    {
        title: "Math Puzzle Game",
        description: "Solve mathematical puzzles using gn-math library",
        emoji: "🧮",
        tags: ["math", "puzzle", "gn-math"],
        type: "local", // local or external
        url: "games/math-puzzle.html"
    },
    {
        title: "Example External Game",
        description: "Game hosted in another repository",
        emoji: "🎯",
        tags: ["action"],
        type: "external",
        url: "https://yourusername.github.io/another-game-repo/"
    },
    {
        title: "Snake Game",
        description: "Classic snake game with a twist",
        emoji: "🐍",
        tags: ["classic", "arcade"],
        type: "local",
        url: "games/snake.html"
    }
];

// Function to create game card
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    const tags = game.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    card.innerHTML = `
        <div class="game-thumbnail">${game.emoji}</div>
        <div class="game-info">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <div class="game-tags">${tags}</div>
            <a href="${game.url}" class="play-button" target="${game.type === 'external' ? '_blank' : '_self'}">
                Play Now
            </a>
        </div>
    `;
    
    return card;
}

// Function to render games
function renderGames(gamesToRender = games) {
    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = '';
    
    if (gamesToRender.length === 0) {
        gamesGrid.innerHTML = '<p style="text-align: center; color: white; font-size: 1.2rem;">No games found</p>';
        return;
    }
    
    gamesToRender.forEach(game => {
        gamesGrid.appendChild(createGameCard(game));
    });
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredGames = games.filter(game => 
        game.title.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    renderGames(filteredGames);
});

// Initial render
renderGames();