import * as esbuild from "esbuild-wasm";

const startService =  (() => {
    let esBuildRef: any;
    return async() => {
        if (esBuildRef) {
            return esBuildRef
        } else {
            await esbuild.initialize({
                worker: true,
                wasmURL: "https://unpkg.com/esbuild-wasm/esbuild.wasm"
            });
            esBuildRef = esbuild;
            return esBuildRef;
        }
    }
})()

export default startService;