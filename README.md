# Sigma

A collection of browser-based games with support for the gn-math single-file library, all hosted on GitHub Pages.

## 🚀 Features

- **Single-file HTML games** - Self-contained games in the `games/` directory
- **External repository support** - Link to games hosted elsewhere
- **gn-math integration** - Built-in support for mathematical operations
- **Responsive design** - Works on desktop and mobile
- **Easy to contribute** - Simple structure for adding new games
- **Search functionality** - Find games by name, description, or tags

## 📁 Structure

```text
web-games-portal/
├── index.html # Main portal page
├── css/
│ └── style.css # Styling
├── js/
│ └── main.js # Game database and logic
├── games/ # Single-file HTML games
│ ├── math-puzzle.html
│ └── your-game.html
├── lib/
│ └── gn-math.html # gn-math library
└── README.md
```

## 🎯 Adding a New Game

### Option 1: Local Single-File Game

1. Create your game as a single HTML file in the `games/` directory
2. Add entry to `js/main.js`:

```javascript
{
    title: "Your Game Title",
    description: "Game description",
    emoji: "🎮",
    tags: ["tag1", "tag2"],
    type: "local",
    url: "games/your-game.html"
}
```

### Option 2: External Repository Game

```javascript
{
    title: "External Game",
    description: "Hosted elsewhere",
    emoji: "🎯",
    tags: ["external"],
    type: "external",
    url: "https://username.github.io/game-repo/"
}
```

#🧮 Using gn-math in Your Games
Include the library in your game:
```html
<script src="../lib/gn-math.html"></script>
```
Or use an iframe:
```html
<iframe src="../lib/gn-math.html" style="display:none;" onload="// library loaded"></iframe>
```

## 🌐 Deploy to GitHub Pages
1. Create a new repository named Sigma
2. Upload all files
3. Go to Settings → Pages
4. Select main branch as source
5. Your site will be live at https://yourusername.github.io/Sigma/

##🤝 Contributing
1. Fork the repository
2. Add your game to the games/ directory
3. Update js/main.js with your game info
4. Submit a pull request

###📝 License
MIT License - Feel free to use and modify!

###🎨 Customization
Edit css/style.css to change colors and styling
Modify js/main.js to add features
Replace emojis with actual game thumbnails
