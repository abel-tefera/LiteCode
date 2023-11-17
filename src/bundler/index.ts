import { unpkgPathPlugin } from "./plugins/unpkgPathPlugin";
import { fetchPlugin } from "./plugins/fetchPlugin";
import { getFiles } from "./data";
import { filePathResolver } from "./plugins/filePathResolver";

const tree = {
  "/index.js":
    'import {num as yes} from "./yes/yes.js";\r\n\r\nconst sum = 10 + 10 + yes;\r\n\r\ndocument.body.innerHTML = `${sum}`',
  "/yes/yes.js":
    "const num = 50;\r\n\r\nexport {num};\r\n\r\n// export default 100;",
};

const bundle = async (serviceRef: any) => {
  try {
    // console.log("bundling ALL FILES", getFiles());
    const result = await serviceRef.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [filePathResolver(tree)],
      // @ts-ignore
      // plugins: [unpkgPathPlugin(), fetchPlugin(tree)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
      jsxFactory: '_React.createElement',
      jsxFragment: '_React.Fragment',
    });
    return { code: result.outputFiles[0].text, err: null };
  } catch (err: any) {
    return { code: "", err: err.message };
  }
};

export default bundle;
