#!/bin/bash
BRANCH=$(git branch --show-current)
echo "Pushing to origin/$BRANCH..."
git push origin $BRANCH
echo "Pushing to upstream/$BRANCH..."
git push upstream $BRANCH
