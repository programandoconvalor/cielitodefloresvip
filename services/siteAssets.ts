const SITE_ASSET_VERSION = "20260530-clean-catalog";

function appendAssetVersion(path: string, cacheKey?: string) {
  const version = cacheKey ? `${SITE_ASSET_VERSION}-${cacheKey}` : SITE_ASSET_VERSION;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${version}`;
}

export function rewriteSiteImagePath(originalPath: string, basePath?: string, cacheKey?: string) {
  if (!originalPath.startsWith("/images/")) {
    return originalPath;
  }

  if (!basePath) {
    return originalPath;
  }

  const fileName = originalPath.split("/").pop() || originalPath;
  return appendAssetVersion(`${basePath.replace(/\/$/, "")}/${fileName}`, cacheKey);
}

function applySiteImagePrefix(fileName: string, sitePrefix?: string) {
  if (!sitePrefix) {
    return fileName;
  }

  // If file follows <prefix>_<rest>.<ext>, swap the prefix to site prefix.
  // This keeps product IDs and extensions intact for site-specific assets.
  const prefixedPattern = /^[^_]+_(.+\.[A-Za-z0-9]+)$/;
  const match = fileName.match(prefixedPattern);
  if (!match) {
    return fileName;
  }

  return `${sitePrefix}_${match[1]}`;
}

export function rewriteSiteCatalogImagePath(
  originalPath: string,
  basePath?: string,
  sitePrefix?: string,
) {
  if (!originalPath.startsWith("/images/")) {
    return originalPath;
  }

  if (!basePath) {
    return originalPath;
  }

  const fileName = originalPath.split("/").pop() || originalPath;
  const siteFileName = applySiteImagePrefix(fileName, sitePrefix);
  return appendAssetVersion(`${basePath.replace(/\/$/, "")}/${siteFileName}`, sitePrefix);
}
