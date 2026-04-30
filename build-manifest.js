#!/usr/bin/env node

/**
 * Build script to generate games-manifest.json
 * Run this script whenever you add new games to the games/ folder
 * Usage: node build-manifest.js
 */

const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, 'games');
const OUTPUT_FILE = path.join(__dirname, 'games-manifest.json');
const EXCLUDE_FILES = ['README.md', 'template.html', '.gitkeep'];

function scanGamesDirectory() {
    try {
        const files = fs.readdirSync(GAMES_DIR);
        const gameFiles = files.filter(file => {
            return file.endsWith('.html') && !EXCLUDE_FILES.includes(file);
        });
        
        console.log(`Found ${gameFiles.length} game(s):`);
        gameFiles.forEach(file => console.log(`  - ${file}`));
        
        return gameFiles;
    } catch (error) {
        console.error('Error scanning games directory:', error);
        return [];
    }
}

function generateManifest() {
    const games = scanGamesDirectory();
    
    const manifest = {
        generated: new Date().toISOString(),
        count: games.length,
        games: games
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    console.log(`\n✅ Manifest generated: ${OUTPUT_FILE}`);
    console.log(`Total games: ${games.length}`);
}

// Run the script
generateManifest();