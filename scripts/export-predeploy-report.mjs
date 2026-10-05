import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const TENANTS_DIR = path.join(ROOT_DIR, "data", "tenants");

const DEFAULT_OUTPUT = path.join("reports", "predeploy-audit-report.json");
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

const LEGACY_MARKERS = ["cielitodeflores", "pedidos_cielitodeflores", "10demayo"];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeJson(filePath, data) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(ROOT_DIR, filePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return abs;
}

function parseCliArgs(argv) {
  const tenantArg = argv.find((arg) => arg.startsWith("--tenant="));
  const outputArg = argv.find((arg) => arg.startsWith("--output="));

  return {
    tenant: tenantArg ? tenantArg.replace("--tenant=", "") : "",
    output: outputArg ? outputArg.replace("--output=", "") : DEFAULT_OUTPUT,
  };
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
      imageBasePath: readField(/imageBasePath:\s*"([^"]+)"/),
      imageFilePrefix: readField(/imageFilePrefix:\s*"([^"]+)"/, slug),
      siteDataFile: path.join(TENANTS_DIR, folder, "siteData.ts"),
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

function makeFinding({ severity, category, tenantSlug, code, message, filePath }) {
  const finding = { severity, category, code, message };
  if (tenantSlug) {
    finding.tenantSlug = tenantSlug;
  }
  if (filePath) {
    finding.filePath = filePath.replace(/\\/g, "/");
  }
  return finding;
}

function auditImages(selectedTenants, templateFileNames) {
  const findings = [];

  for (const tenant of selectedTenants) {
    if (!tenant.imageBasePath) {
      findings.push(
        makeFinding({
          severity: "error",
          category: "images",
          tenantSlug: tenant.slug,
          code: "MISSING_IMAGE_BASE_PATH",
          message: "Falta catalog.imageBasePath en tenantConfig",
        }),
      );
      continue;
    }

    if (/^https?:\/\//i.test(tenant.imageBasePath)) {
      findings.push(
        makeFinding({
          severity: "warning",
          category: "images",
          tenantSlug: tenant.slug,
          code: "REMOTE_IMAGE_BASE_PATH",
          message: `Base path remoto detectado, validacion local omitida: ${tenant.imageBasePath}`,
        }),
      );
      continue;
    }

    const localBasePath = toLocalPathFromPublicUrl(tenant.imageBasePath);
    if (!localBasePath || !fs.existsSync(localBasePath)) {
      findings.push(
        makeFinding({
          severity: "error",
          category: "images",
          tenantSlug: tenant.slug,
          code: "IMAGE_BASE_DIR_NOT_FOUND",
          message: `No existe el directorio base: ${tenant.imageBasePath}`,
        }),
      );
      continue;
    }

    for (const templateFileName of templateFileNames) {
      const resolvedFileName = normalizeFileNameWithTenantPrefix(
        templateFileName,
        tenant.imageFilePrefix,
      );
      const resolvedPath = path.join(localBasePath, resolvedFileName);
      if (!fs.existsSync(resolvedPath)) {
        findings.push(
          makeFinding({
            severity: "error",
            category: "images",
            tenantSlug: tenant.slug,
            code: "MISSING_TENANT_IMAGE",
            message: `Imagen faltante: ${tenant.imageBasePath}/${resolvedFileName}`,
          }),
        );
      }
    }
  }

  return findings;
}

function validateTenantFields(tenant) {
  const findings = [];

  if (!SLUG_RE.test(tenant.slug)) {
    findings.push(
      makeFinding({
        severity: "error",
        category: "content-links",
        tenantSlug: tenant.slug,
        code: "INVALID_SLUG",
        message: `slug invalido: ${tenant.slug || "(vacio)"}`,
      }),
    );
  }

  if (!tenant.businessName) {
    findings.push(
      makeFinding({
        severity: "error",
        category: "content-links",
        tenantSlug: tenant.slug,
        code: "MISSING_BUSINESS_NAME",
        message: "businessName vacio",
      }),
    );
  }

  if (!URL_RE.test(tenant.publicSiteUrl)) {
    findings.push(
      makeFinding({
        severity: "error",
        category: "content-links",
        tenantSlug: tenant.slug,
        code: "INVALID_PUBLIC_SITE_URL",
        message: `publicSiteUrl invalido: ${tenant.publicSiteUrl || "(vacio)"}`,
      }),
    );
  }

  if (!EMAIL_RE.test(tenant.email)) {
    findings.push(
      makeFinding({
        severity: "error",
        category: "content-links",
        tenantSlug: tenant.slug,
        code: "INVALID_EMAIL",
        message: `email invalido: ${tenant.email || "(vacio)"}`,
      }),
    );
  }

  if (!WHATSAPP_RE.test(tenant.whatsapp)) {
    findings.push(
      makeFinding({
        severity: "error",
        category: "content-links",
        tenantSlug: tenant.slug,
        code: "INVALID_WHATSAPP",
        message: `whatsapp invalido (solo digitos 10-15): ${tenant.whatsapp || "(vacio)"}`,
      }),
    );
  }

  const linkFields = [
    ["maps", tenant.maps],
    ["facebook", tenant.facebook],
    ["instagram", tenant.instagram],
    ["tiktok", tenant.tiktok],
  ];

  for (const [name, value] of linkFields) {
    if (!URL_RE.test(value || "")) {
      findings.push(
        makeFinding({
          severity: "error",
          category: "content-links",
          tenantSlug: tenant.slug,
          code: `INVALID_${String(name).toUpperCase()}_URL`,
          message: `${name} invalido: ${value || "(vacio)"}`,
        }),
      );
    }
  }

  return findings;
}

