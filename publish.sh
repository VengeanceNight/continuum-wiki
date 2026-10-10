#!/usr/bin/env bash
# Build the public Continuum player wiki from the vault's 80_Wiki/ folder (Bob, 2026-10-10).
#
#   ./publish.sh            secret check, copy, build into ./public
#   ./publish.sh --serve    same, then serve a local preview on http://localhost:8080
#   ./publish.sh --deploy   same, then deploy to Cloudflare Pages (https://western-reaches.pages.dev)
#
# The secret check refuses to build if any wiki page contains GM-only material.
# Deploy: Cloudflare Pages project "western-reaches" (wrangler login on this machine).
set -euo pipefail
shopt -s globstar nullglob

SRC="$HOME/obsidian/The Continuum/80_Wiki"
HERE="$(cd "$(dirname "$0")" && pwd)"

# GM-only terms that must never reach players. Word-boundary, case-insensitive.
# "carbon" can false-positive (e.g. "carbon steel"): reword the page rather than weaken the check.
BANNED='\b(copper|cobalt|calcite|carbon)\b|shattered crystal|\[!secret\]|^fragment:|02_GM_Secrets|01_Canon|00_System'

fail=0
if hits=$(grep -rniEH --include='*.md' "$BANNED" "$SRC"); then
  echo "REFUSING TO PUBLISH: GM-only material found in 80_Wiki:" >&2
  echo "$hits" | sed "s|$SRC/||" >&2
  fail=1
fi
# Western Reaches + galaxy wording on the same page would hint at the WR secret.
# (Listing Western Reaches and Darkspace as separate tables is fine.)
for f in "$SRC"/**/*.md; do
  [ -f "$f" ] || continue
  if grep -qi 'western reaches' "$f" && grep -qiE '\b(galaxy|galaxies|star systems?|planets?)\b' "$f"; then
    echo "REFUSING TO PUBLISH: ${f#$SRC/} mentions Western Reaches together with galaxy/planet wording" >&2
    fail=1
  fi
done
[ "$fail" -eq 0 ] || exit 1

if todo=$(grep -rnH --include='*.md' 'TBD' "$SRC"); then
  echo "Note: unfinished placeholders (TBD) still on these pages:"
  echo "$todo" | sed "s|$SRC/||;s/^/  /"
fi

rsync -a --delete --exclude='.obsidian' "$SRC/" "$HERE/content/"
cd "$HERE"
if [ "${1:-}" = "--serve" ]; then
  npx quartz build --serve
else
  npx quartz build
  # Unlisted for now (Ken, 2026-10-10): keep search engines out.
  printf 'User-agent: *\nDisallow: /\n' > "$HERE/public/robots.txt"
  echo "Built into $HERE/public (robots.txt: noindex)"
  if [ "${1:-}" = "--deploy" ]; then
    npx --yes wrangler@4.149.0 pages deploy --branch main --commit-dirty=true
  fi
fi
