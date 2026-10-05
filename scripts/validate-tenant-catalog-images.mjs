import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const TENANTS_DIR = path.join(ROOT_DIR, "data", "tenants");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function toLocalPathFromPublicUrl(publicUrlPath) {
  if (!publicUrlPath.startsWith("/")) {
    return null;
  }

  return path.join(ROOT_DIR, "public", publicUrlPath.replace(/^\//, "").replace(/\//g, path.sep));
}

function normalizeFileNameWithTenantPrefix(fileName, tenantPrefix) {
  if (!tenantPrefix) {
    return fileName;
  }

  const prefixedPattern = /^[^_]+_(.+\.[A-Za-z0-9]+)$/;
  const match = fileName.match(prefixedPattern);
  if (!match) {
    return fileName;
  }

  return `${tenantPrefix}_${match[1]}`;
}

function parseTenantsFromFolders() {
  if (!fs.existsSync(TENANTS_DIR)) {
    return [];
  }

  const tenantFolders = fs
    .readdirSync(TENANTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const tenants = [];

  for (const folder of tenantFolders) {
    const tenantConfigFile = path.join(TENANTS_DIR, folder, "tenantConfig.ts");
    if (!fs.existsSync(tenantConfigFile)) {
      continue;
    }

    const content = readText(tenantConfigFile);
    const readField = (regex, fallback = "") => {
      const m = content.match(regex);
      return m ? m[1] : fallback;
    };

    const slug = readField(/slug:\s*"([^"]+)"/, folder);
    tenants.push({
      slug,
      imageBasePath: readField(/imageBasePath:\s*"([^"]+)"/),
      imageFilePrefix: readField(/imageFilePrefix:\s*"([^"]+)"/, slug),
      catalogFile: path.join(TENANTS_DIR, folder, "catalogProducts.ts"),
    });
  }

  return tenants;
}

function parseCatalogTemplateFileNames(content) {
  const imagePathMatches = [...content.matchAll(/\/images\/catalog\/([^\"'`\s)]+)\b/g)];
  const fileNames = new Set();

  for (const match of imagePathMatches) {
    fileNames.add(match[1]);
  }

  return [...fileNames].sort();
}

function parseCliArgs(argv) {
  const tenantArg = argv.find((arg) => arg.startsWith("--tenant="));
  return {
    tenant: tenantArg ? tenantArg.replace("--tenant=", "") : "",
  };
}

function main() {
  const { tenant } = parseCliArgs(process.argv.slice(2));
  const tenants = parseTenantsFromFolders();

  if (tenants.length === 0) {
    console.error("[validate:tenant-images] No se detectaron tenants en data/tenants/*/tenantConfig.ts");
    process.exit(1);
  }

  const templateCatalogFile = tenants.find((t) => fs.existsSync(t.catalogFile))?.catalogFile;
  if (!templateCatalogFile) {
    console.error("[validate:tenant-images] No se detecto ningun catalogProducts.ts en data/tenants/*");
    process.exit(1);
  }

  const templateFileNames = parseCatalogTemplateFileNames(readText(templateCatalogFile));

  if (templateFileNames.length === 0) {
    console.error("[validate:tenant-images] No se detectaron rutas de imagenes en catalogProducts.ts del tenant base");
    process.exit(1);
  }

  const selectedTenants = tenant ? tenants.filter((item) => item.slug === tenant) : tenants;
  if (tenant && selectedTenants.length === 0) {
    console.error(`[validate:tenant-images] Tenant no encontrado: ${tenant}`);
    process.exit(1);
  }

  const remoteBasePaths = [];
  const missingByTenant = [];

  for (const tenantEntry of selectedTenants) {
    if (!tenantEntry.imageBasePath) {
      missingByTenant.push({
        slug: tenantEntry.slug,
        errors: ["Falta catalog.imageBasePath en tenantConfig"],
      });
      continue;
    }

    if (/^https?:\/\//i.test(tenantEntry.imageBasePath)) {
      remoteBasePaths.push({
        slug: tenantEntry.slug,
        basePath: tenantEntry.imageBasePath,
      });
      continue;
    }

    const localBasePath = toLocalPathFromPublicUrl(tenantEntry.imageBasePath);
    if (!localBasePath || !fs.existsSync(localBasePath)) {
      missingByTenant.push({
        slug: tenantEntry.slug,
        errors: [`No existe el directorio base: ${tenantEntry.imageBasePath}`],
      });
      continue;
    }

    const missingFiles = [];
    for (const templateFileName of templateFileNames) {
      const resolvedFileName = normalizeFileNameWithTenantPrefix(
        templateFileName,
        tenantEntry.imageFilePrefix,
      );
      const resolvedPath = path.join(localBasePath, resolvedFileName);
      if (!fs.existsSync(resolvedPath)) {
        missingFiles.push(`${tenantEntry.imageBasePath}/${resolvedFileName}`);
      }
    }

    if (missingFiles.length > 0) {
      missingByTenant.push({
        slug: tenantEntry.slug,
        errors: missingFiles,
      });
    }
  }

  if (remoteBasePaths.length > 0) {
    console.warn("[validate:tenant-images] Aviso: tenants con basePath remoto detectado (validación local omitida):");
    for (const item of remoteBasePaths) {
      console.warn(`  - ${item.slug}: ${item.basePath}`);
    }
  }

  if (missingByTenant.length > 0) {
    console.error("\n[validate:tenant-images] FALLO: se detectaron imágenes faltantes:\n");
    for (const tenantError of missingByTenant) {
      console.error(`Tenant: ${tenantError.slug}`);
      tenantError.errors.slice(0, 30).forEach((err) => console.error(`  - ${err}`));
      if (tenantError.errors.length > 30) {
        console.error(`  ... y ${tenantError.errors.length - 30} más`);
      }
      console.error("");
    }
    process.exit(1);
  }

  console.log(
    `[validate:tenant-images] OK: ${selectedTenants.length} tenant(s) validados, ${templateFileNames.length} imágenes de catálogo por tenant.`
  );
}

main();