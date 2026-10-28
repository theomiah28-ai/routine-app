#!/bin/sh
# Build and publish dist/ to the gh-pages branch (served by GitHub Pages).
set -e
cd "$(dirname "$0")"
npm test
npm run build
touch dist/.nojekyll
cd dist
git init -q -b gh-pages
git add -A
git commit -qm "Deploy $(date '+%Y-%m-%d %H:%M')"
git push -qf "$(git -C .. remote get-url origin)" gh-pages
rm -rf .git
echo "Deployed → https://theomiah28-ai.github.io/routine-app/"
