@echo off
chcp 65001 >nul
echo ========================================
echo        每日待办事项 - 启动程序
echo ========================================
echo.

echo [1/3] 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

echo [2/3] 安装后端依赖...
cd /d "%~dp0"
pip install -r backend/requirements.txt -q
echo ✅ 后端依赖安装完成

echo [3/3] 启动后端服务 (端口 8000)...
start "Todo Backend" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --reload --port 8000"

echo.
echo ========================================
echo  后端已启动: http://localhost:8000
echo  API 文档: http://localhost:8000/docs
echo ========================================
echo.
echo 正在检查前端...
cd /d "%~dp0frontend"

where node >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请安装 Node.js 18+
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 安装前端依赖 (首次运行需要一点时间)...
    call npm install
)

echo 启动前端开发服务器 (端口 5173)...
start "Todo Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo  前端已启动: http://localhost:5173
echo  请在浏览器打开上方地址
echo ========================================
pause
