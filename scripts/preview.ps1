param([ValidateSet('serve','build','validate','fixtures')][string]$Action = 'serve')
$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path $PSScriptRoot -Parent
$localRuby = Join-Path (Split-Path $siteRoot -Parent) '.site-tools\ruby\bin\ruby.exe'
$rubyCommand = Get-Command ruby -ErrorAction SilentlyContinue
if ($rubyCommand) { $siteRuby = $rubyCommand.Source }
elseif (Test-Path -LiteralPath $localRuby) { $siteRuby = $localRuby }
else { throw 'Ruby is required. Install Ruby+Devkit from rubyinstaller.org, then run bundle install.' }
Push-Location $siteRoot
try {
  & $siteRuby -rbundler/setup 'scripts/site.rb' $Action
  if ($LASTEXITCODE -ne 0) { throw "Site command failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }
