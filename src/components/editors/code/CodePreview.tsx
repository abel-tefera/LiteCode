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
          root.innerHTML = '<div style="display: flex; width: 100%; height: 100%; background-color: white; align-items: flex-start; justify-content: center;"><div style="display: flex;flex-direction: column;justify-content: center;align-items: center;width: 24rem;height: fit-content;padding: 1.25rem;margin-top: 1.5rem;"><div style="display: flex;flex-direction: row;align-items: center;justify-content: space-evenly;width: 100%;"><span style="width: 2rem; height: 2rem;   background-size: contain;background-repeat: no-repeat;background-position-y: center; background-image: url("../assets/error.png");"></span><h4 style="color: rgb(239 68 68);font-size: 1.125rem;line-height: 1.75rem;font-weight: 600;">An Error has occured when running your script</h4></div><p style="color: rgb(239 68 68); margin-top: 1rem; margin-left: 1rem;">' + err + '</p></div></div>';
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
    <div className={`pl-1 w-full mt-10 h-[82%]`}>
      {output.err ? (
        <div className="flex w-full h-full bg-white items-start justify-center">
          <div className="flex flex-col justify-center items-center w-96 h-fit p-5 shadow-md mt-6">
            <div className="flex flex-row items-center justify-evenly w-full">
              <span className="span-logo w-8 h-8 error-logo"></span>
              <h4 className="text-red-500 text-lg font-semibold">
                An Error has occured during bundling
              </h4>
            </div>
            <p className="text-red-500 mt-4 ml-4">{output.err}</p>
          </div>
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
