import React, { useEffect, useRef } from "react";

const preview = `
  <html>
    <head></head>
    <body>
      <div id="root"></div>
      <script>
        window.addEventListener('message', (e) => {
        try{
          console.log("EVALUATING");
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

interface CodePreviewProps {
  code: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code }) => {
  const iframe = useRef<any>(null);

  useEffect(() => {
    if (code !== "") {
      iframe.current.srcdoc = preview;
      iframe.current.contentWindow.postMessage(code, "*");
    }
  }, [code]);

  return (
    <div className="preview-wrapper">
      <iframe
        title="Code Preview"
        ref={iframe}
        srcDoc={preview}
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default CodePreview;
