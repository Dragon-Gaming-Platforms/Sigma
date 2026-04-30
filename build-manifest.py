#!/usr/bin/env python3

"""
Build script to generate games-manifest.json
Run this script whenever you add new games to the games/ folder
Usage: python3 build-manifest.py
"""

import os
import json
from datetime import datetime

GAMES_DIR = 'games'
OUTPUT_FILE = 'games-manifest.json'
EXCLUDE_FILES = ['README.md', 'template.html', '.gitkeep']

def scan_games_directory():
    """Scan the games directory for HTML files"""
    try:
        files = os.listdir(GAMES_DIR)
        game_files = [
            f for f in files 
            if f.endswith('.html') and f not in EXCLUDE_FILES
        ]
        
        print(f"Found {len(game_files)} game(s):")
        for file in game_files:
            print(f"  - {file}")
        
        return game_files
    except Exception as e:
        print(f"Error scanning games directory: {e}")
        return []

def generate_manifest():
    """Generate the games manifest JSON file"""
    games = scan_games_directory()
    
    manifest = {
        'generated': datetime.utcnow().isoformat() + 'Z',
        'count': len(games),
        'games': sorted(games)
    }
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Manifest generated: {OUTPUT_FILE}")
    print(f"Total games: {len(games)}")

if __name__ == '__main__':
    generate_manifest()