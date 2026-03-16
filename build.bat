@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: =======================================
:: 1. AUTO ELEVATE TO ADMIN
:: =======================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    set "SCRIPT_PATH=%~f0"
    set "SCRIPT_DIR=%~dp0"
    echo Set objShell = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo objShell.ShellExecute "%~f0", "", "%~dp0", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B
)

:: Change to script directory
cd /d "%~dp0"

set "LOG_FILE=%~dp0build_log.txt"
type nul > "!LOG_FILE!"

color 0B
title NanKill Modded - Build Script

call :LOG "========================================================"
call :LOG "       GLASSY MUSIC (NANKILL MODDED) COMPILER"
call :LOG "========================================================"
call :LOG ""
call :LOG "========================================================"
call :LOG "[*] Checking required tools (NodeJS, Git, PNPM) silently..."
call :LOG "========================================================"
call :LOG ""

:: =======================================
:: 2. CHECK DEPENDENCIES
:: =======================================
set "NEED_NODE="
set "NEED_GIT="
set "NEED_PNPM="
set "MISSING="

where node >nul 2>&1 || set "NEED_NODE=1"
where git >nul 2>&1 || set "NEED_GIT=1"
where pnpm >nul 2>&1 || set "NEED_PNPM=1"

if defined NEED_NODE set "MISSING=1"
if defined NEED_GIT set "MISSING=1"
if defined NEED_PNPM set "MISSING=1"

:: =======================================
:: 3. BRANCH BASED ON STATUS
:: =======================================
if not defined MISSING goto :ALL_DEPS_MET

:: --- Some deps are missing ---
call :LOG "[-] Some dependencies are missing:"
if defined NEED_NODE call :LOG "    - NodeJS"
if defined NEED_GIT call :LOG "    - Git"
if defined NEED_PNPM call :LOG "    - PNPM"
call :LOG ""

echo Do you want to automatically install the missing dependencies and compile?
echo [Y] YES
echo [N] NO
echo.
set "CHOICE="
set /p "CHOICE=Enter your choice (Y/N): "
if /i not "!CHOICE!"=="Y" goto :USER_CANCEL
goto :DO_INSTALL

:: --- All deps are available ---
:ALL_DEPS_MET
call :LOG "[+] All system requirements (NodeJS, Git, PNPM) are met."
call :LOG ""
echo Do you want to compile the project now?
echo [Y] YES
echo [N] NO
echo.
set "CHOICE="
set /p "CHOICE=Enter your choice (Y/N): "
if /i not "!CHOICE!"=="Y" goto :USER_CANCEL
goto :COMPILE

:: --- User said no ---
:USER_CANCEL
call :LOG "Process canceled by user."
call :SHOW_EXIT
exit /B

:: =======================================
:: 4. INSTALL MISSING DEPENDENCIES
:: =======================================
:DO_INSTALL
call :LOG ""
call :LOG "Please wait, the system is automatically installing missing dependencies..."

set "HAS_WINGET="
where winget >nul 2>&1 && set "HAS_WINGET=1"

if defined HAS_WINGET (
    call :LOG "[*] Winget found. It will be used for installations."
) else (
    call :LOG "[*] Winget is not available. Will download directly from the internet."
)

if defined NEED_NODE call :INSTALL_NODE
if defined NEED_GIT call :INSTALL_GIT

call :LOG ""
call :LOG "[*] Refreshing environment PATH..."
for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path') do set "syspath=%%B"
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "userpath=%%B"
set "PATH=!syspath!;!userpath!;%PROGRAMFILES%\nodejs;%PROGRAMFILES%\Git\cmd;%PATH%"

if defined NEED_PNPM call :INSTALL_PNPM

call :LOG ""
call :LOG "[OK] Dependencies installation completed."

:: =======================================
:: 5. VERIFY DEPENDENCIES AFTER INSTALL
:: =======================================
call :LOG ""
call :LOG "[*] Verifying installed dependencies..."

set "VFAIL="
where node >nul 2>&1 || (
    call :LOG "[FAIL] NodeJS is still not available after installation."
    set "VFAIL=1"
)
where git >nul 2>&1 || (
    call :LOG "[FAIL] Git is still not available after installation."
    set "VFAIL=1"
)
where pnpm >nul 2>&1 || (
    call :LOG "[FAIL] PNPM is still not available after installation."
    set "VFAIL=1"
)

if defined VFAIL goto :VERIFY_FAILED

call :LOG "[OK] All dependencies verified successfully."
goto :COMPILE

:VERIFY_FAILED
call :LOG ""
call :LOG "[ERROR] Some dependencies could not be installed."
call :LOG "Please install them manually, then restart the script."
call :LOG "A detailed log has been saved to: !LOG_FILE!"
call :SHOW_EXIT
exit /B 1

:: =======================================
:: 6. COMPILE
:: =======================================
:COMPILE
call :LOG ""
call :LOG "========================================================"
call :LOG "STEP: COMPILING WINDOWS APP"
call :LOG "========================================================"

if exist "package.json" goto :SKIP_CLONE

set "REPO_DIR=glassy-music"

if exist "!REPO_DIR!\package.json" goto :REPO_EXISTS

