import type * as esbuild from 'esbuild-wasm'

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup (build: esbuild.PluginBuild) {
      // Handle root entry file of 'index.js'
      build.onResolve({ filter: /^index\.js$/ }, (args) => {
        // console.log("UNPKG ON RESOLVE INDEX", args)
        return { path: '/index.js', namespace: 'a' }
      })

      // Handle relative paths in a module
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        // console.log("UNPKG ON RESOLVE RELATIVE", args)
        return {
          namespace: 'a',
          path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href
        }
      })

      // Handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        // console.log("UNPKG ON RESOLVE MAIN", args)
        return {
          path: `https://unpkg.com/${args.path}`,
          namespace: 'a'
        }
      })
    }
  }
}
