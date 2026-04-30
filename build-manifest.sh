#!/bin/bash

# Build script to generate games-manifest.json
# Usage: ./build-manifest.sh

GAMES_DIR="games"
OUTPUT_FILE="games-manifest.json"

echo "Scanning games directory..."

# Find all HTML files in games directory (excluding template and README)
games=$(find "$GAMES_DIR" -maxdepth 1 -name "*.html" ! -name "template.html" -exec basename {} \;)

# Count games
count=$(echo "$games" | grep -v "^$" | wc -l)

# Generate JSON
cat > "$OUTPUT_FILE" << EOF
{
  "generated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "count": $count,
  "games": [
EOF

# Add game files to JSON
first=true
while IFS= read -r game; do
    if [ ! -z "$game" ]; then
        if [ "$first" = true ]; then
            echo "    \"$game\"" >> "$OUTPUT_FILE"
            first=false
        else
            echo "    ,\"$game\"" >> "$OUTPUT_FILE"
        fi
    fi
done <<< "$games"

# Close JSON
cat >> "$OUTPUT_FILE" << EOF
  ]
}
EOF

echo "✅ Manifest generated: $OUTPUT_FILE"
echo "Total games: $count"
echo ""
echo "Games found:"
echo "$games"