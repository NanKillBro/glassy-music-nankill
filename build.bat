@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: =======================================
:: STATUS CODE REFERENCE
:: =======================================
:: Each step in the script is assigned a unique Status Code (SC).
:: SC is only logged to build_log.txt, NOT displayed on the screen.
:: Used for tracking the flow and debugging when reviewing the log.
::
:: --- INIT (SC-001 ~ SC-004) ---
:: SC-001  : Script started
:: SC-002  : Admin privileges confirmed
:: SC-003  : Working directory
:: SC-004  : Log file initialized
::
:: --- DEPENDENCY CHECK (SC-010 ~ SC-019) ---
:: SC-010  : Begin dependency check phase
:: SC-011  : Check NodeJS
:: SC-012  : Check Git
:: SC-013  : Check PNPM
:: SC-014  : Dependency check result
:: SC-015  : All dependencies found
:: SC-016  : Some dependencies missing
:: SC-017  : Displaying install prompt
:: SC-018  : User input for install prompt
:: SC-019  : User accepted install
::
:: --- ALL DEPS MET (SC-020 ~ SC-023) ---
:: SC-020  : Entered ALL_DEPS_MET
:: SC-021  : Displaying compile prompt
:: SC-022  : User input for compile prompt
:: SC-023  : User accepted compile
::
:: --- INSTALL DEPENDENCIES (SC-030 ~ SC-039) ---
:: SC-030  : Entered DO_INSTALL
:: SC-031  : Winget check
:: SC-032  : Calling INSTALL_NODE
:: SC-033  : INSTALL_NODE returned
:: SC-034  : Calling INSTALL_GIT
:: SC-035  : INSTALL_GIT returned
:: SC-036  : Calling INSTALL_PNPM
:: SC-037  : INSTALL_PNPM returned
:: SC-038  : All dependency installations completed
:: SC-039  : Displaying restart notice
::
:: --- COMPILE: CLONE/PULL (SC-040 ~ SC-04D) ---
:: SC-040  : Entered COMPILE
:: SC-041  : package.json found, skip clone
:: SC-042  : package.json not found
:: SC-043  : Repo dir exists, branch to REPO_EXISTS
:: SC-044  : Repo not found, starting clone
:: SC-045  : Running git clone
:: SC-046  : git clone finished
:: SC-047  : Clone verified successfully
:: SC-048  : Entered REPO_EXISTS
:: SC-049  : Running git pull
:: SC-04A  : git pull finished
:: SC-04B  : Entering repo directory
:: SC-04C  : Log file path updated
:: SC-04D  : Clone FAILED
:: SC-04E  : Clone attempt 1 failed, deleting dir for retry
:: SC-04F  : Delete failed, cannot retry clone
:: SC-04G  : Clone attempt 2 (retry)
::
:: --- COMPILE: PNPM INSTALL (SC-050 ~ SC-058) ---
:: SC-050  : Entered SKIP_CLONE, starting pnpm install
:: SC-051  : Running pnpm install
:: SC-052  : pnpm install finished
:: SC-053  : Checking pnpm install exit code
:: SC-054  : pnpm install verified OK (exit code 0)
:: SC-055  : pnpm install FAILED
:: SC-056  : pnpm install OK, displaying arch prompt
:: SC-057  : User input for arch prompt
:: SC-058  : pnpm install attempt 1 failed, retrying
::
:: --- COMPILE: BUILD (SC-060 ~ SC-066) ---
:: SC-060  : Build target: x64 only
:: SC-061  : Build target: x64 + arm64
:: SC-062  : Running build command
:: SC-063  : Build command finished
:: SC-064  : Checking pack folder
:: SC-065  : pack folder verified OK
:: SC-066  : Build FAILED
::
:: --- FINISH (SC-070 ~ SC-071) ---
:: SC-070  : Build completed successfully
:: SC-071  : Script finishing normally
::
:: --- INSTALL SUBROUTINES (SC-I01 ~ SC-I23) ---
:: SC-I01  : INSTALL_NODE started
:: SC-I02  : Installing NodeJS via winget
:: SC-I03  : Downloading NodeJS MSI
:: SC-I04  : Running NodeJS MSI installer
:: SC-I05  : INSTALL_NODE finished
:: SC-I10  : INSTALL_GIT started
:: SC-I11  : Installing Git via winget
:: SC-I12  : Downloading Git installer
:: SC-I13  : Running Git silent installer
:: SC-I14  : INSTALL_GIT finished
:: SC-I20  : INSTALL_PNPM started
:: SC-I21  : Running PNPM install script
:: SC-I22  : PNPM PATH updated
:: SC-I23  : INSTALL_PNPM finished
::
:: --- SPECIAL CODES ---
:: SC-RUN  : Executing command
:: SC-RET  : Command exit code
:: SC-EXIT : Showing exit prompt
:: SC-099  : Process canceled by user
::
:: --- DEBUG MARKERS (DBG-xxx) ---
:: DBG-000  : Log file cleared, starting fresh
:: DBG-020  : ALL_DEPS_MET reached
:: DBG-050  : SKIP_CLONE reached
:: DBG-051a : Before RUN_AND_LOG pnpm install attempt 1
:: DBG-051b : After RUN_AND_LOG returned, CMD_EXIT
:: DBG-051c : Before RUN_AND_LOG pnpm install attempt 2
:: DBG-051d : After RUN_AND_LOG returned (attempt 2), CMD_EXIT
:: DBG-055  : Both attempts failed, going to PNPM_FAILED
:: DBG-071  : About to SHOW_EXIT and terminate
:: DBG-072  : After SHOW_EXIT, about to exit /B 0
:: DBG-073  : !!! THIS SHOULD NEVER APPEAR - exit /B 0 failed !!!
:: DBG-RUN-A: About to call command
:: DBG-RUN-B: call returned, errorlevel
:: DBG-RUN-C: About to exit /B from RUN_AND_LOG
:: =======================================

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
echo [%TIME%] [DBG-000] Log file cleared, starting fresh >> "!LOG_FILE!"

