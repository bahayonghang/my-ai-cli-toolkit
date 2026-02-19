# Image Upload (Required for Image-to-Image)

Local images must be uploaded to an image hosting service to get a URL for image-to-image generation.

## Recommended Image Hosts

### Litterbox (Temporary, 1 hour)

```bash
curl -s -F "reqtype=fileupload" -F "time=1h" -F "fileToUpload=@/path/to/local/image" https://litterbox.catbox.moe/resources/internals/api.php
```

### Catbox (Permanent)

```bash
curl -s -F "reqtype=fileupload" -F "fileToUpload=@/path/to/local/image" https://catbox.moe/user/api.php
```

## Usage

1. Upload image and get the returned URL
2. Put URL at the beginning of prompt, followed by description

Example:
```
https://litter.catbox.moe/xxxxx.png Enhance this image to 4K, keep original content unchanged
```