function auditSiteDataDynamicLinks(siteDataContent, siteDataFilePath, tenantSlug) {
  const requiredSnippets = [
    "publicSiteBaseUrl: tenant.publicSiteUrl",
    "maps: tenant.contact.maps",
    "facebook: tenant.social.facebook",
    "instagram: tenant.social.instagram",
    "whatsappCatalogBase: tenantWhatsappBase",
  ];

  const findings = [];
  for (const snippet of requiredSnippets) {
    if (!siteDataContent.includes(snippet)) {
      findings.push(
        makeFinding({
          severity: "error",
          category: "content-links",
          tenantSlug,
          code: "MISSING_DYNAMIC_SITE_DATA_BINDING",
          message: `siteData sin binding dinamico esperado: ${snippet}`,
          filePath: path.relative(ROOT_DIR, siteDataFilePath),
        }),
      );
    }
  }

  return findings;
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
      if (token && lower.includes(token)) {
        findings.push(
          makeFinding({
            severity: "error",
            category: "hardcode",
            code: "FORBIDDEN_TOKEN_IN_RUNTIME",
            message: `Token prohibido detectado: ${token}`,
            filePath: path.relative(ROOT_DIR, filePath),
          }),
        );
      }
    }
  }

  return findings;
}

function statusFromFindings(findings) {
  return findings.some((f) => f.severity === "error") ? "fail" : "pass";
}

function summarizeFindings(findings) {
  return findings.reduce(
    (acc, finding) => {
      if (finding.severity === "error") acc.errors += 1;
      if (finding.severity === "warning") acc.warnings += 1;
      if (finding.severity === "info") acc.infos += 1;
      return acc;
    },
    { errors: 0, warnings: 0, infos: 0 },
  );
}

function buildTenantBreakdown(selectedTenants, findings) {
  return selectedTenants.map((tenant) => {
    const tenantFindings = findings.filter((f) => f.tenantSlug === tenant.slug);
    const summary = summarizeFindings(tenantFindings);
    return {
      slug: tenant.slug,
      status: tenantFindings.some((f) => f.severity === "error") ? "fail" : "pass",
      summary,
      findings: tenantFindings,
    };
  });
}

function main() {
  const { tenant, output } = parseCliArgs(process.argv.slice(2));
  const tenants = parseTenantsFromFolders();
  if (tenants.length === 0) {
    console.error("[audit:predeploy:json] No se detectaron tenants en data/tenants/*/tenantConfig.ts");
    process.exit(1);
  }

  const selectedTenants = tenant ? tenants.filter((t) => t.slug === tenant) : tenants;
  if (tenant && selectedTenants.length === 0) {
    console.error(`[audit:predeploy:json] Tenant no encontrado: ${tenant}`);
    process.exit(1);
  }

  const templateCatalogFile = tenants.find((t) => fs.existsSync(t.catalogFile))?.catalogFile;
  const templateFileNames = templateCatalogFile
    ? parseCatalogTemplateFileNames(readText(templateCatalogFile))
    : [];
  const imageFindings = auditImages(selectedTenants, templateFileNames);
  const tenantFieldFindings = selectedTenants.flatMap((t) => validateTenantFields(t));
  const siteDataFindings = selectedTenants.flatMap((tenantEntry) => {
    if (!fs.existsSync(tenantEntry.siteDataFile)) {
      return [
        makeFinding({
          severity: "error",
          category: "content-links",
          tenantSlug: tenantEntry.slug,
          code: "MISSING_SITE_DATA_FILE",
          message: "falta siteData.ts en carpeta del tenant",
          filePath: path.relative(ROOT_DIR, tenantEntry.siteDataFile),
        }),
      ];
    }

    return auditSiteDataDynamicLinks(
      readText(tenantEntry.siteDataFile),
      tenantEntry.siteDataFile,
      tenantEntry.slug,
    );
  });
  const hardcodeFindings = auditRuntimeHardcodes(tenants, tenant);
  const contentLinkFindings = [...tenantFieldFindings, ...siteDataFindings, ...hardcodeFindings];

  const allFindings = [...imageFindings, ...contentLinkFindings];
  const audits = {
    images: {
      status: statusFromFindings(imageFindings),
      templateImageCount: templateFileNames.length,
      summary: summarizeFindings(imageFindings),
      findings: imageFindings,
    },
    contentLinks: {
      status: statusFromFindings(contentLinkFindings),
      summary: summarizeFindings(contentLinkFindings),
      findings: contentLinkFindings,
    },
  };

  const report = {
    meta: {
      generatedAt: new Date().toISOString(),
      workspace: ROOT_DIR,
      tenantFilter: tenant || null,
      generator: "scripts/export-predeploy-report.mjs",
      schemaVersion: "1.0.0",
    },
    summary: {
      status: statusFromFindings(allFindings),
      tenantsAudited: selectedTenants.length,
      ...summarizeFindings(allFindings),
    },
    audits,
    tenants: buildTenantBreakdown(selectedTenants, allFindings),
  };

  const outputPath = writeJson(output, report);

  const statusLabel = report.summary.status === "pass" ? "OK" : "FALLO";
  console.log(
    `[audit:predeploy:json] ${statusLabel}: reporte generado en ${outputPath}`,
  );
  console.log(
    `[audit:predeploy:json] tenants=${report.summary.tenantsAudited} errors=${report.summary.errors} warnings=${report.summary.warnings} infos=${report.summary.infos}`,
  );

  if (report.summary.status === "fail") {
    process.exit(1);
  }
}

main();