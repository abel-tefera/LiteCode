import React, { useEffect, useRef } from "react";

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

const CodePreview: React.FC<CodePreviewProps> = ({ code, err }) => {
  const iframe = useRef<any>(null);

  useEffect(() => {
    if (code !== "") {
      iframe.current.srcdoc = preview;
      setTimeout(() => {
        iframe.current.contentWindow.postMessage(code, "*");
      }, 50);
    }
  }, [code]);

  return (
    <div className="pl-1 h-full w-full">
      {err ? (
        <div className="preview-error" style={{ color: "red" }}>
          {err}
        </div>
      ) : (
        <div className="preview-wrapper h-full w-full">
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
