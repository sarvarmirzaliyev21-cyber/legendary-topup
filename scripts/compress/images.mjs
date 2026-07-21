import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import path from "path";

const DIR = path.join(process.cwd(), "public", "games");
const MAX_WIDTH = 1200;

async function run() {
  const files = await readdir(DIR);
  const images = files.filter((f) => /\.(jpe?g|png)$/i.test(f));

  console.log(`Найдено картинок: ${images.length}\n`);

  for (const file of images) {
    const filePath = path.join(DIR, file);
    const before = (await stat(filePath)).size;

    const buffer = await sharp(filePath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .toBuffer();

    const ext = path.extname(file).toLowerCase();
    let output;

    if (ext === ".png") {
      output = await sharp(buffer).png({ quality: 80, compressionLevel: 9 }).toBuffer();
    } else {
      output = await sharp(buffer).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
    }

    await sharp(output).toFile(filePath + ".tmp");
    const fs = await import("fs/promises");
    await fs.rename(filePath + ".tmp", filePath);

    const after = (await stat(filePath)).size;
    const beforeKb = (before / 1024).toFixed(0);
    const afterKb = (after / 1024).toFixed(0);
    const saved = (100 - (after / before) * 100).toFixed(0);

    console.log(`${file}: ${beforeKb} КБ → ${afterKb} КБ (−${saved}%)`);
  }

  console.log("\nГотово!");
}

run().catch(console.error);