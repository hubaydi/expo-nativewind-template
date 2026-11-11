export function deriveSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deriveScheme(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function validateName(name) {
  return name.trim().length > 0;
}

// Android applicationId forbids hyphens and digit-leading segments; iOS tolerates
// more, but one prompt feeds both platforms, so take the intersection.
export function validateBundleId(id) {
  return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(id);
}

export function rewritePackageJson(content, slug) {
  const pkg = JSON.parse(content);
  pkg.name = slug;
  return JSON.stringify(pkg, null, 2) + "\n";
}

export function rewriteAppJson(
  content,
  { name, slug, scheme, iosBundleId, androidPackage }
) {
  const config = JSON.parse(content);
  config.expo.name = name;
  config.expo.slug = slug;
  config.expo.scheme = scheme;
  if (!config.expo.ios) config.expo.ios = {};
  config.expo.ios.bundleIdentifier = iosBundleId;
  if (!config.expo.android) config.expo.android = {};
  config.expo.android.package = androidPackage;
  return JSON.stringify(config, null, 2) + "\n";
}

export function rewriteReadme(content, name) {
  return content.replace(/^# .*/m, `# ${name}`);
}
