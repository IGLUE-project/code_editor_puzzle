import { useSandpack } from "@codesandbox/sandpack-react";
import React, { useEffect, useState, useRef, useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import TestResultsModal from "./TestResultsModal";

// Custom Test Runner Component
const CustomTestRunner = (props) => {
  const { escapp, appSettings, Utils, I18n } = useContext(GlobalContext);    

  const { sandpack, listen } = useSandpack();
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef();
  const score = (testResults ? testResults.filter(r => r.status === 'passed').length : 0) / (testResults ? testResults.length : 1) ;

  useEffect(() => {
    const unsubscribe = listen((message) => {
      if (message.type === "console" && message.log) {
        const firstArg =
          Array.isArray(message.log) ? message.log[0].data : undefined;
         if (Array.isArray(firstArg) && typeof firstArg[0] === "string" && firstArg[0].startsWith("TEST_RESULT:")) {
          try {
             const json = firstArg[0].slice("TEST_RESULT:".length);
            const resultData = JSON.parse(json);
            setTestResults(resultData);
            props.checkSol(resultData);
            setIsRunning(false);
          } catch (e) {
            console.error("Failed to parse test results:", e);
          }
        } else if (typeof firstArg === "string" && firstArg.startsWith("TEST_ERROR:")) {
          setError(firstArg.slice("TEST_ERROR:".length));
          setIsRunning(false);
        }
         resetApp(false)
      }
    });

    unsubscribeRef.current = unsubscribe;
    return () => {
      unsubscribeRef.current?.();
    };
  }, [listen]);


  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    setTestResults(null);

    try {
      const testFiles = Object.keys(sandpack.files).filter(file => 
        file.includes('.test.') || file.includes('.spec.')
      );

      if (testFiles.length === 0) {
        setError('No test files found');
        setIsRunning(false);
        return;
      }

      // Create a test runner script that will be injected into the preview
      const testRunnerCode = generateTestRunnerCode(testFiles);
      
      // Add the test runner to the files temporarily
      const newFiles = {
        ...sandpack.files,
        '/test-runner.js': {
          code: testRunnerCode
        },
        '/index.html': {
          code: sandpack.files['/index.html'].code.replace(
            '</body>',
            '<script type="module" src="/test-runner.js"></script></body>'
          )
        }
      };

      // Update the files to trigger a reload with the test runner
      sandpack.updateFile('/test-runner.js', testRunnerCode);
      sandpack.updateFile('/index.html', newFiles['/index.html'].code);

      // Set a timeout in case tests don't respond
      setTimeout(() => {
        if (isRunning) {
          setError('Tests timed out after 10 seconds');
          setIsRunning(false);
        }
        resetApp(false)
      }, 10000);

    } catch (err) {
      setError(err.message);
      resetApp(false)
      setIsRunning(false);
    }

    
  };

  const generateTestRunnerCode = (testFiles) => {
    const testCodes = testFiles.map(file => sandpack.files[file].code).join('\n\n');
    
    return `
// Auto-generated test runner
(function() {
  const results = [];
  let testCount = 0;

  // Test framework functions
  window.test = function(name, testFn) {
    testCount++;
    try {
      testFn();
      results.push({
        name: name,
        status: 'passed',
        file: 'test file'
      });
    } catch (error) {
      results.push({
        name: name,
        status: 'failed',
        file: 'test file',
        error: error.message
      });
    }
  };

  window.expect = function(actual) {
    return {
      toBe: function(expected) {
        if (actual !== expected) {
          throw new Error(\`Expected \${expected} but got \${actual}\`);
        }
        return true;
      },
      toEqual: function(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(\`Expected \${JSON.stringify(expected)} but got \${JSON.stringify(actual)}\`);
        }
        return true;
      },
      toBeTruthy: function() {
        if (!actual) {
          throw new Error(\`Expected truthy value but got \${actual}\`);
        }
        return true;
      },
      toBeFalsy: function() {
        if (actual) {
          throw new Error(\`Expected falsy value but got \${actual}\`);
        }
        return true;
      },
      toContain: function(expected) {
        if (typeof actual === 'string' && !actual.includes(expected)) {
          throw new Error(\`Expected "\${actual}" to contain "\${expected}"\`);
        }
        if (Array.isArray(actual) && !actual.includes(expected)) {
          throw new Error(\`Expected array to contain \${expected}\`);
        }
        return true;
      }
    };
  };

  // Wait for DOM to be ready, then run tests
  function runAllTests() {
    try {
      // Execute test code
      ${testCodes}
      
      // Send results back via console
      console.log('TEST_RESULT:' + JSON.stringify(results));
    } catch (error) {
      console.log('TEST_ERROR:' + error.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    // DOM is already ready
    setTimeout(runAllTests, 100);
  }
})();
`;
  };

  const resetApp = (alsoContent = true) => {
    // Remove the test runner and restore original HTML
    const originalHtml = sandpack.files['/index.html'].code.replace(
      /<script type="module" src="\/test-runner\.js"><\/script>/g,
      ''
    );
    
    sandpack.updateFile('/index.html', originalHtml);
    sandpack.deleteFile('/test-runner.js');
    if (alsoContent) {
      setTestResults(null);
      setError(null);
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 CustomTestRunner" style={{height: "60px"}}>
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          
          <div className="flex gap-2 top-buttons" >
            <h1 className="maintitle">{appSettings.mainTitleText}</h1>
            <button
              onClick={resetApp}
              className="danger btn px-3 py-2 rounded-md text-gray-600 border border-gray-300 hover:bg-gray-50 text-sm"
            >
            {appSettings.resetAppText || I18n.getTrans("i.resetApp")}
            </button>
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`primary btn px-4 py-2 rounded-md text-white font-medium ${
                isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
              }`}
            >
              {isRunning ? (appSettings.runningButtonText || I18n.getTrans("i.runningTests")) : (appSettings.runButtonText || I18n.getTrans("i.runTests"))}
            </button>
          </div>
        </div>
        
       
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        {testResults && <TestResultsModal
          open={Boolean(testResults)}
          onClose={() => setTestResults(null)}
          testResults={testResults}
          sendSol={()=>props.sendSol(testResults)}
          appSettings={appSettings}
          I18n={I18n}
        />}
        
        
      </div>
    </div>
  );
};
export default CustomTestRunner;