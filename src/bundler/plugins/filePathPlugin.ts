import type * as esbuild from "esbuild-wasm";
import Path from "path-browserify";

export const filePathPlugin = (): esbuild.Plugin => {
  return {
    name: "filePathPlugin",
    setup: (build: esbuild.PluginBuild) => {
      build.onResolve(
        { filter: /^(\.\.|\.)(\/.*)?$/ },
        (args: esbuild.OnResolveArgs) => {
          if (
            args.kind === "import-statement" &&
            !args.importer.includes("unpkg.com")
          ) {
            // console.log("LOCAL IMPORT", args);
            const dirname = Path.dirname(args.importer);
            const path = Path.join(dirname, args.path);
            return { path, namespace: "a" };
          }
        },
      );
    },
  };
};
