param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputRoot
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::new($InputPath)
$working = [System.Drawing.Bitmap]::new($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($working)
$graphics.DrawImageUnscaled($source, 0, 0)
$graphics.Dispose()
$source.Dispose()

$width = $working.Width
$height = $working.Height
$visited = [bool[]]::new($width * $height)
$queue = [System.Collections.Generic.Queue[int]]::new()

function Test-BackgroundPixel([System.Drawing.Color]$color) {
  $maximum = [Math]::Max($color.R, [Math]::Max($color.G, $color.B))
  $minimum = [Math]::Min($color.R, [Math]::Min($color.G, $color.B))
  return $minimum -ge 225 -and ($maximum - $minimum) -le 10
}

function Add-BackgroundPixel([int]$x, [int]$y) {
  if ($x -lt 0 -or $x -ge $width -or $y -lt 0 -or $y -ge $height) { return }
  $index = $y * $width + $x
  if ($visited[$index]) { return }
  $visited[$index] = $true
  if (Test-BackgroundPixel $working.GetPixel($x, $y)) { $queue.Enqueue($index) }
}

for ($x = 0; $x -lt $width; $x++) {
  Add-BackgroundPixel $x 0
  Add-BackgroundPixel $x ($height - 1)
}
for ($y = 0; $y -lt $height; $y++) {
  Add-BackgroundPixel 0 $y
  Add-BackgroundPixel ($width - 1) $y
}

while ($queue.Count -gt 0) {
  $index = $queue.Dequeue()
  $x = $index % $width
  $y = [Math]::Floor($index / $width)
  $working.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
  Add-BackgroundPixel ($x - 1) $y
  Add-BackgroundPixel ($x + 1) $y
  Add-BackgroundPixel $x ($y - 1)
  Add-BackgroundPixel $x ($y + 1)
}

$cellWidth = [Math]::Floor($width / 3)
$cellHeight = [Math]::Floor($height / 2)
$directions = @("front", "back")

for ($row = 0; $row -lt 2; $row++) {
  $directory = Join-Path $OutputRoot "doctor-walk-$($directions[$row])-v1"
  [System.IO.Directory]::CreateDirectory($directory) | Out-Null
  for ($column = 0; $column -lt 3; $column++) {
    $frame = [System.Drawing.Bitmap]::new($cellWidth, $cellHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $frameGraphics = [System.Drawing.Graphics]::FromImage($frame)
    $frameGraphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $sourceRectangle = [System.Drawing.Rectangle]::new($column * $cellWidth, $row * $cellHeight, $cellWidth, $cellHeight)
    $targetRectangle = [System.Drawing.Rectangle]::new(0, 0, $cellWidth, $cellHeight)
    $frameGraphics.DrawImage($working, $targetRectangle, $sourceRectangle, [System.Drawing.GraphicsUnit]::Pixel)
    $frameGraphics.Dispose()
    $outputPath = Join-Path $directory ("doctor-walk-{0:D2}.png" -f ($column + 1))
    $frame.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $frame.Dispose()
  }
}

$working.Dispose()
