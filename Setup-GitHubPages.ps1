$ErrorActionPreference = 'Stop'
$previousLocation = Get-Location
$owner = 'taoluo20'
$repo = 'taoluo20/taoluo20.github.io'
$remote = "https://github.com/$repo.git"

function Invoke-Checked {
    param([string]$Tool, [string[]]$ToolArguments)
    & $Tool @ToolArguments
    if ($LASTEXITCODE -ne 0) { throw "$Tool failed (exit $LASTEXITCODE)." }
}

function Invoke-Probe {
    param([string]$Tool, [string[]]$ToolArguments)
    $savedPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $probeOutput = @(& $Tool @ToolArguments 2>$null)
        $probeExit = $LASTEXITCODE
        return [pscustomobject]@{ Output = $probeOutput; ExitCode = $probeExit }
    } finally { $ErrorActionPreference = $savedPreference }
}

try {
    Set-Location -LiteralPath $PSScriptRoot
    foreach ($tool in @('git', 'gh', 'node')) { if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "$tool is required but is not installed." } }
    $authProbe = Invoke-Probe 'gh' @('auth', 'status', '--hostname', 'github.com')
    if ($authProbe.ExitCode -ne 0) { Invoke-Checked 'gh' @('auth', 'login', '--hostname', 'github.com', '--git-protocol', 'https', '--web') }
    $login = (& gh api user --jq '.login').Trim()
    if ($LASTEXITCODE -ne 0 -or $login -ne $owner) { throw "Log into the $owner GitHub account before continuing." }
    Invoke-Checked 'gh' @('auth', 'setup-git', '--hostname', 'github.com')

    if (-not (Test-Path -LiteralPath '.git')) { Invoke-Checked 'git' @('init', '-b', 'main') }
    $actualRoot = (& git rev-parse --show-toplevel).Trim()
    if ([IO.Path]::GetFullPath($actualRoot) -ne [IO.Path]::GetFullPath($PSScriptRoot)) { throw 'This folder must have its own Git repository.' }
    $nameProbe = Invoke-Probe 'git' @('config', '--get', 'user.name')
    if ($nameProbe.ExitCode -ne 0) { Invoke-Checked 'git' @('config', 'user.name', 'Tao Luo') }
    $emailProbe = Invoke-Probe 'git' @('config', '--get', 'user.email')
    if ($emailProbe.ExitCode -ne 0) { Invoke-Checked 'git' @('config', 'user.email', '61079983+taoluo20@users.noreply.github.com') }

    $repoProbe = Invoke-Probe 'gh' @('repo', 'view', $repo, '--json', 'name')
    if ($repoProbe.ExitCode -ne 0) { Invoke-Checked 'gh' @('repo', 'create', $repo, '--public', '--description', 'Tao Luo - visual effects, procedural art, and photography') }
    $remoteProbe = Invoke-Probe 'git' @('remote', 'get-url', 'origin')
    if ($remoteProbe.ExitCode -ne 0) { Invoke-Checked 'git' @('remote', 'add', 'origin', $remote) }
    elseif (($remoteProbe.Output -join '').Trim() -notin @($remote, "https://github.com/$repo", "git@github.com:$repo.git")) { throw 'Unexpected origin. Setup did not change it.' }

    & (Join-Path $PSScriptRoot 'Update-Website.ps1') -Message 'Publish v2 work-in-progress portfolio'
    if ($LASTEXITCODE -ne 0) { throw 'Initial push failed. No Pages settings were changed.' }
    $pagesProbe = Invoke-Probe 'gh' @('api', "repos/$repo/pages", '--jq', '.html_url')
    if ($pagesProbe.ExitCode -ne 0) {
        '{"source":{"branch":"main","path":"/"}}' | & gh api "repos/$repo/pages" --method POST --input -
        if ($LASTEXITCODE -ne 0) { throw 'Files were pushed, but Pages could not be enabled. Open repository Settings > Pages and choose main / (root).' }
    }
    Write-Host "`nSetup complete. Future updates only need the update button." -ForegroundColor Green
    Write-Host 'Website: https://taoluo20.github.io/'
} catch {
    Write-Host "`nSetup stopped: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally { Set-Location -LiteralPath $previousLocation.Path }
