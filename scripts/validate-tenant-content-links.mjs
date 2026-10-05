import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const TENANTS_DIR = path.join(ROOT_DIR, "data", "tenants");

const AUDIT_PATHS = [
  "app",
  "components",
  "services",
  "lib",
  "providers",
  "middleware.ts",
];

const FILE_EXT_RE = /\.(ts|tsx|js|mjs)$/i;
const URL_RE = /^https:\/\//i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^\d{10,15}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const LEGACY_MARKERS = [
  "cielitodeflores",
  "pedidos_cielitodeflores",
  "10demayo",
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseCliArgs(argv) {
  const tenantArg = argv.find((arg) => arg.startsWith("--tenant="));
  return {
    tenant: tenantArg ? tenantArg.replace("--tenant=", "") : "",
  };
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
      key: slug,
      slug,
      businessName: readField(/businessName:\s*"([^"]+)"/),
      publicSiteUrl: readField(/publicSiteUrl:\s*"([^"]+)"/),
      email: readField(/email:\s*"([^"]+)"/),
      whatsapp: readField(/whatsapp:\s*"([^"]+)"/),
      maps: readField(/maps:\s*"([^"]+)"/),
      facebook: readField(/facebook:\s*"([^"]+)"/),
      instagram: readField(/instagram:\s*"([^"]+)"/),
      tiktok: readField(/tiktok:\s*"([^"]+)"/),
      siteDataFile: path.join(TENANTS_DIR, folder, "siteData.ts"),
    });
  }

  return tenants;
}

function collectFilesRecursively(startPath) {
  const absPath = path.join(ROOT_DIR, startPath);
  if (!fs.existsSync(absPath)) {
    return [];
  }

  const stat = fs.statSync(absPath);
  if (stat.isFile()) {
    return FILE_EXT_RE.test(absPath) ? [absPath] : [];
  }

  const out = [];
  for (const entry of fs.readdirSync(absPath, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") {
      continue;
    }

    const nextRel = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFilesRecursively(nextRel));
    } else if (FILE_EXT_RE.test(entry.name)) {
      out.push(path.join(ROOT_DIR, nextRel));
    }
  }

  return out;
}

function validateTenantFields(tenant) {
  const errors = [];

  if (!SLUG_RE.test(tenant.slug)) {
    errors.push(`slug invalido: ${tenant.slug || "(vacio)"}`);
  }
  if (!tenant.businessName) {
    errors.push("businessName vacio");
  }
  if (!URL_RE.test(tenant.publicSiteUrl)) {
    errors.push(`publicSiteUrl invalido: ${tenant.publicSiteUrl || "(vacio)"}`);
  }
  if (!EMAIL_RE.test(tenant.email)) {
    errors.push(`email invalido: ${tenant.email || "(vacio)"}`);
  }
  if (!WHATSAPP_RE.test(tenant.whatsapp)) {
    errors.push(`whatsapp invalido (solo digitos 10-15): ${tenant.whatsapp || "(vacio)"}`);
  }

  const linkFields = [
    ["maps", tenant.maps],
    ["facebook", tenant.facebook],
    ["instagram", tenant.instagram],
    ["tiktok", tenant.tiktok],
  ];

  for (const [name, value] of linkFields) {
    if (!URL_RE.test(value || "")) {
      errors.push(`${name} invalido: ${value || "(vacio)"}`);
    }
  }

  return errors;
}

function auditSiteDataDynamicLinks(siteDataContent) {
  const errors = [];
  const requiredSnippets = [
    "publicSiteBaseUrl: tenant.publicSiteUrl",
    "maps: tenant.contact.maps",
    "facebook: tenant.social.facebook",
    "instagram: tenant.social.instagram",
    "whatsappCatalogBase: tenantWhatsappBase",
  ];

  for (const snippet of requiredSnippets) {
    if (!siteDataContent.includes(snippet)) {
      errors.push(`siteData sin binding dinamico esperado: ${snippet}`);
    }
  }

  return errors;
}