:: Repo chua co, clone moi
call :LOG ""
call :LOG "Source code not found, cloning repository..."
if not exist "!REPO_DIR!" (
    call :RUN_AND_LOG git clone https://github.com/NanKillBro/glassy-music-nankill
)
if not exist "!REPO_DIR!\package.json" goto :CLONE_FAILED
call :LOG "[OK] Repository cloned successfully."
goto :ENTER_REPO

:REPO_EXISTS
:: Repo da co, pull update moi nhat
call :LOG ""
call :LOG "[*] Repository found. Pulling latest updates..."
pushd "!REPO_DIR!"
call :RUN_AND_LOG git pull origin master
popd
call :LOG "[OK] Repository updated."
goto :ENTER_REPO

:ENTER_REPO
call :LOG "[*] Entering !REPO_DIR! folder..."
cd /d "!REPO_DIR!"
set "LOG_FILE=%cd%\..\build_log.txt"
goto :SKIP_CLONE

:CLONE_FAILED
call :LOG "[ERROR] Failed to clone repository."
call :LOG "A detailed log has been saved to: !LOG_FILE!"
call :SHOW_EXIT
exit /B 1

:SKIP_CLONE
call :LOG ""
call :LOG "Installing project Node modules (pnpm install)..."
call :LOG "This process may take a few minutes, please wait. Check build_log.txt for details..."
call :RUN_AND_LOG pnpm install --frozen-lockfile

:: Verify node_modules was created
if not exist "node_modules" goto :PNPM_FAILED
goto :PNPM_OK

:PNPM_FAILED
call :LOG "[ERROR] pnpm install failed. Check build_log.txt for details."
call :SHOW_EXIT
exit /B 1

:PNPM_OK
call :LOG ""
echo Choose build architecture:
echo [1] x64 only (faster)
echo [2] x64 + arm64 (full)
echo.
set "ARCH_CHOICE="
set /p "ARCH_CHOICE=Enter your choice (1/2): "

if "!ARCH_CHOICE!"=="1" (
    set "BUILD_CMD=pnpm dist:win:x64"
    call :LOG "[*] Build target: x64 only"
) else (
    set "BUILD_CMD=pnpm dist:win"
    call :LOG "[*] Build target: x64 + arm64"
)

call :LOG ""
call :LOG "Building Windows App (!BUILD_CMD!)..."
call :LOG "This process may take a few minutes, please wait. Check build_log.txt for details..."
call :LOG ""
call :RUN_AND_LOG !BUILD_CMD!

:: Verify pack folder was created
if not exist "pack" goto :BUILD_FAILED
goto :BUILD_OK

:BUILD_FAILED
call :LOG "[ERROR] Build failed. Check build_log.txt for details."
call :SHOW_EXIT
exit /B 1

:BUILD_OK
call :LOG ""
call :LOG "========================================================"
call :LOG "BUILD PROCESS COMPLETED SUCCESSFULLY."
call :LOG "========================================================"
call :LOG "The build file has been generated in the 'glassy-music/pack' folder."
call :LOG "A detailed log has been saved to: !LOG_FILE!"
call :SHOW_EXIT
exit /B 0

:: =======================================
:: SUBROUTINES
:: =======================================

:LOG
set "MSG=%~1"
if "!MSG!"=="" (
    echo.
    echo. >> "!LOG_FILE!"
) else (
    echo !MSG!
    echo [%TIME%] !MSG! >> "!LOG_FILE!"
)
exit /B

:RUN_AND_LOG
echo [%TIME%] Running command: %* >> "!LOG_FILE!"
call %* >> "!LOG_FILE!" 2>&1
exit /B

:SHOW_EXIT
call :LOG ""
echo.
echo Press any key to exit...
pause >nul
exit /B

:INSTALL_NODE
call :LOG ""
call :LOG "> Installing NodeJS..."
if defined HAS_WINGET (
    call :RUN_AND_LOG winget install OpenJS.NodeJS -e --accept-package-agreements --accept-source-agreements
) else (
    call :RUN_AND_LOG powershell -Command "Write-Host 'Downloading NodeJS...'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v24.14.0/node-v24.14.0-x64.msi' -OutFile '%temp%\nodejs.msi'"
    call :RUN_AND_LOG msiexec /i "%temp%\nodejs.msi" /quiet /norestart
)
exit /B

:INSTALL_GIT
call :LOG ""
call :LOG "> Installing Git..."
if defined HAS_WINGET (
    call :RUN_AND_LOG winget install Git.Git -e --accept-package-agreements --accept-source-agreements
) else (
    call :RUN_AND_LOG powershell -Command "Write-Host 'Downloading Git...'; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.53.0.windows.2/Git-2.53.0.2-64-bit.exe' -OutFile '%temp%\git.exe'"
    call :RUN_AND_LOG "%temp%\git.exe" /VERYSILENT /NORESTART
)
exit /B

:INSTALL_PNPM
call :LOG ""
call :LOG "> Installing PNPM..."
call :RUN_AND_LOG powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest 'https://get.pnpm.io/install.ps1' -UseBasicParsing | Invoke-Expression"
set "PNPM_HOME=%LOCALAPPDATA%\pnpm"
set "PATH=%LOCALAPPDATA%\pnpm;%LOCALAPPDATA%\pnpm\.tools\pnpm-exe;!PATH!"
exit /B
