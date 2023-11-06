import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "../styles/text-editor.css";

const TextEditor: React.FC = () => {
  const [value, setValue] = useState("**Hello world!!!**");
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <button onClick={() => setEditing(!editing)}>
        {editing ? "Preview" : "Edit"}
      </button>

      {editing ? (
        <MDEditor value={value} onChange={(v) => setValue(v || '')} className="text-editor" />
      ) : (
        <MDEditor.Markdown source={value} style={{ whiteSpace: "pre-wrap" }} />
      )}
    </div>
  );
};

export default TextEditor;
