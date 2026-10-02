Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot -Parent
$source = Join-Path $root "public\images\buildwise-favicon.png"
$appDir = Join-Path $root "src\app"
$imagesDir = Join-Path $root "public\images"

if (-not (Test-Path $source)) {
  Write-Error "Missing favicon source: $source"
  exit 1
}

$bitmap = [System.Drawing.Bitmap]::FromFile((Resolve-Path $source))

try {
  function Save-PngSize($targetSize, $outputPath) {
    $resized = New-Object System.Drawing.Bitmap $targetSize, $targetSize
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::Transparent)
    $scale = [Math]::Min(
      $targetSize / $bitmap.Width,
      $targetSize / $bitmap.Height
    )
    $drawW = [int][Math]::Round($bitmap.Width * $scale)
    $drawH = [int][Math]::Round($bitmap.Height * $scale)
    $x = [int][Math]::Round(($targetSize - $drawW) / 2)
    $y = [int][Math]::Round(($targetSize - $drawH) / 2)
    $g.DrawImage($bitmap, $x, $y, $drawW, $drawH)
    $g.Dispose()
    $resized.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $resized.Dispose()
  }

  Save-PngSize 512 (Join-Path $appDir "icon.png")
  Save-PngSize 180 (Join-Path $appDir "apple-icon.png")
  Save-PngSize 32 (Join-Path $imagesDir "favicon-32x32.png")
  Save-PngSize 16 (Join-Path $imagesDir "favicon-16x16.png")

  Write-Output "Generated app/icon.png, app/apple-icon.png, and public favicon PNGs from buildwise-favicon.png"
}
finally {
  $bitmap.Dispose()
}
