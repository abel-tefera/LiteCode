import { useState, useEffect, useRef } from "react";
import startService from "./plugins/startService";

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

    ref.current.transform(input, {
      loader: "jsx",
      target: "es2015",
    }).then((result: any) => {
      setCode(result.code);
    })
    
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
