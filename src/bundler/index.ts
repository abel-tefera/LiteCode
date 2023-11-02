import { unpkgPathPlugin } from "./plugins/unpkgPathPlugin";
import { fetchPlugin } from "./plugins/fetchPlugin";

const bundle = async (serviceRef: any, rawCode: string) => {
  try {
    const result = await serviceRef.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });
    return { code: result.outputFiles[0].text, err: null };
  } catch (err: any) {
    return { code: "", err: err.message };
  }
};

export default bundle;
