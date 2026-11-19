param([ValidateSet('serve','build','validate','fixtures')][string]$Action = 'serve')
$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path $PSScriptRoot -Parent
Push-Location $siteRoot
try {
  & node 'scripts/site.mjs' $Action
  if ($LASTEXITCODE -ne 0) { throw "Site command failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }
