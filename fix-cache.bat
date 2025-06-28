@echo off
echo Fixing Vite cache issues...

echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul

echo Clearing Vite cache...
if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite"
    echo Vite cache cleared.
) else (
    echo Vite cache not found.
)

echo Clearing npm cache...
npm cache clean --force

echo Starting dev server...
npm run dev

pause
