#!/usr/bin/env bash
# Build the public Continuum player wikis from the vault's 80_Wiki/ folder (Bob, 2026-10-10; per-game sites 2026-10-12).
#
#   ./publish.sh                    secret check, then build every site into ./public/<site>
#   ./publish.sh --serve [site]     same check, then serve one site locally on http://localhost:8080 (default shadowdark)
#   ./publish.sh --deploy           build everything, then deploy to Cloudflare Pages
#
# Sites: one subfolder of 80_Wiki/ per game, each its own Pages project at <site>.crystalcontinuum.org.
#   shadowdark  Shadowdark home + campaigns (Western Reaches, Wednesday one-shots)
#   darkspace   unlinked placeholder (Ken, 2026-10-12): nothing links to it until STA wraps
# Redirect-only projects (no content):
#   crystalcontinuum  crystalcontinuum.org -> shadowdark.crystalcontinuum.org (until there's a hub);
#                     crystalcontinuum.net -> crystalcontinuum.org
#   western-reaches   western-reaches.pages.dev -> shadowdark.crystalcontinuum.org/western-reaches
# The secret check refuses to build if any wiki page contains GM-only material.
# Deploy needs wrangler logged in on this machine.
set -euo pipefail
shopt -s globstar nullglob

SRC="$HOME/obsidian/The Continuum/80_Wiki"
HERE="$(cd "$(dirname "$0")" && pwd)"
SITES=(shadowdark darkspace)
WRANGLER="npx --yes wrangler@4.149.0"

# GM-only terms that must never reach players. Word-boundary, case-insensitive.
# "carbon" can false-positive (e.g. "carbon steel"): reword the page rather than weaken the check.
# Also checks file names, so banner art must not be named after its colour.
BANNED='\b(copper|cobalt|calcite|carbon)\b|shattered crystal|\[!secret\]|^fragment:|02_GM_Secrets|01_Canon|00_System'

fail=0
if hits=$(grep -rniEH --include='*.md' "$BANNED" "$SRC"); then
  echo "REFUSING TO PUBLISH: GM-only material found in 80_Wiki:" >&2
  echo "$hits" | sed "s|$SRC/||" >&2
  fail=1
fi
if names=$(cd "$SRC" && find . -iregex '.*\(copper\|cobalt\|calcite\|carbon\).*'); [ -n "$names" ]; then
  echo "REFUSING TO PUBLISH: GM-only word in a file name:" >&2
  echo "$names" >&2
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
for f in "$SRC"/*; do
  [ -d "$f" ] && [[ " ${SITES[*]} " == *" $(basename "$f") "* ]] && continue
  echo "REFUSING TO PUBLISH: ${f#$SRC/} is not inside a site folder (${SITES[*]})" >&2
  fail=1
done
[ "$fail" -eq 0 ] || exit 1

if todo=$(grep -rnH --include='*.md' 'TBD' "$SRC"); then
  echo "Note: unfinished placeholders (TBD) still on these pages:"
  echo "$todo" | sed "s|$SRC/||;s/^/  /"
fi

rsync -a --delete --exclude='.obsidian' --exclude='.gitkeep' "$SRC/" "$HERE/content/"
cd "$HERE"

if [ "${1:-}" = "--serve" ]; then
  WIKI_SITE="${2:-shadowdark}" npx quartz build --serve -d "content/${2:-shadowdark}" -o "public/${2:-shadowdark}"
  exit
fi

rm -rf public && mkdir -p public
for site in "${SITES[@]}"; do
  WIKI_SITE="$site" npx quartz build -d "content/$site" -o "public/$site"
  # Unlisted for now (Ken, 2026-10-10): keep search engines out.
  printf 'User-agent: *\nDisallow: /\n' > "public/$site/robots.txt"
done

mkdir -p public/crystalcontinuum public/western-reaches
cat > public/crystalcontinuum/_worker.js <<'JS'
export default {
  fetch(req) {
    const u = new URL(req.url)
    if (u.hostname.endsWith("crystalcontinuum.net"))
      return Response.redirect(`https://crystalcontinuum.org${u.pathname}${u.search}`, 301)
    // No hub yet: send the bare domain to the Shadowdark site.
    return Response.redirect(`https://shadowdark.crystalcontinuum.org${u.pathname}${u.search}`, 302)
  },
}
JS
printf '/* https://shadowdark.crystalcontinuum.org/western-reaches 301\n' > public/western-reaches/_redirects
echo "Built ${SITES[*]} + redirects into $HERE/public (robots.txt: noindex)"

if [ "${1:-}" = "--deploy" ]; then
  for project in "${SITES[@]}" crystalcontinuum western-reaches; do
    $WRANGLER pages deploy "public/$project" --project-name "$project" --branch main --commit-dirty=true
  done
fi
