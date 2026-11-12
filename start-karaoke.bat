@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Shora Line — Домашняя караоке-система

cd /d "%~dp0"

echo ============================================================
echo   Shora Line - домашняя караоке-система
echo ------------------------------------------------------------

if not exist ".env" if exist ".env.example" copy ".env.example" ".env" >nul

set "PORT=3000"
if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if /i "%%A"=="PORT" (
      set "RAW_PORT=%%B"
      set "RAW_PORT=!RAW_PORT: =!"
      if not "!RAW_PORT!"=="" set "PORT=!RAW_PORT!"
    )
  )
)

rem --- 1. Поиск Node.js и npm ---
call :find_node
if errorlevel 1 goto :no_node

for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
echo [OK] Node.js: %NODE_VER%

rem --- 2. Определение локального IPv4-адреса ---
set "LAN_IP="
set "IF_IDX="
set "PS_ROUTE=Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue | Sort-Object RouteMetric | Select-Object -First 1 -ExpandProperty InterfaceIndex"
for /f "usebackq delims=" %%x in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "!PS_ROUTE!" 2^>nul`) do (
  if "!IF_IDX!"=="" set "IF_IDX=%%x"
)

if defined IF_IDX (
  set "PS_IFIP=Get-NetIPAddress -InterfaceIndex !IF_IDX! -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress"
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "!PS_IFIP!" 2^>nul`) do (
    if "!LAN_IP!"=="" set "LAN_IP=%%i"
  )
)

if "%LAN_IP%"=="" (
  set "PS_ANYIP=Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notlike '*Loopback*' -and $_.InterfaceAlias -notlike '*vEthernet*' } | Select-Object -First 1 -ExpandProperty IPAddress"
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "!PS_ANYIP!" 2^>nul`) do (
    if "!LAN_IP!"=="" set "LAN_IP=%%i"
  )
)

if "%LAN_IP%"=="" (
  set "JS_IP=const os=require('os'),n=os.networkInterfaces();let p='';for(const k of Object.keys(n))for(const x of n[k]||[])if(x.family==='IPv4'&&!x.internal&&!x.address.startsWith('169.254.'))if(x.address.startsWith('192.168.')||!p)p=x.address;console.log(p||'127.0.0.1')"
  for /f "usebackq delims=" %%i in (`node -e "!JS_IP!" 2^>nul`) do (
    if "!LAN_IP!"=="" set "LAN_IP=%%i"
  )
)

if "%LAN_IP%"=="" set "LAN_IP=127.0.0.1"

echo.
echo  Этот компьютер:    http://%LAN_IP%:%PORT%
echo  Локально:          http://127.0.0.1:%PORT%
echo  Телевизор/телефон: введите адрес выше в браузере ТВ
echo  Режим ТВ:          http://%LAN_IP%:%PORT%/tv
echo  Пульт:             http://%LAN_IP%:%PORT%/remote
echo  Админ-панель:      http://%LAN_IP%:%PORT%/admin
echo  Локальный DNS:     http://karaoke.home.arpa:%PORT%
echo.
echo  Остановка - Ctrl+C или scripts\stop-karaoke.bat
echo ------------------------------------------------------------

rem --- 3. Установка зависимостей при первом запуске ---
if exist "node_modules" goto :deps_ok
echo [SETUP] Установка зависимостей Node.js...
call npm install
if errorlevel 1 (
  echo [ERROR] Ошибка при выполнении npm install.
  pause
  exit /b 1
)
:deps_ok

rem --- 4. Сборка Next.js при первом запуске ---
if exist ".next" goto :build_ok
echo [BUILD] Сборка production-версии Shora Line...
call npm run build
if errorlevel 1 (
  echo [ERROR] Ошибка сборки приложения.
  pause
  exit /b 1
)
:build_ok

rem --- 5. Проверка доступности PostgreSQL ---
call :check_postgres
if not errorlevel 1 goto :pg_ok

echo.
echo [WARN] PostgreSQL недоступен по адресу из .env ^(по умолчанию 127.0.0.1:5432^).
where docker >nul 2>&1
if errorlevel 1 goto :pg_fail

echo [INFO] Обнаружен Docker. Попытка запуска контейнера PostgreSQL...
docker compose up -d postgres >nul 2>&1
timeout /t 4 /nobreak >nul
call :check_postgres
if not errorlevel 1 goto :pg_ok

:pg_fail
echo [ERROR] База данных PostgreSQL не отвечает.
echo         1^) Запустите службу PostgreSQL ^(services.msc^),
echo         2^) либо используйте Docker Desktop: docker compose up -d --build
echo         3^) проверьте DATABASE_URL в файле .env
pause
exit /b 1

:pg_ok
echo [DB] Проверка схемы базы данных...
call npx drizzle-kit push --force
if errorlevel 1 (
  echo [ERROR] Не удалось применить схему базы данных. Проверьте DATABASE_URL в .env.
  pause
  exit /b 1
)

echo [START] Сервер запускается на порту %PORT% ^(доступен в домашней сети^)...
call npx next start -H 0.0.0.0 -p %PORT%
pause
exit /b 0

rem ============================================================
rem Подпрограмма поиска Node.js и npm
rem ============================================================
:find_node
where node >nul 2>&1
if not errorlevel 1 (
  where npm.cmd >nul 2>&1
  if not errorlevel 1 exit /b 0
)

rem Обновляем PATH из системного и пользовательского реестра Windows
set "PS_REGPATH=[Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')"
for /f "usebackq delims=" %%p in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "!PS_REGPATH!" 2^>nul`) do (
  if not "%%p"=="" set "PATH=%%p;!PATH!"
)

