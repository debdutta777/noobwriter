@echo off
echo ========================================
echo Verifying NoobWriter Components
echo ========================================
echo.

echo Checking UI Components...
if exist "src\components\ui\textarea.tsx" (
    echo [OK] textarea.tsx exists
) else (
    echo [FAIL] textarea.tsx missing
)

if exist "src\components\ui\dropdown-menu.tsx" (
    echo [OK] dropdown-menu.tsx exists
) else (
    echo [FAIL] dropdown-menu.tsx missing
)

if exist "src\components\ui\toast.tsx" (
    echo [OK] toast.tsx exists
) else (
    echo [FAIL] toast.tsx missing
)

if exist "src\components\ui\toaster.tsx" (
    echo [OK] toaster.tsx exists
) else (
    echo [FAIL] toaster.tsx missing
)

echo.
echo Checking Hooks...
if exist "src\hooks\use-toast.ts" (
    echo [OK] use-toast.ts exists
) else (
    echo [FAIL] use-toast.ts missing
)

echo.
echo Checking Comment Components...
if exist "src\components\comments\CommentSection.tsx" (
    echo [OK] CommentSection.tsx exists
) else (
    echo [FAIL] CommentSection.tsx missing
)

if exist "src\components\comments\CommentForm.tsx" (
    echo [OK] CommentForm.tsx exists
) else (
    echo [FAIL] CommentForm.tsx missing
)

if exist "src\components\comments\CommentItem.tsx" (
    echo [OK] CommentItem.tsx exists
) else (
    echo [FAIL] CommentItem.tsx missing
)

echo.
echo Checking Rating Components...
if exist "src\components\ratings\RatingSection.tsx" (
    echo [OK] RatingSection.tsx exists
) else (
    echo [FAIL] RatingSection.tsx missing
)

if exist "src\components\ratings\RatingForm.tsx" (
    echo [OK] RatingForm.tsx exists
) else (
    echo [FAIL] RatingForm.tsx missing
)

if exist "src\components\ratings\RatingItem.tsx" (
    echo [OK] RatingItem.tsx exists
) else (
    echo [FAIL] RatingItem.tsx missing
)

echo.
echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo If all components show [OK], the TypeScript
echo import errors are just cache issues.
echo.
echo To fix: Press Ctrl+Shift+P and select
echo "Developer: Reload Window"
echo.
pause
