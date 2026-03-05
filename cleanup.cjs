const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "src/components/profile");
const filesToRemove = [
  "AccountSection.jsx",
  "AppSettingsSection.jsx",
  "ContentPrefsSection.jsx",
  "ProfilePage.jsx",
  "UsageStatsSection.jsx",
  "UserInfoSection.jsx",
];

for (const f of filesToRemove) {
  try {
    const fullPath = path.join(dir, f);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("Deleted", f);
    }
  } catch (err) {
    console.error("Failed to delete", f, err);
  }
}
console.log("Cleanup finished.");
