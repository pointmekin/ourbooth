#!/bin/bash

# Compress PNG stickers to WebP format using ffmpeg
# Usage: ./scripts/compress-stickers.sh

STICKERS_DIR="public/assets/images/stickers"
QUALITY=85  # WebP quality (0-100, higher = better quality, larger file)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🖼️  Compressing stickers in $STICKERS_DIR${NC}"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed. Install with: brew install ffmpeg"
    exit 1
fi

# Find all PNG files recursively
find "$STICKERS_DIR" -type f -name "*.png" | while read -r file; do
    # Get the output filename (replace .png with .webp)
    output="${file%.png}.webp"
    
    # Get original size
    original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    original_kb=$((original_size / 1024))
    
    # Convert to WebP
    ffmpeg -y -i "$file" -c:v libwebp -quality $QUALITY -lossless 0 "$output" -hide_banner -loglevel error
    
    if [ $? -eq 0 ]; then
        # Get new size
        new_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
        new_kb=$((new_size / 1024))
        savings=$((100 - (new_size * 100 / original_size)))
        
        echo -e "${GREEN}✓${NC} $(basename "$file") → $(basename "$output") (${original_kb}KB → ${new_kb}KB, ${savings}% smaller)"
    else
        echo "❌ Failed to convert: $file"
    fi
done

echo ""
echo -e "${GREEN}✅ Done! WebP files created alongside originals.${NC}"
echo ""
echo "To remove original PNGs after verifying WebP files work:"
echo "  find $STICKERS_DIR -name '*.png' -delete"