where node >nul 2>&1
if not errorlevel 1 (
  where npm.cmd >nul 2>&1
  if not errorlevel 1 exit /b 0
)

rem Проверяем стандартные папки установки Node.js на Windows
call :try_node_dir "%~dp0node"
if not errorlevel 1 exit /b 0

call :try_node_dir "%ProgramFiles%\nodejs"
if not errorlevel 1 exit /b 0

call :try_node_dir "%ProgramFiles(x86)%\nodejs"
if not errorlevel 1 exit /b 0

call :try_node_dir "%LocalAppData%\Programs\nodejs"
if not errorlevel 1 exit /b 0

if defined NVM_SYMLINK (
  call :try_node_dir "%NVM_SYMLINK%"
  if not errorlevel 1 exit /b 0
)

if exist "%AppData%\nvm" (
  for /d %%d in ("%AppData%\nvm\v*") do (
    call :try_node_dir "%%~d"
    if not errorlevel 1 exit /b 0
  )
)

call :try_node_dir "%UserProfile%\.volta\bin"
if not errorlevel 1 exit /b 0

call :try_node_dir "%LocalAppData%\Volta\bin"
if not errorlevel 1 exit /b 0

call :try_node_dir "%UserProfile%\scoop\apps\nodejs\current"
if not errorlevel 1 exit /b 0

call :try_node_dir "%UserProfile%\scoop\shims"
if not errorlevel 1 exit /b 0

call :try_node_dir "%ProgramData%\chocolatey\bin"
if not errorlevel 1 exit /b 0

exit /b 1

:try_node_dir
set "CAND=%~1"
if "%CAND%"=="" exit /b 1
if not exist "%CAND%\node.exe" exit /b 1
set "PATH=%CAND%;%AppData%\npm;!PATH!"
where npm.cmd >nul 2>&1
if not errorlevel 1 exit /b 0
if exist "%CAND%\npm.cmd" exit /b 0
exit /b 1

:check_postgres
set "JS_PG=const fs=require('fs'),net=require('net');let url=process.env.DATABASE_URL||'';if(!url&&fs.existsSync('.env')){const m=fs.readFileSync('.env','utf8').match(/^DATABASE_URL=(.+)$/m);if(m)url=m[1].trim();}if(!url)process.exit(1);let u;try{u=new URL(url);}catch{process.exit(1);}const host=u.hostname||'127.0.0.1',port=Number(u.port)||5432;const s=net.createConnection({host,port,timeout:2000});s.on('connect',()=>{s.destroy();process.exit(0);});s.on('error',()=>process.exit(1));s.on('timeout',()=>{s.destroy();process.exit(1);});"
node -e "!JS_PG!" >nul 2>&1
exit /b %errorlevel%

:no_node
echo.
echo [ERROR] Node.js и npm не найдены в системе Windows.
echo         Проверены системный PATH, реестр, Program Files, AppData, nvm, volta и scoop.
echo.
where docker >nul 2>&1
if errorlevel 1 goto :offer_winget

echo [INFO] Обнаружен Docker! Можно запустить Shora Line в контейнере без установки Node.js.
choice /C YN /M "Запустить Shora Line через Docker Desktop прямо сейчас?"
if errorlevel 2 goto :offer_winget
docker compose up -d --build
echo.
echo [OK] Запущено в Docker. Откройте http://127.0.0.1:%PORT%
pause
exit /b 0

:offer_winget
where winget >nul 2>&1
if errorlevel 1 goto :manual_help

echo Вы можете установить Node.js LTS автоматически через winget ^(встроен в Windows^).
choice /C YN /M "Установить Node.js LTS сейчас?"
if errorlevel 2 goto :manual_help
echo [SETUP] Установка OpenJS.NodeJS.LTS через winget...
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
call :find_node
if not errorlevel 1 (
  echo [OK] Node.js успешно установлен! Запуск Shora Line...
  echo.
  call "%~f0"
  exit /b %errorlevel%
)

:manual_help
echo Как исправить:
echo   1. Скачайте и установите Node.js LTS ^(v22^) с https://nodejs.org/
echo      ^(при установке отметьте галочку "Add to PATH"^)
echo   2. Если вы только что установили Node.js, закройте это окно,
echo      при необходимости перезагрузите ПК и запустите start-karaoke.bat снова.
echo   3. Либо установите Docker Desktop и выполните: docker compose up -d --build
echo.
pause
exit /b 1
