import type * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";
import Path from "path-browserify";
import { store } from "../../state/store";

const packageCache = localforage.createInstance({
  name: "packcagecache",
});

export const fetchPlugin = (tree: Record<string, string>) => {
  const map = new Map(Object.entries(tree));
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /^\/index\.js$/ }, (args: esbuild.OnLoadArgs) => {
        // const ext = Path.extname(args.path)
        const contents = map.get(`${args.path}`);
        return {
          loader: "jsx",
          contents,
        };
      });
      build.onLoad({ filter: /.css$/ }, async (args: esbuild.OnLoadArgs) => {
        let dataGlobal: string = "";
        let requestGlobal;
        if (!map.has(args.path)) {
          const { data, request } = await axios.get(args.path);
          dataGlobal = data;
          requestGlobal = request;
        } else {
          dataGlobal = map.get(args.path)!;
        }

        const escaped = dataGlobal
          .replace(/\n/g, "")
          .replace(/\r/g, "")
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
          resolveDir: !map.has(args.path)
            ? new URL("./", requestGlobal.responseURL).pathname
            : "",
        };

        if (!map.has(args.path)) {
          await packageCache.setItem(args.path, res);
        }

        return res;
      });
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        const cachedResult = await packageCache.getItem<esbuild.OnLoadResult>(
          args.path,
        );

        if (cachedResult) {
          return cachedResult;
        } else if (map.has(args.path)) {
          const ext = Path.extname(args.path);
          const contents = map.get(args.path)!;
          const loader = "jsx";
          return { contents, loader };
        } else if (!args.path.includes("unpkg.com")) {
          throw new Error(
            `The file ${args.path} could not be found in the virtual file system.`,
          );
        }
      });

      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        if (!store.getState().bundler.isLoading) {
          store.dispatch({ type: "bundler/setIsLoading", payload: true });
        }
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
