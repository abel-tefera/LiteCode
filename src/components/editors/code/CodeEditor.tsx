import React, { useRef, useCallback, useEffect } from "react";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTypedSelector } from "../../../state/hooks";
import { getCurrentEditor } from "../../../state/features/editor/editorSlice";
import Breadcrumbs from "../navigation/Breadcrumbs";
import { OnChange as MonacoOnChange } from "@monaco-editor/react";

import * as prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";

const options = {
  autoIndent: "full",
  contextmenu: true,
  fontFamily: "monospace",
  fontSize: 13,
  lineHeight: 24,
  hideCursorInOverviewRuler: true,
  matchBrackets: "always",
  minimap: {
    enabled: true,
  },
  scrollbar: {
    horizontalSliderSize: 4,
    verticalSliderSize: 18,
  },
  selectOnLineNumbers: true,
  roundedSelection: false,
  readOnly: false,
  cursorStyle: "line",
  automaticLayout: true,
};

type Monaco = typeof monaco;

interface CodeEditorProps {
  onChange: (value: string, id: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const editorData = useTypedSelector(getCurrentEditor);

  const handleEditorDidMount = useCallback(
    async (editor: editor.IStandaloneCodeEditor, monacoEditor: Monaco) => {
      editorRef.current = editor;
      monacoEditor.languages.registerDocumentFormattingEditProvider("javascript", {
        async provideDocumentFormattingEdits(model, options, token) {
          const text = await prettier.format(model.getValue(), {
            parser: "babel",
            plugins: [parserBabel, prettierPluginEstree],
            useTabs: false,
            semi: true,
            singleQuote: true,
          });

          return [
            {
              range: model.getFullModelRange(),
              text,
            },
          ];
        },
      });
      
      // monacoEditor.editor.defineTheme('ace', {
      //   base: 'vs',
      //   inherit: true,
      //   rules: [
      //     { token: '', foreground: '5c6773' },
      //     { token: 'invalid', foreground: 'ff3333' },
      //     { token: 'emphasis', fontStyle: 'italic' },
      //     { token: 'strong', fontStyle: 'bold' },
      //     { token: 'variable', foreground: '5c6773' },
      //     { token: 'variable.predefined', foreground: '5c6773' },
      //     { token: 'constant', foreground: 'f08c36' },
      //     { token: 'comment', foreground: 'abb0b6', fontStyle: 'italic' },
      //     { token: 'number', foreground: 'f08c36' },
      //     { token: 'number.hex', foreground: 'f08c36' },
      //     { token: 'regexp', foreground: '4dbf99' },
      //     { token: 'annotation', foreground: '41a6d9' },
      //     { token: 'type', foreground: '41a6d9' },
      //     { token: 'delimiter', foreground: '5c6773' },
      //     { token: 'delimiter.html', foreground: '5c6773' },
      //     { token: 'delimiter.xml', foreground: '5c6773' },
      //     { token: 'tag', foreground: 'e7c547' },
      //     { token: 'tag.id.jade', foreground: 'e7c547' },
      //     { token: 'tag.class.jade', foreground: 'e7c547' },
      //     { token: 'meta.scss', foreground: 'e7c547' },
      //     { token: 'metatag', foreground: 'e7c547' },
      //     { token: 'metatag.content.html', foreground: '86b300' },
      //     { token: 'metatag.html', foreground: 'e7c547' },
      //     { token: 'metatag.xml', foreground: 'e7c547' },
      //     { token: 'metatag.php', fontStyle: 'bold' },
      //     { token: 'key', foreground: '41a6d9' },
      //     { token: 'string.key.json', foreground: '41a6d9' },
      //     { token: 'string.value.json', foreground: '86b300' },
      //     { token: 'attribute.name', foreground: 'f08c36' },
      //     { token: 'attribute.value', foreground: '0451A5' },
      //     { token: 'attribute.value.number', foreground: 'abb0b6' },
      //     { token: 'attribute.value.unit', foreground: '86b300' },
      //     { token: 'attribute.value.html', foreground: '86b300' },
      //     { token: 'attribute.value.xml', foreground: '86b300' },
      //     { token: 'string', foreground: '86b300' },
      //     { token: 'string.html', foreground: '86b300' },
      //     { token: 'string.sql', foreground: '86b300' },
      //     { token: 'string.yaml', foreground: '86b300' },
      //     { token: 'keyword', foreground: 'f2590c' },
      //     { token: 'keyword.json', foreground: 'f2590c' },
      //     { token: 'keyword.flow', foreground: 'f2590c' },
      //     { token: 'keyword.flow.scss', foreground: 'f2590c' },
      //     { token: 'operator.scss', foreground: '666666' }, //
      //     { token: 'operator.sql', foreground: '778899' }, //
      //     { token: 'operator.swift', foreground: '666666' }, //
      //     { token: 'predefined.sql', foreground: 'FF00FF' }, //
      //   ],
      //   colors: {
      //     'editor.background': '#fafafa',
      //     'editor.foreground': '#5c6773',
      //     'editorIndentGuide.background': '#ecebec',
      //     'editorIndentGuide.activeBackground': '#e0e0e0',
      //   },
      // });
      // monacoEditor.editor.setTheme('ace');

    },
    []
  );

  const onChangeLocal: MonacoOnChange = (
    value: string | undefined,
    e: editor.IModelContentChangedEvent
  ) => {
    if (value) {
      onChange(editorData.id, value);
    }
  };
  // const formatCode = async () => {
  //   if (!editorRef.current) return;
  //   const unformatted = editorRef.current.getValue();
  //   const formatted = await prettier.format(unformatted, {
  //     parser: "babel",
  //     plugins: [parserBabel, prettierPluginEstree],
  //     useTabs: false,
  //     semi: true,
  //     singleQuote: true,
  //   });
  //   formatted.replace(/\n$/, "");
  //   editorRef.current.setValue(formatted);
  // };

  return (
    <div className="editor-wrapper pl-2 pr-0">
      {/* <button
        onClick={formatCode}
        className="button button-format is-primary is-small"
      >
        Format
      </button> */}
      <Breadcrumbs
        editorObj={{
          id: editorData.id,
          path: editorData.path,
          unmappedPath: editorData.unmappedPath,
        }}
      />

      <MonacoEditor
        path={editorData.id}
        defaultLanguage={editorData.language}
        defaultValue={editorData.content}
        line={editorData.line}
        theme="vs-dark"
        language={editorData.language}
        height={"100%"}
        width={"100%"}
        options={{
          // wordWrap: "on",
          minimap: { enabled: true },
          showUnused: true,
          // folding: true,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: true,
          automaticLayout: true,
          tabSize: 2,
        }}
        onChange={onChangeLocal}
        onMount={handleEditorDidMount}
        beforeMount={(monaco) => {
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
            jsx: 4,
          });
          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
            jsx: 4,
          });

          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
          });
          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
          });
          monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
            true
          );
          monaco.languages.typescript.javascriptDefaults.setEagerModelSync(
            true
          );
        }}
        onValidate={(markers) => {
          // console.log("ONVALIDATE", markers);
        }}
      />
    </div>
  );
};

export default CodeEditor;
