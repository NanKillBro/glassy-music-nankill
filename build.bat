@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: =======================================
:: 1. AUTO ELEVATE TO ADMIN
:: =======================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B
)

:: Change to script directory
cd /d "%~dp0"

set "LOG_FILE=%~dp0build_log.txt"
:: Clear old log
type nul > "!LOG_FILE!"

color 0B
title NanKill Modded - Build Script

call :LOG "========================================================"
call :LOG "       YOUTUBE MUSIC (NANKILL MODDED) COMPILER"
call :LOG "========================================================"
call :LOG ""
call :LOG "========================================================"
call :LOG "[*] Checking required tools (NodeJS, Git, PNPM) silently..."
call :LOG "========================================================"
call :LOG ""

:: =======================================
:: 2. CHECK & INSTALL DEPENDENCIES
:: =======================================
set "MISSING_DEPS=0"
set "NEED_NODE=0"
set "NEED_GIT=0"
set "NEED_PNPM=0"

where node >nul 2>&1
if %errorLevel% neq 0 (
    set "MISSING_DEPS=1"
    set "NEED_NODE=1"
)

where git >nul 2>&1
if %errorLevel% neq 0 (
    set "MISSING_DEPS=1"
    set "NEED_GIT=1"
)

where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    set "MISSING_DEPS=1"
    set "NEED_PNPM=1"
)

if "!MISSING_DEPS!"=="0" (
    call :LOG "[+] All system requirements (NodeJS, Git, PNPM) are met."
    echo.
    echo Do you want to compile the project now?
    echo [Y] YES
    echo [N] NO
    echo.
    set /p "CHOICE=Enter your choice (Y/N): "
    if /i "!CHOICE!" neq "Y" (
        if /i "!CHOICE!" neq "y" (
            call :LOG "Process canceled by user."
            timeout /t 2 >nul
            exit /B
        )
    )
) else (
    call :LOG "[-] Some dependencies are missing:"
    if "!NEED_NODE!"=="1" call :LOG "    - NodeJS"
    if "!NEED_GIT!"=="1" call :LOG "    - Git"
    if "!NEED_PNPM!"=="1" call :LOG "    - PNPM"
    
    echo.
    echo Do you want to automatically install the missing dependencies and compile?
    echo [Y] YES
    echo [N] NO
    echo.
    set /p "CHOICE=Enter your choice (Y/N): "
    if /i "!CHOICE!" neq "Y" (
        if /i "!CHOICE!" neq "y" (
            call :LOG "Process canceled by user."
            timeout /t 2 >nul
            exit /B
        )
    )
    
    call :LOG ""
    call :LOG "Please wait, the system is automatically installing missing dependencies..."
    
    where winget >nul 2>&1
    if !errorLevel! equ 0 (
        set "HAS_WINGET=1"
        call :LOG "[*] Winget found. It will be used for installations."
    ) else (
        set "HAS_WINGET=0"
        call :LOG "[*] Winget is not available. Will download directly from the internet."
    )

    if "!NEED_NODE!"=="1" (
        call :LOG ""
        call :LOG "> Installing NodeJS..."
        if "!HAS_WINGET!"=="1" (
            call :RUN_AND_LOG winget install OpenJS.NodeJS -e --accept-package-agreements --accept-source-agreements
        ) else (
            call :RUN_AND_LOG powershell -Command "Write-Host 'Downloading NodeJS...'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v24.14.0/node-v24.14.0-x64.msi' -OutFile '%temp%\nodejs.msi'"
            call :RUN_AND_LOG msiexec /i "%temp%\nodejs.msi" /quiet /norestart
        )
    )

    if "!NEED_GIT!"=="1" (
        call :LOG ""
        call :LOG "> Installing Git..."
        if "!HAS_WINGET!"=="1" (
            call :RUN_AND_LOG winget install Git.Git -e --accept-package-agreements --accept-source-agreements
        ) else (
            call :RUN_AND_LOG powershell -Command "Write-Host 'Downloading Git...'; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.53.0.windows.2/Git-2.53.0.2-64-bit.exe' -OutFile '%temp%\git.exe'"
            call :RUN_AND_LOG "%temp%\git.exe" /VERYSILENT /NORESTART
        )
    )
    
    call :LOG ""
    call :LOG "[*] Refreshing environment PATH..."
    for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path') do set "syspath=%%B"
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "userpath=%%B"
    set "PATH=!syspath!;!userpath!;%PROGRAMFILES%\nodejs;%PROGRAMFILES%\Git\cmd;%PATH%"

    if "!NEED_PNPM!"=="1" (
        call :LOG ""
        call :LOG "> Installing PNPM..."
        call :RUN_AND_LOG powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest 'https://get.pnpm.io/install.ps1' -UseBasicParsing | Invoke-Expression"
        set "PATH=%LOCALAPPDATA%\pnpm;!PATH!"
    )
    
    call :LOG ""
    call :LOG "[OK] Dependencies installation completed."
)

call :LOG ""
call :LOG "========================================================"
call :LOG "STEP 3: COMPILING WINDOWS APP"
call :LOG "========================================================"
if not exist "package.json" (
    call :LOG "Source code not found, cloning repository..."
    call :RUN_AND_LOG git clone https://git.nankill.xyz/nankill/youtube-music-nankill .
)

call :LOG ""
call :LOG "Installing project Node modules (pnpm install)..."
call :RUN_AND_LOG pnpm install --frozen-lockfile

call :LOG ""
call :LOG "Building Windows App (pnpm dist:win)..."
call :LOG "This process may take a few minutes, please wait. Check build_log.txt for details..."
call :LOG ""
call :RUN_AND_LOG pnpm dist:win

call :LOG ""
call :LOG "========================================================"
call :LOG "BUILD PROCESS COMPLETED."
call :LOG "========================================================"
call :LOG "The installation file has been generated in the 'dist' folder."
call :LOG "A detailed log has been saved to: !LOG_FILE!"
call :LOG ""
echo Press any key to exit...
pause >nul
exit /B

:: =======================================
:: FUNCTIONS
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
