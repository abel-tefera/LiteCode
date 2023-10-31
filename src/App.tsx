import { useState, useEffect, useRef } from "react";
import startService from "./plugins/startService";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

const App = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const ref = useRef<any>(null);

  useEffect(() => {
    async function serviceStart() {
      const serviceRef = await startService();
      ref.current = serviceRef;
    }
    serviceStart();
  }, []);

  const onClick = () => {
    if (!ref.current) return;

    ref.current
      .build({
        entryPoints: ["index.js"],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin(), fetchPlugin(input)],
        define: {
          "process.env.NODE_ENV": '"production"',
          global: "window",
        },
      })
      .then((result: any) => {
        setCode(result.outputFiles[0].text);
      });
  };

  return (
    <div className="App">
      <h1>XYZ Code</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Subimt</button>
      </div>
      <pre>{code}</pre>
    </div>
  );
};

export default App;
