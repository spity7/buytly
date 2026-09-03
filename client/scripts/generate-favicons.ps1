Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot -Parent
$source = Join-Path $root "public\images\buytly-logo-dark.png"
$appDir = Join-Path $root "src\app"
$imagesDir = Join-Path $root "public\images"

$bitmap = [System.Drawing.Bitmap]::FromFile((Resolve-Path $source))
$icon = $null

try {
  $size = [Math]::Min($bitmap.Width, $bitmap.Height)
  $crop = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $icon = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($icon)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($bitmap, 0, 0, $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()

  function Save-PngSize($targetSize, $outputPath) {
    $resized = New-Object System.Drawing.Bitmap $targetSize, $targetSize
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($icon, 0, 0, $targetSize, $targetSize)
    $g.Dispose()
    $resized.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $resized.Dispose()
  }

  Save-PngSize 512 (Join-Path $appDir "icon.png")
  Save-PngSize 180 (Join-Path $appDir "apple-icon.png")
  Save-PngSize 32 (Join-Path $imagesDir "favicon-32x32.png")
  Save-PngSize 16 (Join-Path $imagesDir "favicon-16x16.png")

  Write-Output "Generated app/icon.png, app/apple-icon.png, and public favicon PNGs"
}
finally {
  if ($icon) { $icon.Dispose() }
  $bitmap.Dispose()
}
