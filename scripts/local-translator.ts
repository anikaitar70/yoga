import { chunkForMyMemory, type PlainTranslator } from "../src/lib/translate-server";

/**
 * Offline EN->JA via NLLB-200 (distilled 600M, int8) on CPU. First use downloads ~600MB to the HF cache.
 * Script-only on purpose: onnxruntime is native and must stay out of the Next bundle.
 */
export async function createLocalTranslator(): Promise<PlainTranslator> {
  const { pipeline } = await import("@huggingface/transformers");
  console.log("[local-translate] loading model (first run downloads ~600MB)...");
  const nllb = await pipeline("translation", "Xenova/nllb-200-distilled-600M", { dtype: "q8" });

  return async (text) => {
    const parts: string[] = [];
    for (const chunk of chunkForMyMemory(text.trim())) {
      const out = (await nllb(chunk, { src_lang: "eng_Latn", tgt_lang: "jpn_Jpan" } as never)) as Array<{
        translation_text: string;
      }>;
      const t = out[0]?.translation_text?.trim();
      if (!t) return null;
      parts.push(t);
    }
    return parts.join("");
  };
}