color 0B
title Glassy Music - Build Script


call :SC "SC-001" "Script started"
call :SC "SC-002" "Admin privileges confirmed"
call :SC "SC-003" "Working directory: %~dp0"
call :SC "SC-004" "Log file initialized: !LOG_FILE!"

call :LOG "========================================================"
call :LOG "       GLASSY MUSIC COMPILER"
call :LOG "========================================================"
call :LOG ""

call :SC "SC-010" "Begin dependency check phase"

call :LOG "========================================================"
call :LOG "[*] Checking required tools (NodeJS, Git, PNPM)..."
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
call :SC "SC-011" "Check NodeJS: NEED_NODE=!NEED_NODE!"
where git >nul 2>&1 || set "NEED_GIT=1"
call :SC "SC-012" "Check Git: NEED_GIT=!NEED_GIT!"
where pnpm >nul 2>&1 || set "NEED_PNPM=1"
call :SC "SC-013" "Check PNPM: NEED_PNPM=!NEED_PNPM!"

if defined NEED_NODE set "MISSING=1"
if defined NEED_GIT set "MISSING=1"
if defined NEED_PNPM set "MISSING=1"

call :SC "SC-014" "Dependency check result: MISSING=!MISSING!"

:: =======================================
:: 3. BRANCH BASED ON STATUS
:: =======================================
if not defined MISSING (
    call :SC "SC-015" "All dependencies found, branching to ALL_DEPS_MET"
    goto :ALL_DEPS_MET
)
call :SC "SC-016" "Some dependencies missing, branching to install prompt"

:: --- Some deps are missing ---
call :LOG "[-] Some dependencies are missing:"
if defined NEED_NODE call :LOG "    - NodeJS"
if defined NEED_GIT call :LOG "    - Git"
if defined NEED_PNPM call :LOG "    - PNPM"
call :LOG ""

call :SC "SC-017" "Displaying install prompt to user"
echo Do you want to automatically install the missing dependencies and compile?
echo [Y] YES
echo [N] NO
echo.
set "CHOICE="
set /p "CHOICE=Enter your choice (Y/N): "
call :SC "SC-018" "User input for install prompt: !CHOICE!"
if /i not "!CHOICE!"=="Y" goto :USER_CANCEL
call :SC "SC-019" "User accepted install, branching to DO_INSTALL"
goto :DO_INSTALL

