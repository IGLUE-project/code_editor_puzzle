import React, { useEffect, useState, useContext } from "react";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackLayout,
  useSandpack,
  SandpackTests,
} from "@codesandbox/sandpack-react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

 import { getTemplate } from "../constants/templates";
import CustomTestRunner from "./CustomTestRunner.jsx";
import { GlobalContext } from "./GlobalContext";

const SandPackEditor = (props) => {
  const { escapp, appSettings, Utils, I18n } = useContext(GlobalContext);    
  const [mounted, setMounted] = useState(false);
  const files = appSettings.files;
  const theme = appSettings.theme || "light";
  const selectedTheme = getTemplate(theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
 
  return (
    <div className="h-screen w-full" id="theeditor">
      
      <SandpackProvider
        files={files}
        theme={selectedTheme}
        customSetup={{ 
          entry: "/index.html",
          dependencies: { "jest-extended": "*" }
        }}
        template="static"
        options={{ 
          editorHeight: "100vh",
          visibleFiles: Object.keys(files).filter((file) => !files[file].hidden),
          initMode: "lazy",
          bundlerURL: undefined
        }} >

          
          {/* Bottom row: custom tests */}
         
        <div className="w-full" style={{ height: "60px" }}>    
        <CustomTestRunner checkSol={props.checkSol} sendSol={props.sendSol} />
         </div>  
        <PanelGroup direction="vertical" style={{ height: "calc(100vh - 60px)" }}>
          {/* Top row: code editor + preview */}
          <Panel defaultSize={90}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={45} minSize={20} className="overflow-hidden" style={{ height: "100%" }}>
                <SandpackCodeEditor 
                  showTabs 
                  showLineNumbers 
                  wrapContent 
                  style={{ height: "100%" }}
                />
              </Panel>
              <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-400 cursor-col-resize" />
              <Panel defaultSize={55} minSize={15} className="overflow-hidden" style={{ height: "100%" }}>
                <SandpackPreview 
                  showOpenInCodeSandbox={false} 
                  style={{ height: "100%" }} 
                  showRefreshButton={false}  
                />
              </Panel>
            </PanelGroup>
           
          </Panel>
          
        </PanelGroup>
      </SandpackProvider>
    </div>
  );
};

export default SandPackEditor;