import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  deriveSlug,
  deriveScheme,
  validateName,
  validateBundleId,
  rewritePackageJson,
  rewriteAppJson,
  rewriteReadme,
} from "./rename-helpers.mjs";

describe("deriveSlug", () => {
  it("converts display name to kebab-case", () => {
    assert.equal(deriveSlug("My New App"), "my-new-app");
  });

  it("handles extra spaces and mixed case", () => {
    assert.equal(deriveSlug("  My   Cool  APP  "), "my-cool-app");
  });

  it("strips non-alphanumeric characters", () => {
    assert.equal(deriveSlug("App! @#$Version 2"), "app-version-2");
  });

  it("handles single word", () => {
    assert.equal(deriveSlug("Calculator"), "calculator");
  });
});

describe("deriveScheme", () => {
  it("lowercases and strips non-alphanumerics", () => {
    assert.equal(deriveScheme("My New App"), "mynewapp");
  });

  it("handles extra spaces and special chars", () => {
    assert.equal(deriveScheme("  App! v2.0  "), "appv20");
  });
});

describe("validateName", () => {
  it("rejects empty string", () => {
    assert.equal(validateName(""), false);
  });

  it("rejects whitespace-only string", () => {
    assert.equal(validateName("   "), false);
  });

  it("accepts non-empty string", () => {
    assert.equal(validateName("My App"), true);
  });
});

describe("validateBundleId", () => {
  it("accepts standard reverse-DNS", () => {
    assert.equal(validateBundleId("com.company.myapp"), true);
  });

  it("accepts underscores in segments", () => {
    assert.equal(validateBundleId("com.my_company.app"), true);
  });
  it("rejects hyphens", () => {
    assert.equal(validateBundleId("com.my-company.app"), false);
  });
  it("rejects double dots", () => {
    assert.equal(validateBundleId("com..app"), false);
  });
  it("rejects uppercase", () => {
    assert.equal(validateBundleId("Com.MyApp"), false);
  });
  it("rejects digit-leading segment", () => {
    assert.equal(validateBundleId("com.1app"), false);
  });

  it("rejects missing dot", () => {
    assert.equal(validateBundleId("myapp"), false);
  });

  it("rejects leading dot", () => {
    assert.equal(validateBundleId(".com.myapp"), false);
  });

  it("rejects spaces", () => {
    assert.equal(validateBundleId("com. my app"), false);
  });
});

describe("rewritePackageJson", () => {
  it("replaces the name field and preserves structure", () => {
    const input = JSON.stringify({
      name: "expo-nativewind-template",
      version: "1.0.0",
      scripts: { start: "expo start" },
    });
    const result = JSON.parse(rewritePackageJson(input, "my-new-app"));
    assert.equal(result.name, "my-new-app");
    assert.equal(result.version, "1.0.0");
    assert.equal(result.scripts.start, "expo start");
  });

  it("outputs with trailing newline", () => {
    const input = '{"name":"old"}';
    const result = rewritePackageJson(input, "new");
    assert.equal(result.endsWith("\n"), true);
  });
});

describe("rewriteAppJson", () => {
  const input = JSON.stringify({
    expo: {
      name: "expo-nativewind-template",
      slug: "expo-nativewind-template",
      scheme: "exonativewindtemplate",
      version: "1.0.0",
      ios: { supportsTablet: true },
      android: { adaptiveIcon: { backgroundColor: "#E6F4FE" } },
    },
  });

  it("sets name, slug, scheme, bundle ids", () => {
    const result = JSON.parse(
      rewriteAppJson(input, {
        name: "My New App",
        slug: "my-new-app",
        scheme: "mynewapp",
        iosBundleId: "com.example.myapp",
        androidPackage: "com.example.myapp",
      })
    );
    assert.equal(result.expo.name, "My New App");
    assert.equal(result.expo.slug, "my-new-app");
    assert.equal(result.expo.scheme, "mynewapp");
    assert.equal(result.expo.ios.bundleIdentifier, "com.example.myapp");
    assert.equal(result.expo.android.package, "com.example.myapp");
  });

  it("preserves existing fields", () => {
    const result = JSON.parse(
      rewriteAppJson(input, {
        name: "My New App",
        slug: "my-new-app",
        scheme: "mynewapp",
        iosBundleId: "com.example.myapp",
        androidPackage: "com.example.myapp",
      })
    );
    assert.equal(result.expo.version, "1.0.0");
    assert.equal(result.expo.ios.supportsTablet, true);
    assert.equal(result.expo.android.adaptiveIcon.backgroundColor, "#E6F4FE");
  });

  it("creates ios/android objects if missing", () => {
    const minimalInput = JSON.stringify({ expo: { name: "old" } });
    const result = JSON.parse(
      rewriteAppJson(minimalInput, {
        name: "New",
        slug: "new",
        scheme: "new",
        iosBundleId: "com.example.new",
        androidPackage: "com.example.new",
      })
    );
    assert.equal(result.expo.ios.bundleIdentifier, "com.example.new");
    assert.equal(result.expo.android.package, "com.example.new");
  });

  it("outputs with trailing newline", () => {
    const result = rewriteAppJson(input, {
      name: "Test",
      slug: "test",
      scheme: "test",
      iosBundleId: "com.test.app",
      androidPackage: "com.test.app",
    });
    assert.equal(result.endsWith("\n"), true);
  });
});

describe("rewriteReadme", () => {
  it("replaces the first H1 line", () => {
    const input = "# expo-nativewind-template\n\nSome content\n# Another heading\n";
    const result = rewriteReadme(input, "My New App");
    assert.equal(result, "# My New App\n\nSome content\n# Another heading\n");
  });

  it("only replaces the first H1", () => {
    const input = "# Old Name\n\n## Section\n# Second H1\n";
    const result = rewriteReadme(input, "New Name");
    assert.equal(result, "# New Name\n\n## Section\n# Second H1\n");
  });
});