:: --- All deps are available ---
:ALL_DEPS_MET
call :SC "SC-020" "Entered ALL_DEPS_MET"
echo [%TIME%] [DBG-020] ALL_DEPS_MET reached >> "!LOG_FILE!"
call :LOG "[+] All system requirements (NodeJS, Git, PNPM) are met."
call :LOG ""

call :SC "SC-021" "Displaying compile prompt to user"
echo Do you want to compile the project now?
echo [Y] YES
echo [N] NO
echo.
set "CHOICE="
set /p "CHOICE=Enter your choice (Y/N): "
call :SC "SC-022" "User input for compile prompt: !CHOICE!"
if /i not "!CHOICE!"=="Y" goto :USER_CANCEL
call :SC "SC-023" "User accepted compile, branching to COMPILE"
goto :COMPILE

:: --- User said no ---
:USER_CANCEL
call :SC "SC-099" "Process canceled by user"
call :LOG "Process canceled by user."
call :SHOW_EXIT
exit /B

:: =======================================
:: 4. INSTALL MISSING DEPENDENCIES
:: =======================================
:DO_INSTALL
call :SC "SC-030" "Entered DO_INSTALL"
call :LOG ""
call :LOG "Please wait, the system is automatically installing missing dependencies..."

set "HAS_WINGET="
where winget >nul 2>&1 && set "HAS_WINGET=1"
call :SC "SC-031" "Winget check: HAS_WINGET=!HAS_WINGET!"

if defined HAS_WINGET (
    call :LOG "[*] Winget found. It will be used for installations."
) else (
    call :LOG "[*] Winget is not available. Will download directly from the internet."
)

if defined NEED_NODE (
    call :SC "SC-032" "Calling INSTALL_NODE"
    call :INSTALL_NODE
    call :SC "SC-033" "INSTALL_NODE returned"
)
if defined NEED_GIT (
    call :SC "SC-034" "Calling INSTALL_GIT"
    call :INSTALL_GIT
    call :SC "SC-035" "INSTALL_GIT returned"
)
if defined NEED_PNPM (
    call :SC "SC-036" "Calling INSTALL_PNPM"
    call :INSTALL_PNPM
    call :SC "SC-037" "INSTALL_PNPM returned"
)

call :LOG ""
call :SC "SC-038" "All dependency installations completed"
call :LOG "[OK] Dependencies installation completed."

:: =======================================
:: 5. REQUIRE SCRIPT RESTART
:: =======================================
call :SC "SC-039" "Displaying restart notice"
call :LOG ""
call :LOG "========================================================"
call :LOG "ACTION REQUIRED: PLEASE RESTART THE SCRIPT"
call :LOG "========================================================"
call :LOG "The required dependencies have been installed successfully."
call :LOG "To ensure the system recognizes the new environment variables,"
call :LOG "please CLOSE this window and RESTART the script to continue."
call :LOG "========================================================"

call :SHOW_EXIT
exit /B

:: =======================================
:: 6. COMPILE
:: =======================================
:COMPILE
call :SC "SC-040" "Entered COMPILE"
call :LOG ""
call :LOG "========================================================"
call :LOG "STEP: COMPILING WINDOWS APP"
call :LOG "========================================================"

if exist "package.json" (
    call :SC "SC-041" "package.json found in current dir, skipping clone"
    goto :SKIP_CLONE
)

call :SC "SC-042" "package.json not found, checking for repo dir"
set "REPO_DIR=glassy-music-nankill"

if exist "!REPO_DIR!\package.json" (
    call :SC "SC-043" "Repo dir exists with package.json, branching to REPO_EXISTS"
    goto :REPO_EXISTS
)

:: Repo chua co, clone moi
call :SC "SC-044" "Repo not found, starting clone"
call :LOG ""
call :LOG "Source code not found, cloning repository..."

