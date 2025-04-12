import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["esm"], // ✅ ESM output only
    target: "node20", // ✅ Or whatever you're using (minimum node version)
    dts: true,
    external: [
        "fs",
        "path",
        "dotenv",
        "gray-matter",
        "@reflink/reflink",
        "@node-llama-cpp",
        "https",
        "http",
        "agentkeepalive",
        "zod"
    ]
});
