const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

const SUPPORTED_FORMATS = new Set([".webp", ".avif", ".jpg", ".jpeg", ".png"]);

async function checkImageMetadata(url) {
  try {
    let response = await axios.head(url, {
      timeout: 3000,
      httpsAgent: agent,
      maxRedirects: 3,
      validateStatus: () => true
    });
    let status = response.status;
    let size = parseInt(response.headers["content-length"] || "0", 10);

    if (status < 200 || status >= 400 || size === 0) {
      response = await axios.get(url, {
        timeout: 3000,
        httpsAgent: agent,
        maxRedirects: 3,
        validateStatus: () => true
      });
      status = response.status;
      size = parseInt(response.headers["content-length"] || "0", 10) || (typeof response.data === 'string' ? response.data.length : 0);
    }
    return [status, size];
  } catch (err) {
    try {
      const response = await axios.get(url, {
        timeout: 3000,
        httpsAgent: agent,
        maxRedirects: 3,
        validateStatus: () => true
      });
      const status = response.status;
      const size = parseInt(response.headers["content-length"] || "0", 10) || (typeof response.data === 'string' ? response.data.length : 0);
      return [status, size];
    } catch (e) {
      return [0, 0];
    }
  }
}

async function runImageSeoAnalysis(seoData, baseUrl) {
  const imagesList = seoData.images || [];
  const totalImages = imagesList.length;

  const passed = [];
  const warnings = [];
  const critical = [];

  if (totalImages === 0) {
    return {
      image_seo_score: 100,
      statistics: {
        total_images: 0,
        missing_alt_count: 0,
        large_images_count: 0,
        broken_images_count: 0
      },
      optimization_suggestions: ["No images found on page to optimize."],
      passed: [{ check_name: "No Images Check", message: "No images found on the page." }],
      warnings: [],
      critical: []
    };
  }

  const uniqueUrls = Array.from(new Set(imagesList.map(img => img.src).filter(src => src && src.startsWith("http")))).slice(0, 15);
  
  console.log(`[ImageAnalyzer] Checking ${uniqueUrls.length} unique image endpoints...`);
  const checkResults = await Promise.all(uniqueUrls.map(url => checkImageMetadata(url)));

  const urlMetaMap = {};
  for (let i = 0; i < uniqueUrls.length; i++) {
    urlMetaMap[uniqueUrls[i]] = checkResults[i];
  }

  const altCounts = {};
  for (const img of imagesList) {
    const alt = (img.alt || "").trim().toLowerCase();
    if (alt) {
      altCounts[alt] = (altCounts[alt] || 0) + 1;
    }
  }

  let missingAltCount = 0;
  let largeImagesCount = 0;
  let brokenImagesCount = 0;
  const imageScores = [];

  for (let idx = 0; idx < imagesList.length; idx++) {
    const img = imagesList[idx];
    const imgSrc = img.src || "";
    const imgAlt = img.alt || "";
    const hasAlt = img.has_alt_attr || false;
    const width = img.width;
    const height = img.height;
    const loading = img.loading;
    const isDataUri = imgSrc.startsWith("data:");

    let fileExt = "";
    if (isDataUri) {
      const match = imgSrc.match(/^data:image\/([a-zA-Z0-9+-]+);/);
      if (match) {
        fileExt = "." + match[1].toLowerCase();
        if (fileExt === ".jpeg") fileExt = ".jpg";
      }
    } else {
      try {
        const parsed = new URL(imgSrc, baseUrl);
        const pathLower = parsed.pathname.toLowerCase();
        for (const fmt of SUPPORTED_FORMATS) {
          if (pathLower.endsWith(fmt)) {
            fileExt = fmt;
            break;
          }
        }
        if (!fileExt) {
          const match = pathLower.match(/\.[a-z0-9]+$/);
          if (match) {
            fileExt = match[0];
          }
        }
      } catch (err) {}
    }

    let httpStatus = 200;
    let sizeBytes = 0;

    if (isDataUri) {
      const parts = imgSrc.split(",", 2);
      if (parts.length > 1) {
        sizeBytes = Math.round(parts[1].length * 0.75);
      }
    } else {
      const meta = urlMetaMap[imgSrc] || [200, 0];
      httpStatus = meta[0];
      sizeBytes = meta[1];
    }

    let imgScore = 100.0;
    let filename = "inline-image";
    if (!isDataUri) {
      try {
        const pathParts = new URL(imgSrc, baseUrl).pathname.split("/");
        filename = pathParts[pathParts.length - 1] || `Image #${idx + 1}`;
      } catch (err) {
        filename = `Image #${idx + 1}`;
      }
    }

    const imgIssues = [];

    if (!isDataUri) {
      if (httpStatus === 0 || httpStatus < 200 || httpStatus >= 400) {
        brokenImagesCount++;
        imgScore -= 40;
        imgIssues.push(`Broken URL (HTTP ${httpStatus})`);
        critical.push({
          check_name: "Broken Image",
          message: `Image '${filename}' is broken. Source URL returned HTTP status ${httpStatus}.`
        });
      }
    }

    if (!hasAlt) {
      missingAltCount++;
      imgScore -= 30;
      imgIssues.push("Missing alt attribute");
      critical.push({
        check_name: "Missing ALT Text",
        message: `Image '${filename}' is missing the alt attribute entirely.`
      });
    } else if (!imgAlt.trim()) {
      missingAltCount++;
      imgScore -= 20;
      imgIssues.push("Empty alt attribute");
      warnings.push({
        check_name: "Empty ALT Text",
        message: `Image '${filename}' has an empty alt attribute (alt="").`
      });
    }

    if (imgAlt.trim() && altCounts[imgAlt.trim().toLowerCase()] > 1) {
      imgScore -= 10;
      imgIssues.push("Duplicate alt text");
      warnings.push({
        check_name: "Duplicate ALT Text",
        message: `Image '${filename}' uses duplicate alt text: '${imgAlt}'.`
      });
    }

    if (!width || !height) {
      imgScore -= 10;
      const missingDims = [];
      if (!width) missingDims.push("width");
      if (!height) missingDims.push("height");
      imgIssues.push(`Missing ${missingDims.join(", ")}`);
      warnings.push({
        check_name: "Missing Layout Dimensions",
        message: `Image '${filename}' is missing HTML ${missingDims.join(", ")} attribute(s). This can cause Cumulative Layout Shift (CLS).`
      });
    }

    if (!SUPPORTED_FORMATS.has(fileExt)) {
      imgScore -= 10;
      imgIssues.push("Unsupported format");
      warnings.push({
        check_name: "Image Format Support",
        message: `Image '${filename}' uses format '${fileExt || 'unknown'}'. Use modern formats like WebP or AVIF.`
      });
    }

    if (loading !== "lazy") {
      imgScore -= 10;
      imgIssues.push("Not lazy loaded");
      warnings.push({
        check_name: "Lazy Loading Check",
        message: `Image '${filename}' does not use lazy loading (loading="lazy").`
      });
    }

    if (sizeBytes > 102400) {
      largeImagesCount++;
      imgScore -= 15;
      const sizeKb = Math.round((sizeBytes / 1024) * 10) / 10;
      imgIssues.push(`Large file size (${sizeKb} KB)`);
      warnings.push({
        check_name: "Image Payload Size",
        message: `Image '${filename}' has a large file size (${sizeKb} KB). Aim to compress images under 100 KB.`
      });
    }

    imgScore = Math.max(0.0, imgScore);
    imageScores.push(imgScore);

    if (imgIssues.length === 0) {
      passed.push({
        check_name: "Image Optimized",
        message: `Image '${filename}' successfully passed all Alt, size, formatting, lazy loading, and layout dimensions audits.`
      });
    }
  }

  const avgScore = imageScores.reduce((a, b) => a + b, 0) / imageScores.length;
  const finalScore = Math.max(0, Math.min(100, Math.floor(avgScore)));

  const suggestions = [];
  if (brokenImagesCount > 0) {
    suggestions.push(`Fix the ${brokenImagesCount} broken image URLs returning non-200 HTTP statuses to restore layout integrity.`);
  }
  if (missingAltCount > 0) {
    suggestions.push(`Add unique, descriptive alternate text (ALT) descriptions to the ${missingAltCount} images lacking proper descriptors.`);
  }
  if (largeImagesCount > 0) {
    suggestions.push(`Compress the ${largeImagesCount} oversized images (>100 KB) using WebP/AVIF to improve page speed and reduce payload sizes.`);
  }

  const notLazyCount = imagesList.filter(img => img.loading !== "lazy").length;
  if (notLazyCount > 0) {
    suggestions.push(`Implement lazy-loading (loading="lazy") on ${notLazyCount} offscreen image tags to defer non-critical render payloads.`);
  }

  const noDimsCount = imagesList.filter(img => !img.width || !img.height).length;
  if (noDimsCount > 0) {
    suggestions.push(`Add width and height properties to the ${noDimsCount} image tags to specify explicit layout dimensions and prevent CLS.`);
  }

  if (suggestions.length === 0) {
    suggestions.push("Outstanding! All analyzed images are fully optimized for search indexes, speed, and responsiveness.");
  }

  return {
    image_seo_score: finalScore,
    statistics: {
      total_images: totalImages,
      missing_alt_count: missingAltCount,
      large_images_count: largeImagesCount,
      broken_images_count: brokenImagesCount
    },
    optimization_suggestions: suggestions,
    passed,
    warnings,
    critical
  };
}

module.exports = { runImageSeoAnalysis };