:: --- Clone attempt 1 ---
if exist "!REPO_DIR!" (
    call :LOG "[*] Removing existing incomplete directory before clone..."
    rmdir /s /q "!REPO_DIR!" >nul 2>&1
)
call :SC "SC-045" "Running git clone (attempt 1)"
call :RUN_AND_LOG git clone https://github.com/NanKillBro/glassy-music-nankill
call :SC "SC-046" "git clone finished (attempt 1), exit code: !CMD_EXIT!"

if !CMD_EXIT! equ 0 (
    if exist "!REPO_DIR!\package.json" (
        call :SC "SC-047" "Clone verified successfully"
        call :LOG "[OK] Repository cloned successfully."
        goto :ENTER_REPO
    )
)

:: --- Clone attempt 1 failed, retry ---
call :SC "SC-04E" "Clone attempt 1 failed (exit code: !CMD_EXIT!), deleting dir for retry"
call :LOG "[WARN] Clone failed (exit code: !CMD_EXIT!). Retrying..."
if exist "!REPO_DIR!" (
    rmdir /s /q "!REPO_DIR!" >nul 2>&1
    if exist "!REPO_DIR!" (
        call :SC "SC-04F" "Delete failed, cannot retry clone"
        call :LOG "[ERROR] Failed to delete corrupted directory '!REPO_DIR!'. Cannot retry clone."
        call :LOG "A detailed log has been saved to: !LOG_FILE!"
        call :SHOW_EXIT
        exit /B 1
    )
)

:: --- Clone attempt 2 ---
call :SC "SC-04G" "Running git clone (attempt 2 - retry)"
call :RUN_AND_LOG git clone https://github.com/NanKillBro/glassy-music-nankill
call :SC "SC-046" "git clone finished (attempt 2), exit code: !CMD_EXIT!"

if !CMD_EXIT! equ 0 (
    if exist "!REPO_DIR!\package.json" (
        call :SC "SC-047" "Clone verified successfully (attempt 2)"
        call :LOG "[OK] Repository cloned successfully on retry."
        goto :ENTER_REPO
    )
)
goto :CLONE_FAILED

:REPO_EXISTS
:: Repo da co, pull update moi nhat
call :SC "SC-048" "Entered REPO_EXISTS"
call :LOG ""
call :LOG "[*] Repository found. Pulling latest updates..."
pushd "!REPO_DIR!"
call :SC "SC-049" "Running git pull"
call :RUN_AND_LOG git pull origin master
call :SC "SC-04A" "git pull finished"
popd
call :LOG "[OK] Repository updated."
goto :ENTER_REPO

:ENTER_REPO
call :SC "SC-04B" "Entering repo directory: !REPO_DIR!"
call :LOG "[*] Entering !REPO_DIR! folder..."
cd /d "!REPO_DIR!"
set "LOG_FILE=%cd%\..\build_log.txt"
call :SC "SC-04C" "Log file path updated: !LOG_FILE!"
goto :SKIP_CLONE

:CLONE_FAILED
call :SC "SC-04D" "Clone FAILED after 2 attempts (last exit code: !CMD_EXIT!)"
call :LOG "[ERROR] Failed to clone repository after 2 attempts. Last exit code: !CMD_EXIT!"
call :LOG "A detailed log has been saved to: !LOG_FILE!"
call :SHOW_EXIT
exit /B 1

:SKIP_CLONE
call :SC "SC-050" "Entered SKIP_CLONE, starting pnpm install"
echo [%TIME%] [DBG-050] SKIP_CLONE reached >> "!LOG_FILE!"
call :LOG ""
call :LOG "Installing project Node modules (pnpm install)..."
call :LOG "This process may take a few minutes, please wait. Check build_log.txt for details..."

:: --- pnpm install attempt 1 ---
call :SC "SC-051" "Running pnpm install --frozen-lockfile (attempt 1)"
echo [%TIME%] [DBG-051a] Before RUN_AND_LOG pnpm install attempt 1 >> "!LOG_FILE!"
call :RUN_AND_LOG pnpm install --frozen-lockfile
echo [%TIME%] [DBG-051b] After RUN_AND_LOG returned, CMD_EXIT=!CMD_EXIT! >> "!LOG_FILE!"
call :SC "SC-052" "pnpm install finished (attempt 1), exit code: !CMD_EXIT!"

:: Check exit code
call :SC "SC-053" "Checking pnpm install exit code: !CMD_EXIT!"
if !CMD_EXIT! equ 0 (
    call :SC "SC-054" "pnpm install verified OK (exit code 0)"
    goto :PNPM_OK
)

:: --- pnpm install attempt 1 failed, retry ---
call :SC "SC-058" "pnpm install attempt 1 failed (exit code: !CMD_EXIT!), retrying"
call :LOG "[WARN] pnpm install failed (exit code: !CMD_EXIT!). Retrying..."

:: Delete node_modules if it exists (may be corrupt)
if exist "node_modules" (
    call :LOG "[*] Removing potentially corrupted node_modules..."
    rmdir /s /q "node_modules" >nul 2>&1
)

:: --- pnpm install attempt 2 ---
call :SC "SC-051" "Running pnpm install --frozen-lockfile (attempt 2 - retry)"
echo [%TIME%] [DBG-051c] Before RUN_AND_LOG pnpm install attempt 2 >> "!LOG_FILE!"
call :RUN_AND_LOG pnpm install --frozen-lockfile
echo [%TIME%] [DBG-051d] After RUN_AND_LOG returned (attempt 2), CMD_EXIT=!CMD_EXIT! >> "!LOG_FILE!"
call :SC "SC-052" "pnpm install finished (attempt 2), exit code: !CMD_EXIT!"

if !CMD_EXIT! equ 0 (
    call :SC "SC-054" "pnpm install verified OK on retry (exit code 0)"
    goto :PNPM_OK
)
echo [%TIME%] [DBG-055] Both attempts failed, going to PNPM_FAILED >> "!LOG_FILE!"
goto :PNPM_FAILED

:PNPM_FAILED
call :SC "SC-055" "pnpm install FAILED after 2 attempts (last exit code: !CMD_EXIT!)"
call :LOG "[ERROR] pnpm install failed after 2 attempts. Last exit code: !CMD_EXIT!"
call :LOG "Check build_log.txt for details."
call :SHOW_EXIT
exit /B 1

:PNPM_OK
call :SC "SC-056" "pnpm install OK, displaying arch prompt"
call :LOG ""
echo Choose build architecture:
echo [1] x64 only (faster)
echo [2] x64 + arm64 (full)
echo.
set "ARCH_CHOICE="
set /p "ARCH_CHOICE=Enter your choice (1/2): "
call :SC "SC-057" "User input for arch prompt: !ARCH_CHOICE!"

if "!ARCH_CHOICE!"=="1" (
    set "BUILD_CMD=pnpm dist:win:x64"
    call :SC "SC-060" "Build target selected: x64 only"
    call :LOG "[*] Build target: x64 only"
) else (
    set "BUILD_CMD=pnpm dist:win"
    call :SC "SC-061" "Build target selected: x64 + arm64"
    call :LOG "[*] Build target: x64 + arm64"
)

call :LOG ""
call :LOG "Building Windows App (!BUILD_CMD!)..."
call :LOG "This process may take a few minutes, please wait. Check build_log.txt for details..."
call :LOG ""
call :SC "SC-062" "Running build command: !BUILD_CMD!"
call :RUN_AND_LOG !BUILD_CMD!
call :SC "SC-063" "Build command finished"

:: Verify pack folder was created
call :SC "SC-064" "Checking pack folder existence"
if not exist "pack" goto :BUILD_FAILED
call :SC "SC-065" "pack folder verified OK"
goto :BUILD_OK

:BUILD_FAILED
call :SC "SC-066" "Build FAILED (no pack folder)"
call :LOG "[ERROR] Build failed. Check build_log.txt for details."
call :SHOW_EXIT
exit /B 1

