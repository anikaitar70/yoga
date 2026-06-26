declare module "sharp" {
  interface SharpInstance {
    rotate(): SharpInstance;
    clone(): SharpInstance;
    resize(options: {
      width?: number;
      height?: number;
      fit?: string;
      withoutEnlargement?: boolean;
    }): SharpInstance;
    webp(options?: { quality?: number; effort?: number }): SharpInstance;
    png(): SharpInstance;
    metadata(): Promise<{ width?: number; height?: number }>;
    toBuffer(): Promise<Buffer>;
  }

  function sharp(
    input?: string | Buffer | ArrayBuffer | Uint8Array,
    options?: {
      failOn?: "none" | "truncated" | "error" | "warning";
      sequentialRead?: boolean;
      limitInputPixels?: number;
    },
  ): SharpInstance;

  export default sharp;
}
