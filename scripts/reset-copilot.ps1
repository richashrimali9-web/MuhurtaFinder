# reset-copilot.ps1
# Safe Copilot reset script for Windows (PowerShell)
# - Backs up Copilot globalStorage folders by renaming with timestamp
# - Restarts VS Code
# Usage:
#   Open PowerShell in the repository root and run:
#     pwsh -ExecutionPolicy Bypass -File .\scripts\reset-copilot.ps1
# or
#     .\scripts\reset-copilot.ps1

try {
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    $ap = $env:APPDATA
    if (-not $ap) { throw "APPDATA environment variable not found." }

    $globalStorage = Join-Path $ap 'Code\User\globalStorage'
    if (-not (Test-Path $globalStorage)) {
        Write-Output "No globalStorage folder found at: $globalStorage"
    } else {
        Push-Location $globalStorage

        $folders = @('github.copilot', 'github.copilot-chat')
        foreach ($f in $folders) {
            if (Test-Path $f) {
                $backupName = "$f.bak.$ts"
                Rename-Item -Path $f -NewName $backupName -ErrorAction Stop
                Write-Output "Backed up: $f -> $backupName"
            } else {
                Write-Output "Not present: $f"
            }
        }

        Pop-Location
    }

    # Optionally clear extension storage local state (safe - uses backup naming)
    $localStorage = Join-Path $ap 'Code\User\storage.json'
    if (Test-Path $localStorage) {
        $backupLocal = "$localStorage.bak.$ts"
        Copy-Item -Path $localStorage -Destination $backupLocal -ErrorAction SilentlyContinue
        Write-Output "(Optional) Backed up storage.json -> $backupLocal"
    }

    Write-Output "Opening VS Code..."
    # Start VS Code (uses PATH 'code' command). If not available, user can open manually.
    Start-Process -FilePath "code" -ArgumentList "-n"

    Write-Output "Done. VS Code should open. Sign in to GitHub Copilot when prompted."
    Write-Output "If you need to restore the backups, rename the .bak.<timestamp> folders back to their original names and restart VS Code."
} catch {
    Write-Error "Error: $_"
    exit 1
}
