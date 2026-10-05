param(
  [string[]]$Tenants = @("floreria-gerberas", "floreria-girasol")
)

$tenantStyles = @{
  "floreria-gerberas" = @{
    ColorHex = "D946EF"
  }
  "floreria-girasol" = @{
    ColorHex = "F59E0B"
  }
}

function Invoke-FfmpegFilter {
  param(
    [string]$Path,
    [string]$Filter
  )

  $extension = [System.IO.Path]::GetExtension($Path)
  $tempPath = [System.IO.Path]::Combine(
    [System.IO.Path]::GetDirectoryName($Path),
    ("tmp_" + [System.IO.Path]::GetFileNameWithoutExtension($Path) + $extension)
  )

  & ffmpeg -y -loglevel error -i $Path -vf $Filter $tempPath
  if ($LASTEXITCODE -ne 0) {
    throw "ffmpeg failed for $Path"
  }

  Move-Item $tempPath $Path -Force
}

function Get-FeatureFilter {
  param([hashtable]$Style)

  $color = $Style.ColorHex
  return "drawbox=x=0:y=0:w=iw:h=ih:color=#$color@0.12:t=fill,drawbox=x=0:y=ih*0.86:w=iw:h=ih*0.14:color=#$color@0.48:t=fill"
}

foreach ($tenant in $Tenants) {
  $style = $tenantStyles[$tenant]
  if (-not $style) {
    throw "No style configured for tenant '$tenant'"
  }

  $featureFilter = Get-FeatureFilter -Style $style

  $catalogDir = Join-Path "public\images\tenants" "$tenant\catalog"

  foreach ($folder in @("services", "logo")) {
    $folderPath = Join-Path "public\images\tenants" "$tenant\$folder"
    Get-ChildItem $folderPath -File | Where-Object {
      $_.Extension -match "^\.(jpg|jpeg|png)$"
    } | ForEach-Object {
      Invoke-FfmpegFilter -Path $_.FullName -Filter $featureFilter
    }
  }

  Get-ChildItem $catalogDir -File | Where-Object {
    $_.Name -like "cielitodeflores_*"
  } | Remove-Item -Force
}

Write-Host "Tenant asset personalization completed."
