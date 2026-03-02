#!/bin/bash

# Run this from INSIDE the gate-tracker directory
# cd gate-tracker  →  then  bash create-structure.sh

# Create missing directories
mkdir -p supabase
mkdir -p src/types
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/components
mkdir -p src/pages

# Create missing files (touch is safe — skips already existing ones)
touch supabase/schema.sql

touch src/types/index.ts

touch src/lib/constants.ts
touch src/lib/utils.ts
# src/lib/supabase.ts already exists ✓

touch src/hooks/useAuth.ts
touch src/hooks/useProgress.ts

touch src/components/DaysLeft.tsx
touch src/components/MiniCalendar.tsx
touch src/components/ProgressModal.tsx
touch src/components/SubjectCard.tsx

touch src/pages/Login.tsx
touch src/pages/Dashboard.tsx

echo "✅ Missing files and folders created!"
echo ""
echo "📁 src/ structure:"
find src -type f | sort | sed 's|[^/]*/|  |g'
echo ""
echo "📁 supabase/"
find supabase -type f | sort | sed 's|[^/]*/|  |g'