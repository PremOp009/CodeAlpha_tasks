# GenURL Chrome Extension Icon Generator
# Uses .NET System.Drawing — no pip install needed
# Run: powershell -ExecutionPolicy Bypass -File generate_icons.ps1

Add-Type -AssemblyName System.Drawing

$outDir = "$PSScriptRoot\icons"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

function New-GenurlIcon {
    param([int]$Size)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # ── Background gradient (dark purple → indigo) ──────────────────────────
    $topLeft     = [System.Drawing.Color]::FromArgb(255, 15,  12,  41)   # #0f0c29
    $bottomRight = [System.Drawing.Color]::FromArgb(255, 48,  43,  99)   # #302b63
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect, $topLeft, $bottomRight,
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    # ── Rounded rect clip (pill shape) ──────────────────────────────────────
    $radius = [int]($Size * 0.22)
    $path   = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $radius*2, $radius*2, 180, 90)
    $path.AddArc($Size - $radius*2, 0, $radius*2, $radius*2, 270, 90)
    $path.AddArc($Size - $radius*2, $Size - $radius*2, $radius*2, $radius*2, 0, 90)
    $path.AddArc(0, $Size - $radius*2, $radius*2, $radius*2, 90, 90)
    $path.CloseFigure()
    $g.SetClip($path)

    # Re-fill inside clip
    $brush2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect, $topLeft, $bottomRight,
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    $g.FillRectangle($brush2, $rect)
    $brush2.Dispose()

    # ── Purple glow overlay ──────────────────────────────────────────────────
    $glowColor = [System.Drawing.Color]::FromArgb(60, 139, 92, 246)
    $glowBrush = New-Object System.Drawing.SolidBrush($glowColor)
    $g.FillEllipse($glowBrush, -($Size * 0.1), -($Size * 0.1), $Size * 0.9, $Size * 0.9)
    $glowBrush.Dispose()

    # ── Draw chain/link icon ─────────────────────────────────────────────────
    $pad      = [int]($Size * 0.18)
    $penWidth = [Math]::Max(1.5, $Size * 0.09)

    $linkColor1 = [System.Drawing.Color]::FromArgb(255, 167, 139, 250)  # #a78bfa violet
    $linkColor2 = [System.Drawing.Color]::FromArgb(255, 96,  165, 250)  # #60a5fa blue
    $linkRect   = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $linkBrush  = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $linkRect, $linkColor1, $linkColor2,
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    $pen = New-Object System.Drawing.Pen($linkBrush, $penWidth)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round

    # Top-left link oval
    $ovalW = [int]($Size * 0.42)
    $ovalH = [int]($Size * 0.28)
    $x1    = $pad
    $y1    = [int]($Size * 0.18)
    # Draw top half arc of first link
    $g.DrawArc($pen, $x1, $y1, $ovalW, $ovalH, 180, 180)

    # Bottom-right link oval
    $x2 = [int]($Size - $pad - $ovalW)
    $y2 = [int]($Size * 0.54)
    $g.DrawArc($pen, $x2, $y2, $ovalW, $ovalH, 0, 180)

    # Connecting bars
    $barY1top    = $y1 + $ovalH / 2
    $barY2bottom = $y2 + $ovalH / 2
    $g.DrawLine($pen, $x1 + $ovalW/2 - $penWidth/2, $barY1top,
                      $x2 + $ovalW/2 + $penWidth/2, $barY1top + ($barY2bottom - $barY1top) * 0.0)

    $pen.Dispose()
    $linkBrush.Dispose()
    $g.ResetClip()
    $g.Dispose()

    $outPath = Join-Path $outDir "icon$Size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "✅  icon$Size.png saved"
}

New-GenurlIcon -Size 16
New-GenurlIcon -Size 48
New-GenurlIcon -Size 128

Write-Host ""
Write-Host "🎉  All 3 icons generated in: $outDir"
