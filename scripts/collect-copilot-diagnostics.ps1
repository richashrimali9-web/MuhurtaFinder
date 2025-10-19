# collect-copilot-diagnostics.ps1
# Collect Copilot-related storage, VS Code logs and environment info into a zip for troubleshooting.
# Usage:
#   pwsh -ExecutionPolicy Bypass -File .\scripts\collect-copilot-diagnostics.ps1

try {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $outDir = Join-Path (Get-Location) "scripts\copilot-diagnostics-$ts"
  New-Item -Path $outDir -ItemType Directory -Force | Out-Null

  $ap = $env:APPDATA
  if (-not $ap) { throw "APPDATA environment variable not found." }

  Write-Output "Writing diagnostics to: $outDir";

  # Copy globalStorage folders (Copilot)
  $gs = Join-Path $ap 'Code\User\globalStorage'
  if (Test-Path $gs) {
    $targets = @('github.copilot','github.copilot-chat')
    foreach ($t in $targets) {
      $src = Join-Path $gs $t
      if (Test-Path $src) {
        $dest = Join-Path $outDir $t
        Copy-Item -Path $src -Destination $dest -Recurse -Force -ErrorAction SilentlyContinue
        Write-Output "Copied: $src -> $dest"
      } else {
        Write-Output "Not found: $src"
      }
    }
  } else {
    Write-Output "globalStorage not found at $gs"
  }

  # Copy VS Code logs (may be large)
  $vscLogs = Join-Path $ap 'Code\logs'
  if (Test-Path $vscLogs) {
    $destLogs = Join-Path $outDir 'vscode-logs'
    Copy-Item -Path $vscLogs -Destination $destLogs -Recurse -Force -ErrorAction SilentlyContinue
    Write-Output "Copied VS Code logs to $destLogs"
  } else {
    Write-Output "VS Code logs folder not found at $vscLogs"
  }

  # Save list of installed extensions
  $extList = Join-Path $outDir 'extensions-list.txt'
  & code --list-extensions > $extList 2>&1
  Write-Output "Saved extensions list to $extList"

  # Save running Code process info
  $procInfo = Join-Path $outDir 'code-processes.txt'
  Get-Process *Code* -ErrorAction SilentlyContinue | Format-List * > $procInfo
  Write-Output "Saved Code process info to $procInfo"

  # Save environment info
  $envInfo = Join-Path $outDir 'environment.txt'
  @(
    "Timestamp: $ts",
    "OS: $([Environment]::OSVersion.VersionString)",
    "PowerShell: $($PSVersionTable.PSVersion)",
    "Node: $(node --version 2>$null)"
  ) | Out-File -FilePath $envInfo -Encoding utf8
  Write-Output "Saved environment info to $envInfo"

  # Create zip archive
  $zipPath = Join-Path (Get-Location) "scripts\copilot-diagnostics-$ts.zip"
  Compress-Archive -Path $outDir\* -DestinationPath $zipPath -Force
  Write-Output "Created diagnostics zip: $zipPath"

  Write-Output "Done. Please upload the zip or paste any relevant logs here."
} catch {
  Write-Error "Error collecting diagnostics: $_"
  exit 1
}
