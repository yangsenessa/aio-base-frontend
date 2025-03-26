#!/bin/bash
BRANCH=$(git branch --show-current)
echo "Fetching from upstream..."
git fetch upstream
echo "Merging upstream/$BRANCH into local $BRANCH..."
git merge upstream/$BRANCH
echo "Pull complete. You may now push these changes to both repositories using ./push-all.sh"
