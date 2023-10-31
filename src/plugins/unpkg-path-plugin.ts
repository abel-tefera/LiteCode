import * as esbuild from "esbuild-wasm";
import axios from "axios";

export const unpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log("onResolve", args);
        if (args.path !== "index.js") {
          if (args.path.includes("./") || args.path.includes("../")) {
            return {
              namespace: "a",
              path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`)
                .href,
            };
          }
          return {
            path: `https://unpkg.com/${args.path}`,
            namespace: "a",
          };
        }
        return { path: args.path, namespace: "a" };
      });
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log("onLoad", args);
        if (args.path === "index.js") {
          return {
            loader: "jsx",
            contents: `
              import React from 'react@17.0.2';
              console.log(React);
            `,
          };
        }

        const { data, request } = await axios.get(args.path);

        return {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };
      });
    },
  };
};
