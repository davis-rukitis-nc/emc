#!/bin/bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/src/assets/fonts"
mkdir -p "$DEST"

fonts=(
  "AllRoundGothic-Book.ttf"
  "AllRoundGothic-Demi.ttf"
  "AllRoundGothic-Bold.ttf"
)

search_roots=(
  "$ROOT"
  "$ROOT/.."
  "$HOME/Downloads"
  "$HOME/Desktop"
  "$HOME/Documents"
)

missing=0
for font in "${fonts[@]}"; do
  if [ -f "$DEST/$font" ]; then
    continue
  fi
  found=""
  for base in "${search_roots[@]}"; do
    [ -d "$base" ] || continue
    candidate=$(find "$base" -maxdepth 3 -type f -name "$font" -print -quit 2>/dev/null)
    if [ -n "$candidate" ]; then
      found="$candidate"
      break
    fi
  done
  if [ -n "$found" ]; then
    cp "$found" "$DEST/$font"
    echo "Installed $font"
  else
    echo "Missing $font"
    missing=1
  fi
done

if [ "$missing" -eq 1 ]; then
  echo
  echo "AllRoundGothic will use a rounded fallback until the three font files are copied into:"
  echo "$DEST"
fi
