import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const packageCache = localforage.createInstance({
  name: "packcagecache",
});

export const fetchPlugin = (tree: Record<string, string>) => {
  const map = new Map(Object.entries(tree));
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /^index\.js$/ }, (args: esbuild.OnLoadArgs) => {
        console.log("FETCH INDEX", args);
        return {
          loader: "jsx",
          contents: 'code',
        };
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log("DOT SLASH checking if cache");
        const cachedResult = await packageCache.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (cachedResult) {
          return cachedResult;
        }
      });

      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        console.log("css importing unpkg");
        const { data, request } = await axios.get(args.path);

        const escaped = data
          .replace(/\n/g, "")
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");

        const contents = `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style);
        `;

        const res: esbuild.OnLoadResult = {
          loader: "jsx",
          contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await packageCache.setItem(args.path, res);
        return res;
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log("DOT SLASH importing unpkg");
        const { data, request } = await axios.get(args.path);

        const res: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await packageCache.setItem(args.path, res);
        return res;
      });
    },
  };
};
