import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { readFile, writeFile, rename, access } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve, basename } from "path";

import {
  deriveSlug,
  deriveScheme,
  validateName,
  validateBundleId,
  rewritePackageJson,
  rewriteAppJson,
  rewriteReadme,
} from "./rename-helpers.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

async function prompt(rl, question, validate, options = {}) {
  while (true) {
    const answer = await rl.question(question);
    const trimmed = answer.trim();
    if (trimmed === "" && options.default) {
      return options.default;
    }
    if (validate(trimmed)) {
      return trimmed;
    }
    console.log("  Invalid input, please try again.");
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const name = await prompt(rl, "Project name (e.g. My New App): ", validateName);
    const slug = deriveSlug(name);
    const scheme = deriveScheme(name);

    console.log(`\n  Derived slug:   ${slug}`);
    console.log(`  Derived scheme: ${scheme}\n`);

    const iosBundleId = await prompt(
      rl,
      "iOS bundle identifier (e.g. com.company.app): ",
      validateBundleId
    );

    const androidPackage = await prompt(
      rl,
      `Android package [default: ${iosBundleId}]: `,
      validateBundleId,
      { default: iosBundleId }
    );

    const parentDir = dirname(projectRoot);
    const oldFolderName = basename(projectRoot);
    const newFolderPath = resolve(parentDir, slug);

    try {
      await access(newFolderPath);
      console.log(
        `\nError: target folder "${slug}" already exists in ${parentDir}. Aborting before any files are changed.`
      );
      rl.close();
      return;
    } catch {
      // Folder doesn't exist — proceed
    }

    console.log("\nRewriting files...");

    const packageJsonPath = resolve(projectRoot, "package.json");
    const appJsonPath = resolve(projectRoot, "app.json");
    const readmePath = resolve(projectRoot, "README.md");

    const [packageJsonContent, appJsonContent, readmeContent] = await Promise.all([
      readFile(packageJsonPath, "utf-8"),
      readFile(appJsonPath, "utf-8"),
      readFile(readmePath, "utf-8"),
    ]);

    await writeFile(
      packageJsonPath,
      rewritePackageJson(packageJsonContent, slug),
      "utf-8"
    );
    await writeFile(
      appJsonPath,
      rewriteAppJson(appJsonContent, {
        name,
        slug,
        scheme,
        iosBundleId,
        androidPackage,
      }),
      "utf-8"
    );
    await writeFile(readmePath, rewriteReadme(readmeContent, name), "utf-8");

    console.log("  Rewrote package.json, app.json, README.md");

    await rename(projectRoot, newFolderPath);
    console.log(`\nRenamed folder: ${oldFolderName} → ${slug}`);

    console.log("\nAll done! Next steps:");
    console.log(`  cd ${slug}`);
    console.log("  pnpm install");
    console.log("  pnpm start");
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
