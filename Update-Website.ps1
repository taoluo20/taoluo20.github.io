param([string]$Message = '', [switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$previousLocation = Get-Location
$expectedRepo = 'taoluo20/taoluo20.github.io'
$expectedRemote = "https://github.com/$expectedRepo.git"

function Invoke-Checked {
    param([string]$Tool, [string[]]$ToolArguments)
    & $Tool @ToolArguments
    if ($LASTEXITCODE -ne 0) { throw "$Tool failed (exit $LASTEXITCODE). Nothing was force-pushed." }
}

try {
    Set-Location -LiteralPath $PSScriptRoot
    if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot '.git'))) { throw 'Run Setup-GitHubPages.ps1 first.' }
    $actualRoot = (& git rev-parse --show-toplevel).Trim()
    if ($LASTEXITCODE -ne 0 -or [IO.Path]::GetFullPath($actualRoot) -ne [IO.Path]::GetFullPath($PSScriptRoot)) { throw 'The Git repository must be this publishing folder.' }
    $remote = (& git remote get-url origin).Trim()
    if ($LASTEXITCODE -ne 0 -or $remote -notin @($expectedRemote, "https://github.com/$expectedRepo", "git@github.com:$expectedRepo.git")) { throw 'Unexpected origin. Refusing to push to another repository.' }
    $pushRemotes = @(& git remote get-url --push --all origin)
    if ($LASTEXITCODE -ne 0 -or $pushRemotes.Count -eq 0) { throw 'Cannot read the push destination.' }
    foreach ($pushRemote in $pushRemotes) {
        if ($pushRemote.Trim() -notin @($expectedRemote, "https://github.com/$expectedRepo", "git@github.com:$expectedRepo.git")) { throw 'Unexpected push destination. Refusing to push to another repository.' }
    }
    $branch = (& git branch --show-current).Trim()
    if ($branch -ne 'main') { throw 'Switch to the main branch before publishing.' }

    Write-Host "`nChecking website..." -ForegroundColor Cyan
    Invoke-Checked 'node' @('--check', 'app.js')
    Invoke-Checked 'node' @('--check', 'site-data.js')
    Invoke-Checked 'node' @('generate-pages.cjs')
    if (-not $CheckOnly) { Invoke-Checked 'node' @('update-site-info.cjs') }
    Invoke-Checked 'node' @('check-site.cjs')
    Invoke-Checked 'node' @('build.cjs')
    if ($CheckOnly) { Write-Host 'Local checks passed. No commit or push was performed.' -ForegroundColor Green; return }

    Invoke-Checked 'git' @('add', '--all', '--', '.')
    & git diff --cached --quiet
    $hasChanges = $LASTEXITCODE
    if ($hasChanges -gt 1) { throw 'Cannot read staged changes.' }
    if ($hasChanges -eq 1) {
        if ([string]::IsNullOrWhiteSpace($Message)) { $Message = 'Update portfolio ' + (Get-Date -Format 'yyyy-MM-dd HH:mm') }
        Invoke-Checked 'git' @('commit', '-m', $Message)
    } else { Write-Host 'No new file changes. Checking for commits to push.' }

    Invoke-Checked 'git' @('push', '-u', 'origin', 'main')
    Write-Host "`nPushed successfully. GitHub Pages will publish the update automatically." -ForegroundColor Green
    Write-Host 'Website: https://taoluo20.github.io/'
    Write-Host 'Deployment status: https://github.com/taoluo20/taoluo20.github.io/actions'
} catch {
    Write-Host "`nUpdate stopped: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Your local files are preserved. If authentication is missing, run Setup-GitHubPages.ps1.'
    exit 1
} finally { Set-Location -LiteralPath $previousLocation.Path }
