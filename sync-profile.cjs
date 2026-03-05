const fs = require("fs");
const path = require("path");

const src = path.join(
  __dirname,
  "orofile",
  "Untitled",
  "src",
  "app",
  "components",
  "profile",
);
const dest = path.join(__dirname, "src", "components", "profile");

const files = fs.readdirSync(src);
let copied = 0;
for (const file of files) {
  const srcFile = path.join(src, file);
  const destFile = path.join(dest, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied: ${file}`);
  copied++;
}
console.log(`\nDone! ${copied} files copied to src/components/profile/`);
console.log("ProfileWrapper.jsx was preserved (not in orofile source).");
