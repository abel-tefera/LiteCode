import { unpkgPathPlugin } from "./plugins/unpkgPathPlugin";
import { fetchPlugin } from "./plugins/fetchPlugin";
import { getFiles } from "./data";
import { filePathPlugin } from "./plugins/filePathPlugin";

const bundle = async (serviceRef: any) => {
  try {
    const result = await serviceRef.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [filePathPlugin(), unpkgPathPlugin(), fetchPlugin(getFiles())],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });
    return { code: result.outputFiles[0].text as string, err: "" };
  } catch (err: any) {
    return { code: "", err: err.message as string };
  }
};

export default bundle;
