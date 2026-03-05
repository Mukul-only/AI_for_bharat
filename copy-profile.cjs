const fs = require("fs");
const path = require("path");

function copyDirStatus(src, dest) {
  try {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`Copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Error copying ${src}:`, err.message);
  }
}

fs.mkdirSync(path.join(__dirname, "src/styles"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "src/components/ui"), { recursive: true });

copyDirStatus(
  path.join(__dirname, "profile/src/styles/theme.css"),
  path.join(__dirname, "src/styles/theme.css"),
);
copyDirStatus(
  path.join(__dirname, "profile/src/styles/tailwind.css"),
  path.join(__dirname, "src/styles/tailwind.css"),
);
copyDirStatus(
  path.join(__dirname, "profile/src/app/components/ui"),
  path.join(__dirname, "src/components/ui"),
);
copyDirStatus(
  path.join(__dirname, "profile/src/app/components/profile"),
  path.join(__dirname, "src/components/profile"),
);

console.log("Copy script completed.");
