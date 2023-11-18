import { unpkgPathPlugin } from "./plugins/unpkgPathPlugin";
import { fetchPlugin } from "./plugins/fetchPlugin";
import { getFiles } from "./data";
import { filePathResolver } from "./plugins/filePathResolver";

// For relative paths
// const tree = {
//   "/index.js":
//     'import App from "./src/App.js";\r\n\r\nconsole.log(App() + 10);\r\n',
//   "/src/App.js": "const App = () => 10;\r\n\r\nexport default App;",
// };

// For unpkg paths
// const tree = {
//   "/index.js":
//     'import axios from "axios";\r\n\r\naxios.get("https://jsonplaceholder.typicode.com/todos/1").then((res) => {\r\n  console.log("DATA", res);\r\n})\r\n',
// };
// // For Both
const tree = {
  "/index.js":
    'import axios from "axios";\r\n\r\nimport App from "./src/App.js";\r\n\r\nconsole.log(App() + 10);\r\n',
  "/src/App.js":
    "import tinyTestPkg from 'tiny-test-pkg';\r\n\r\nconst App = () => 10;\r\n\r\nexport default App;",
};

const bundle = async (serviceRef: any) => {
  try {
    // console.log("bundling ALL FILES", getFiles());
    const result = await serviceRef.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      // plugins: [filePathResolver(tree)],
      plugins: [filePathResolver(), unpkgPathPlugin(), fetchPlugin(getFiles())],
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