function auditRuntimeHardcodes(tenants, tenantFilter) {
  const files = AUDIT_PATHS.flatMap((p) => collectFilesRecursively(p));
  const selectedTenants = tenantFilter
    ? tenants.filter((t) => t.slug === tenantFilter)
    : tenants;

  const perTenantTokens = selectedTenants.flatMap((tenant) => {
    const compactBusinessName = (tenant.businessName || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

    return [tenant.slug.toLowerCase(), compactBusinessName].filter(Boolean);
  });

  const forbiddenTokens = [...new Set([...LEGACY_MARKERS, ...perTenantTokens])];
  const findings = [];

  for (const filePath of files) {
    const normalized = filePath.replace(/\\/g, "/");
    if (
      normalized.startsWith(`${ROOT_DIR.replace(/\\/g, "/")}/data/tenants/`) ||
      normalized.endsWith("/data/tenantConfig.ts")
    ) {
      continue;
    }

    const content = readText(filePath);
    const lower = content.toLowerCase();
    for (const token of forbiddenTokens) {
      if (!token) {
        continue;
      }
      if (lower.includes(token)) {
        findings.push({
          filePath,
          token,
        });
      }
    }
  }

  return findings;
}

function main() {
  const { tenant } = parseCliArgs(process.argv.slice(2));
  const tenants = parseTenantsFromFolders();
  if (tenants.length === 0) {
    console.error("[validate:tenant-content-links] No se detectaron tenants en data/tenants/*/tenantConfig.ts");
    process.exit(1);
  }

  if (tenant && !tenants.some((t) => t.slug === tenant)) {
    console.error(`[validate:tenant-content-links] Tenant no encontrado: ${tenant}`);
    process.exit(1);
  }

  const selectedTenants = tenant ? tenants.filter((t) => t.slug === tenant) : tenants;
  const tenantErrors = [];
  for (const tenantEntry of selectedTenants) {
    const errors = validateTenantFields(tenantEntry);
    if (errors.length > 0) {
      tenantErrors.push({ slug: tenantEntry.slug, errors });
    }
  }

  const siteDataErrors = selectedTenants.flatMap((tenantEntry) => {
    if (!fs.existsSync(tenantEntry.siteDataFile)) {
      return [`${tenantEntry.slug}: falta siteData.ts en carpeta del tenant`];
    }

    const content = readText(tenantEntry.siteDataFile);
    const errors = auditSiteDataDynamicLinks(content);
    return errors.map((err) => `${tenantEntry.slug}: ${err}`);
  });
  const hardcodeFindings = auditRuntimeHardcodes(tenants, tenant);

  if (tenantErrors.length > 0 || siteDataErrors.length > 0 || hardcodeFindings.length > 0) {
    console.error("\n[validate:tenant-content-links] FALLO: inconsistencias detectadas.\n");

    for (const item of tenantErrors) {
      console.error(`Tenant: ${item.slug}`);
      item.errors.forEach((err) => console.error(`  - ${err}`));
      console.error("");
    }

    if (siteDataErrors.length > 0) {
      console.error("siteData:");
      siteDataErrors.forEach((err) => console.error(`  - ${err}`));
      console.error("");
    }

    if (hardcodeFindings.length > 0) {
      console.error("Hardcodes en runtime:");
      hardcodeFindings.slice(0, 100).forEach((finding) => {
        const rel = path.relative(ROOT_DIR, finding.filePath).replace(/\\/g, "/");
        console.error(`  - ${rel} contiene token '${finding.token}'`);
      });
      if (hardcodeFindings.length > 100) {
        console.error(`  ... y ${hardcodeFindings.length - 100} mas`);
      }
      console.error("");
    }

    process.exit(1);
  }

  console.log(
    `[validate:tenant-content-links] OK: ${selectedTenants.length} tenant(s) con links/textos validados y sin hardcodes en runtime.`
  );
}

main();