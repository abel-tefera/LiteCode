import React, { useEffect, useRef } from "react";
import { useTypedSelector } from "../../../state/hooks";
import { getOutput } from "../../../state/features/bundler/bundlerSlice";

const preview = `
  <html>
    <head></head>
    <body>
      <div id="root"></div>
      <script>
        const handleError = (err) => {
          const root = document.querySelector('#root');
          root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
          console.error(err);
        }

        window.addEventListener('error', (e) => {
          e.preventDefault();
          console.error(e.message);
          handleError(e.error);
        });

        window.addEventListener('message', (e) => {
          try{
            eval(e.data);
          }catch(err){
            handleError(err);
          }
        }, false);

      </script>
    </body>
  </html>
`;

interface CodePreviewProps {
  code: string;
  err: string | null;
}

const CodePreview: React.FC = () => {
  const iframe = useRef<any>(null);
  const output = useTypedSelector(getOutput);

  useEffect(() => {
    if (output.code !== "") {
      iframe.current.srcdoc = preview;
      setTimeout(() => {
        iframe.current.contentWindow.postMessage(output.code, "*");
      }, 50);
    }
  }, [output]);

  return (
    <div
      className={`pl-1 w-full pt-10 pb-8 h-full`}
    >
      {output.err ? (
        <div className="preview-error" style={{ color: "red" }}>
          {output.err}
        </div>
      ) : (
        <div className="preview-wrapper w-full h-full">
          <iframe
            title="Code Preview"
            ref={iframe}
            srcDoc={preview}
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  );
};

export default CodePreview;
