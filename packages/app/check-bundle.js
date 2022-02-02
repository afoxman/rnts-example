#!/usr/bin/env node

const { argv } = require('process');
const { readFileSync } = require('fs');

if (argv.length !== 4) {
  throw new Error("Usage error: check-bundle <bundle-file> <expected-button-platform-extension>");
}
const bundleFile = argv[2];
const expectedButtonPlatformExtension = argv[3];

console.log("");
console.log("Verifying that bundle file \"" + bundleFile + "\" is using the \"" + expectedButtonPlatformExtension + "\" button implementation...");

const bundle = readFileSync(bundleFile, "utf-8");
const result = bundle.match(/buttonModuleExtension = "(.*)";/);
if (!result || result.length !== 2) {
  throw new Error("Failed to find 'buttonModuleExtension' variable in bundle file: " + bundleFile);
}
const buttonModuleExtension = result[1];
if (buttonModuleExtension !== expectedButtonPlatformExtension) {
  throw new Error(`Bundle contains the wrong button implementation (bundle has "${buttonModuleExtension}", expected "${expectedButtonPlatformExtension}")`)
}

console.log("Success!");
console.log("");
