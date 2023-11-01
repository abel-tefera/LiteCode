import { useState, useEffect, useRef } from "react";
import startService from "./plugins/startService";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";
import CodeEditor from "./components/CodeEditor";
import { OnChange as MonacoOnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";

const App = () => {
  const [input, setInput] = useState("");
  // const [code, setCode] = useState("");

  const ref = useRef<any>(null);
  const iframe = useRef<any>(null);

  useEffect(() => {
    async function serviceStart() {
      const serviceRef = await startService();
      ref.current = serviceRef;
    }
    serviceStart();
  }, []);

  const onClick = () => {
    if (!ref.current) return;

    iframe.current.srcdoc = preview;

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
        // setCode(result.outputFiles[0].text);
        iframe.current.contentWindow.postMessage(
          result.outputFiles[0].text,
          "*"
        );
      });
  };

  const preview = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (e) => {
          try{
            eval(e.data);
          }catch(err){
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
            console.error(err);
          }
          }, false);
        </script>
      </body>
    </html>
`;

  const onEditorChange: MonacoOnChange = (
    value: string | undefined,
    e: editor.IModelContentChangedEvent
  ) => {
    if (value) {
      setInput(value);
    }
  };

  return (
    <div className="App">
      <h1>XYZ Code</h1>
      <CodeEditor initialValue="console.log(123);" onChange={onEditorChange} />
      <textarea
        cols={60}
        rows={10}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      {/* <pre>{code}</pre> */}
      <iframe
        ref={iframe}
        srcDoc={preview}
        title="Code Preview"
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default App;
