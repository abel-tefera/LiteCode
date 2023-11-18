import * as esbuild from "esbuild-wasm";
import Path from "path-browserify";

export const filePathResolver = (
): esbuild.Plugin => {
  return {
    name: "filePathResolver",
    setup: (build: esbuild.PluginBuild) => {
      build.onResolve(
        { filter: /^\.\/?\w+/ },
        (args: esbuild.OnResolveArgs) => {
          console.log("ARGS", args);
          // if (args.kind === "entry-point") {
          //   return { path: "/" + args.path, namespace: "a" };
          // }
          if (args.kind === "import-statement") {
            console.log("LOCAL IMPORT STATEMENT STATEMENT", args);
            const dirname = Path.dirname(args.importer);
            const path = Path.join(dirname, args.path);
            return { path, namespace: "a" };
          }
          // throw Error("not resolvable");
        }
      );

      // build.onLoad({ filter: /^\.\/?\w+/ }, (args: esbuild.OnLoadArgs) => {

      // });
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
