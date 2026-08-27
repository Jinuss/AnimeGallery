# AnimeGallery 壁纸维护技能

> 当用户在 images/ 目录下新增或修改图片后，按本文件执行 JSON 数据生成和缩略图生成。

## 项目结构

```
AnimeGallery/
├── images/<anime_id>/        # 原图（用户手动添加，按动漫分目录）
├── thumbs/<anime_id>/        # 缩略图（180×140px，居中裁剪）
├── data/<anime_id>.json      # 壁纸元数据（AI 生成/维护）
├── js/data.js                # ANIMES 配置（单一数据源）
└── js/app.js                 # 应用逻辑
```

## 前置约定（用户已完成）

- 图片已放入 `images/<anime_id>/` 目录
- 命名规则：`人物名编号.后缀`，如 `红蝶01.jpg`、`韩立02.png`
- 支持格式：`.jpg` `.jpeg` `.png`
- `js/data.js` 中 `ANIMES` 数组已注册对应动漫

## AI 执行步骤

### 步骤 1：扫描图片目录

对比 `images/<anime_id>/` 下的实际文件与 `data/<anime_id>.json` 中的已有项：
- 新增的图片 → 需要生成 JSON 条目
- 已有的图片 → 跳过（除非用户要求重新生成 desc）

### 步骤 2：生成/更新 JSON

为每张图片生成一个数组项，写入 `data/<anime_id>.json`：

```json
{
  "id": "红蝶01",
  "title": "红蝶",
  "desc": "荒星独行，蝶影翩然",
  "tags": ["仙逆", "红蝶", "盛世美颜"],
  "type": ".jpg"
}
```

**字段规则：**

| 字段 | 来源 | 示例 |
|------|------|------|
| `id` | 图片文件名（含编号，不含扩展名） | `红蝶01` |
| `title` | 文件名去除数字后缀 | `红蝶` |
| `desc` | 古风短句，简短文雅，同一人物不同图片应变化 | `荒星独行，蝶影翩然` |
| `tags` | `[动漫name, 人物名, 美好词汇]` | `["仙逆", "红蝶", "盛世美颜"]` |
| `type` | 文件实际扩展名（含点） | `.jpg` |

**tags 第三元素词汇表：**

- 女性：盛世美颜 / 风华绝代 / 风姿绰约 / 倾国倾城 / 丽质天成
- 男性：帅气
- 情侣/双人：璧人
- 场景：恢宏

### 步骤 3：生成缩略图

为新增的原图生成缩略图到 `thumbs/<anime_id>/`，文件名与原图一致。

**规格：** 180×140px，居中裁剪，JPEG 质量 85，PNG 保持原格式。

**PowerShell 命令（替换 `<anime_id>`）：**

```powershell
Add-Type -AssemblyName System.Drawing
$srcDir = "images/<anime_id>"
$thumbDir = "thumbs/<anime_id>"
$maxW = 180; $maxH = 140
New-Item -ItemType Directory -Path $thumbDir -Force | Out-Null
Get-ChildItem $srcDir -File | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $srcW = $img.Width; $srcH = $img.Height
    $targetRatio = $maxW / $maxH; $srcRatio = $srcW / $srcH
    if ($srcRatio -gt $targetRatio) { $cropH = $srcH; $cropW = [int]($srcH * $targetRatio) }
    else { $cropW = $srcW; $cropH = [int]($srcW / $targetRatio) }
    $cropX = [int](($srcW - $cropW) / 2); $cropY = [int](($srcH - $cropH) / 2)
    $bmp = New-Object System.Drawing.Bitmap($maxW, $maxH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $maxW, $maxH)),
        (New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)),
        [System.Drawing.GraphicsUnit]::Pixel)
    $path = Join-Path $thumbDir $_.Name
    if ($_.Extension -eq ".png") { $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png) }
    else {
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
        $bmp.Save($path, $codec, $params)
    }
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}
```

### 步骤 4：验证

- JSON 条目数 = `images/<anime_id>/` 下文件数
- `thumbs/<anime_id>/` 下文件数 = `images/<anime_id>/` 下文件数
- JSON 中每个 `id` + `type` 能对应到实际文件

## 补充说明

- `ANIMES` 中被注释的项不会加载，取消注释即可启用
- JSON 数据项顺序不影响显示（初始化时会随机打乱）
- 卡片展示用缩略图（`thumbs/`），详情弹窗和下载用原图（`images/`）
- 如果是新增整个动漫分类，需同时在 `js/data.js` 的 `ANIMES` 数组中注册