:BUILD_OK
call :SC "SC-070" "Build completed successfully"
call :LOG ""
call :LOG "========================================================"
call :LOG "BUILD PROCESS COMPLETED SUCCESSFULLY."
call :LOG "========================================================"
call :LOG "The build file has been generated in the 'glassy-music-nankill/pack' folder."
call :LOG "A detailed log has been saved to: !LOG_FILE!"
call :SC "SC-071" "Script finishing normally"
echo [%TIME%] [DBG-071] About to SHOW_EXIT and terminate >> "!LOG_FILE!"
call :SHOW_EXIT
echo [%TIME%] [DBG-072] After SHOW_EXIT, about to exit /B 0 >> "!LOG_FILE!"
exit /B 0
echo [%TIME%] [DBG-073] !!! THIS SHOULD NEVER APPEAR - exit /B 0 failed !!! >> "!LOG_FILE!"

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

:SC
echo [%TIME%] [%~1] %~2 >> "!LOG_FILE!"
exit /B

:RUN_AND_LOG
call :SC "SC-RUN" "Executing: %*"
echo [%TIME%] Running command: %* >> "!LOG_FILE!"
echo [%TIME%] [DBG-RUN-A] About to call: %* >> "!LOG_FILE!"
call %* >> "!LOG_FILE!" 2>&1
set "CMD_EXIT=!errorlevel!"
echo [%TIME%] [DBG-RUN-B] call returned, errorlevel=!CMD_EXIT! >> "!LOG_FILE!"
call :SC "SC-RET" "Exit code: !CMD_EXIT! for: %*"
echo [%TIME%] [DBG-RUN-C] About to exit /B from RUN_AND_LOG >> "!LOG_FILE!"
exit /B

:SHOW_EXIT
call :SC "SC-EXIT" "Showing exit prompt"
call :LOG ""
echo.
echo Press any key to exit...
pause >nul
exit /B

:INSTALL_NODE
call :SC "SC-I01" "INSTALL_NODE started"
call :LOG ""
call :LOG "> Installing NodeJS..."
if defined HAS_WINGET (
    call :SC "SC-I02" "Installing NodeJS via winget"
    call :RUN_AND_LOG winget install OpenJS.NodeJS -e --accept-package-agreements --accept-source-agreements
) else (
    call :SC "SC-I03" "Downloading NodeJS MSI"
    call :RUN_AND_LOG powershell -Command "Write-Host 'Downloading NodeJS...'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v24.14.0/node-v24.14.0-x64.msi' -OutFile '%temp%\nodejs.msi'"
    call :SC "SC-I04" "Running NodeJS MSI installer"
    call :RUN_AND_LOG msiexec /i "%temp%\nodejs.msi" /quiet /norestart
)
call :SC "SC-I05" "INSTALL_NODE finished"
exit /B

:INSTALL_GIT
call :SC "SC-I10" "INSTALL_GIT started"
call :LOG ""
call :LOG "> Installing Git..."
if defined HAS_WINGET (
    call :SC "SC-I11" "Installing Git via winget"
    call :RUN_AND_LOG winget install Git.Git -e --accept-package-agreements --accept-source-agreements
) else (
    call :SC "SC-I12" "Downloading Git installer"
    call :RUN_AND_LOG powershell -Command "Write-Host 'Downloading Git...'; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.53.0.windows.2/Git-2.53.0.2-64-bit.exe' -OutFile '%temp%\git.exe'"
    call :SC "SC-I13" "Running Git silent installer"
    call :RUN_AND_LOG "%temp%\git.exe" /VERYSILENT /NORESTART
)
call :SC "SC-I14" "INSTALL_GIT finished"
exit /B

:INSTALL_PNPM
call :SC "SC-I20" "INSTALL_PNPM started"
call :LOG ""
call :LOG "> Installing PNPM..."
call :SC "SC-I21" "Running PNPM install script"
call :RUN_AND_LOG powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest 'https://get.pnpm.io/install.ps1' -UseBasicParsing | Invoke-Expression"
set "PNPM_HOME=%LOCALAPPDATA%\pnpm"
set "PATH=%LOCALAPPDATA%\pnpm;%LOCALAPPDATA%\pnpm\.tools\pnpm-exe;!PATH!"
call :SC "SC-I22" "PNPM PATH updated: !PNPM_HOME!"
call :SC "SC-I23" "INSTALL_PNPM finished"
exit /B
