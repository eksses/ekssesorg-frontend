import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.join(__dirname, "../fonts");
const fontPath = path.join(fontDir, "NotoSansBengali.ttf");

if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

const url = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/unhinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf";

console.log("Downloading Noto Sans Bengali font...");

const file = fs.createWriteStream(fontPath);
https.get(url, function(response) {
  response.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Font downloaded and saved to:", fontPath);
  });
}).on("error", (err) => {
  fs.unlink(fontPath, () => {});
  console.error("Error downloading font:", err.message);
});
