mkdir -p supabase
mkdir -p src/types
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/components
mkdir -p src/pages
touch supabase/schema.sql

touch src/types/index.ts

touch src/lib/constants.ts
touch src/lib/utils.ts
# src/lib/supabase.ts

touch src/hooks/useAuth.ts
touch src/hooks/useProgress.ts

touch src/components/DaysLeft.tsx
touch src/components/MiniCalendar.tsx
touch src/components/ProgressModal.tsx
touch src/components/SubjectCard.tsx

touch src/pages/Login.tsx
touch src/pages/Dashboard.tsx

echo "Missing files and folders created!"
echo ""
echo "src/ structure:"
find src -type f | sort | sed 's|[^/]*/|  |g'
echo ""
echo "supabase/"
find supabase -type f | sort | sed 's|[^/]*/|  |g'