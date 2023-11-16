import * as esbuild from "esbuild-wasm";
import Path from "path-browserify";

export const filePathResolver = (
  tree: Record<string, string>
): esbuild.Plugin => {
  const map = new Map(Object.entries(tree));
  return {
    name: "filePathResolver",
    setup: (build: esbuild.PluginBuild) => {
      build.onResolve({ filter: /.*/ }, (args: esbuild.OnResolveArgs) => {
        console.log("ARGS", args);
        if (args.kind === "entry-point") {
          return { path: "/" + args.path };
        }
        if (args.kind === "import-statement") {

          const dirname = Path.dirname(args.importer)
          const path = Path.join(dirname, args.path)
          return { path }
        }
        throw Error("not resolvable");
      });

      build.onLoad({ filter: /.*/ }, (args: esbuild.OnLoadArgs) => {
        if (!map.has(args.path)) {
          throw Error("not loadable");
        }

        const ext = Path.extname(args.path)
        const contents = map.get(args.path)!;
        const loader =
          // @ts-ignore
          ext === ".ts"
            ? "ts"
            : // @ts-ignore

            ext === ".tsx"
            ? "tsx"
            : // @ts-ignore
            ext === ".js"
            ? "js"
            : // @ts-ignore
            ext === ".jsx"
            ? "jsx"
            : "default";
        return { contents, loader };
      });
    },
  };
};

// -----------------------------------------------------------
// Example
// -----------------------------------------------------------

// await esbuild.initialize({ wasmURL: 'esbuild.wasm' })

// const tree = {

//     '/util/encode.ts': `

//         export function encode(data: string): Uint8Array {

//             return new Uint8Array(1)
//         }
//     `,
//     '/lib/foo.ts': `

//         import { encode } from '../util/encode.ts'

//         export function foo() {

//            return encode('foo')
//         }
//     `,
//     '/lib/bar.ts': `

//         import { encode } from '../util/encode.ts'

//         export function bar() {

//            return encode('bar')
//         }
//     `,
//     '/lib/index.ts': `

//         export * from './foo.ts'

//         export * from './bar.ts'
//     `,
//     '/index.ts': `

//         import { foo, bar } from './lib/index.ts'

//         foo()

//         bar()
//     `
// }

// const result = await esbuild.build({
//     entryPoints: ['index.ts'],
//     plugins: [customResolver(tree)],
//     bundle: true,
//     write: false,
// })

// const decoder = new TextDecoder()

// console.log(decoder.decode(result.outputFiles[0].contents));

// outputs: (() => {
//     // util/encode.ts
//     function encode(data) {
//         return new Uint8Array(1);
//     }

//     // lib/foo.ts
//     function foo() {
//         return encode("foo");
//     }

//     // lib/bar.ts
//     function bar() {
//         return encode("bar");
//     }

//     // index.ts
//     foo();
//     bar();
// })();
