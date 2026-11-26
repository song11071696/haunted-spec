#!/usr/bin/env bash
# Re-run the measurement in docs/measured.md: download the 10 public requirement docs (pinned to a commit)
# and lint each one with the CLI. Needs curl, node 18+ and jq.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p corpus
i=0
while read -r url; do
  i=$((i+1))
  raw=$(echo "$url" | sed 's#github.com#raw.githubusercontent.com#; s#/blob/#/#')
  curl -sfL "$raw" -o "corpus/$i.md"
  node ../../bin/haunt.mjs "corpus/$i.md" --json \
    | jq -r --arg u "$url" '"\(.score)\t\(.band)\t\(.findings|length) findings\t\(.stats.hauntedLines)/\(.stats.requirementLines) lines\t\($u)"'
done < sources.txt
