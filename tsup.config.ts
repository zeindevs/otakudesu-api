import { Options } from "tsup";

export const tsup: Options = {
    target: "es6",
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    external: [],
    dts: true,
    clean: true,
    sourcemap: false,
    splitting: false,
    bundle: true,
    minify: true
};