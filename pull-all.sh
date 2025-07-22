#!/bin/bash
BRANCH=$(git branch --show-current)

echo "Current branch: $BRANCH"
echo "Fetching updates from all configured remotes..."

# Fetch from origin
echo "Fetching from origin..."
git fetch origin || { echo "Failed to fetch from origin"; exit 1; }

# Check if upstream remote exists and fetch
if git remote | grep -q upstream; then
    echo "Fetching from upstream..."
    git fetch upstream || { echo "Failed to fetch from upstream"; exit 1; }
    
    # Determine which branch to merge from upstream
    if git ls-remote --heads upstream main | grep -q main; then
        UPSTREAM_BRANCH="main"
    elif git ls-remote --heads upstream master | grep -q master; then
        UPSTREAM_BRANCH="master"
    else
        echo "Neither 'main' nor 'master' branch found in upstream repository."
        UPSTREAM_BRANCH=""
    fi
    
    if [ -n "$UPSTREAM_BRANCH" ]; then
        echo "Merging upstream/$UPSTREAM_BRANCH into local $BRANCH..."
        if [ "$#" -eq 0 ]; then
            git merge upstream/$UPSTREAM_BRANCH
        else
            git merge upstream/$UPSTREAM_BRANCH -m "$1"
        fi
    fi
else
    echo "upstream remote not configured, skipping upstream fetch"
fi

# Check if public remote exists and fetch
if git remote | grep -q public; then
    echo "Fetching from public..."
    git fetch public || { echo "Failed to fetch from public"; exit 1; }
    
    echo "Merging public/$BRANCH into local $BRANCH..."
    if [ "$#" -eq 0 ]; then
        git merge public/$BRANCH
    else
        git merge public/$BRANCH -m "$1"
    fi
else
    echo "public remote not configured, skipping public fetch"
fi

echo "Pull completed successfully!"
echo "You may now push these changes using ./push-all.sh"
