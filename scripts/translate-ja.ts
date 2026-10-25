/**
 * One-off: fill every empty Japanese field from English (manual JA is never overwritten).
 * Run: npm run db:translate-ja            (MyMemory API, daily quota)
 *      npm run db:translate-ja -- --local (offline NLLB model, no quota)
 */
import { translateMissingJaFields } from "../src/lib/ja-auto";

async function main() {
  const local = process.argv.includes("--local");
  const translate = local ? await (await import("./local-translator")).createLocalTranslator() : undefined;
  const { count, errors } = await translateMissingJaFields(translate);
  console.log(`Updated ${count} record(s).`);
  if (errors.length) console.log(`${errors.length} field(s) skipped:\n- ${errors.join("\n- ")}`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
