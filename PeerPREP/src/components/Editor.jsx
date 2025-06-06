import React, { useState, useEffect, useRef } from 'react';
import { Play, Copy, RotateCcw } from 'lucide-react';
import ACTIONS from '../Actions';
import { Modal } from './Modal';


const Editor = ({socketRef, roomId}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  
  const editorRef = useRef(null);
  const cmInstance = useRef(null);

  const languages = [
    { 
      id: 'javascript', 
      name: 'JavaScript', 
      mode: 'javascript',
      sample: 'class Solution {\n    main() {\n        console.log("Hello World!");\n    }\n}\n\nconst solution = new Solution();\nsolution.main();' 
    },
    { 
      id: 'python', 
      name: 'Python', 
      mode: 'python',
      sample: 'class Solution:\n    def main(self):\n        print("Hello World!")\n\nif __name__ == "__main__":\n    solution = Solution()\n    solution.main()' 
    },
    { 
      id: 'java', 
      name: 'Java', 
      mode: 'text/x-java',
      sample: 'class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}' 
    },
    { 
      id: 'cpp', 
      name: 'C++', 
      mode: 'text/x-c++src',
      sample: '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void main() {\n        cout << "Hello World!" << endl;\n    }\n};\n\nint main() {\n    Solution solution;\n    solution.main();\n    return 0;\n}' 
    },
    { 
      id: 'c', 
      name: 'C', 
      mode: 'text/x-csrc',
      sample: '#include <stdio.h>\n\nint main() {\n    printf("Hello World!\\n");\n    return 0;\n}' 
    },
    { 
      id: 'csharp', 
      name: 'C#', 
      mode: 'text/x-csharp',
      sample: 'using System;\n\nclass Solution\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Hello World!");\n    }\n}' 
    },
    { 
      id: 'php', 
      name: 'PHP', 
      mode: 'php',
      sample: '<?php\nclass Solution {\n    public function main() {\n        echo "Hello World!\\n";\n    }\n}\n\n$solution = new Solution();\n$solution->main();\n?>' 
    },
    { 
      id: 'ruby', 
      name: 'Ruby', 
      mode: 'ruby',
      sample: 'class Solution\n  def main\n    puts "Hello World!"\n  end\nend\n\nsolution = Solution.new\nsolution.main' 
    },
    { 
      id: 'go', 
      name: 'Go', 
      mode: 'go',
      sample: 'package main\n\nimport "fmt"\n\ntype Solution struct{}\n\nfunc (s Solution) main() {\n    fmt.Println("Hello World!")\n}\n\nfunc main() {\n    solution := Solution{}\n    solution.main()\n}' 
    },
    { 
      id: 'rust', 
      name: 'Rust', 
      mode: 'rust',
      sample: 'struct Solution;\n\nimpl Solution {\n    fn main(&self) {\n        println!("Hello World!");\n    }\n}\n\nfn main() {\n    let solution = Solution;\n    solution.main();\n}' 
    }
  ];

  // Initialize CodeMirror
  useEffect(() => {
    const initCodeMirror = async () => {
      // Load CodeMirror CSS
      if (!document.querySelector('link[href*="codemirror"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css';
        document.head.appendChild(cssLink);
        
        // Load theme CSS
        const themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet';
        themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material-darker.min.css';
        document.head.appendChild(themeLink);
      }

      // Load CodeMirror JS
      if (!window.CodeMirror) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });

        // Load language modes
        const modes = [
          'javascript/javascript.min.js',
          'python/python.min.js',
          'clike/clike.min.js',
          'php/php.min.js',
          'ruby/ruby.min.js',
          'go/go.min.js',
          'rust/rust.min.js'
        ];

        for (const mode of modes) {
          await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = `https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/${mode}`;
            script.onload = resolve;
            document.head.appendChild(script);
          });
        }

        // Load addons
        const addons = [
          'edit/closebrackets.min.js',
          'edit/matchbrackets.min.js',
          'fold/foldcode.min.js',
          'fold/foldgutter.min.js',
          'fold/brace-fold.min.js',
          'fold/indent-fold.min.js'
        ];

        for (const addon of addons) {
          await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = `https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/${addon}`;
            script.onload = resolve;
            document.head.appendChild(script);
          });
        }

        // Load fold gutter CSS
        const foldCssLink = document.createElement('link');
        foldCssLink.rel = 'stylesheet';
        foldCssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldgutter.min.css';
        document.head.appendChild(foldCssLink);
      }

      // Initialize CodeMirror instance
      if (editorRef.current && !cmInstance.current) {
        const language = languages.find(lang => lang.id === selectedLanguage);
        
        cmInstance.current = window.CodeMirror(editorRef.current, {
          value: language?.sample || '',
          mode: language?.mode || 'javascript',
          theme: 'material-darker',
          lineNumbers: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          indentUnit: 4,
          indentWithTabs: false,
          lineWrapping: false,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Tab": function(cm) {
              if (cm.somethingSelected()) {
                cm.indentSelection("add");
              } else {
                cm.replaceSelection("    ");
              }
            }
          }
        });

        cmInstance.current.on('change', (instance,changes) => {
          console.log('changes', changes);
          const {origin} = changes;
          setCode(instance.getValue());
          const code1 = instance.getValue();
          
          if(origin !== 'setValue') {
            socketRef.current.emit(ACTIONS.CODE_CHANGE,{
              roomId,
              code1,
            })
          }
          console.log(instance.getValue());
        });

        

        setEditorInstance(cmInstance.current);
        setCode(language?.sample ||'');


        
      }


      // editorRef.current.on('change',(instance,changes)=>{
      //   console.log('changes', changes);
      // })
    };

    initCodeMirror();
  }, []);

  useEffect(()=>{
    if(socketRef.current){
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({code1}) => {
          if(code1  !== null){
            cmInstance.current.setValue(code1);
            setCode(code1);
          }
      })
      socketRef.current.on(ACTIONS.INPUT_CHANGE, ({ input }) => {
        if (input !== null) setInput(input);
      });
      socketRef.current.on(ACTIONS.OUTPUT_CHANGE, ({ output }) => {
        if (output !== null) setOutput(output);
      });



      


    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
        socketRef.current.off(ACTIONS.INPUT_CHANGE);
        socketRef.current.off(ACTIONS.OUTPUT_CHANGE);
      }
    }
  },[socketRef.current])

  useEffect(() => {
    const language = languages.find(lang => lang.id === selectedLanguage);
    if (language && cmInstance.current) {
      cmInstance.current.setValue(language.sample);
      cmInstance.current.setOption('mode', language.mode);
      setCode(language.sample);
    }
  }, [selectedLanguage]);

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');

    // Map your language IDs to Judge0 language_id
    const languageIdMap = {
      javascript: 63, // Node.js
      python: 71,
      java: 62,
      cpp: 54,
      c: 50,
      csharp: 51,
      php: 68,
      ruby: 72,
      go: 60,
      rust: 73
    };

    const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false';
    const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';
    const JUDGE0_API_KEY = 'c0cb065ec1msh83cf8ba84091a9ep142f99jsnfa5b99c78363'; // <-- Replace with your RapidAPI key

    try {
      const language_id = languageIdMap[selectedLanguage];
      if (!language_id) {
        setOutput('Selected language is not supported by Judge0.');
        setIsRunning(false);
        return;
      }

      // Encode code and input to base64
      const encode = (str) => window.btoa(unescape(encodeURIComponent(str)));

      // Submit code to Judge0
      const response = await fetch(JUDGE0_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Host': JUDGE0_API_HOST,
          'X-RapidAPI-Key': JUDGE0_API_KEY
        },
        body: JSON.stringify({
          source_code: encode(cmInstance.current ? cmInstance.current.getValue() : code),
          stdin: encode(input),
          language_id
        })
      });

      const data = await response.json();
      const token = data.token;

      // Poll for result
      let result = null;
      for (let i = 0; i < 20; i++) {
        await new Promise(res => setTimeout(res, 1500));
        const res = await fetch(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Host': JUDGE0_API_HOST,
              'X-RapidAPI-Key': JUDGE0_API_KEY
            }
          }
        );
        const resData = await res.json();
        if (resData.status && resData.status.id >= 3) {
          result = resData;
          break;
        }
      }

      // Decode base64 output
      const decode = (str) => str ? decodeURIComponent(escape(window.atob(str))) : '';
      var decodedOutput = '';
      if (!result) {
        setOutput('Timed out waiting for Judge0 response.');
      } else if (result.stdout) {
        //setOutput(decode(result.stdout));



        //Experimental: sync output with clients
        decodedOutput = decode(result.stdout);
       
        
        //experiment end



      } else if (result.compile_output) {
        decodedOutput='Compilation Error:\n' + decode(result.compile_output);
      } else if (result.stderr) {
        decodedOutput='Runtime Error:\n' + decode(result.stderr);
      } else {
        decodedOutput='No output.';
      }
      setOutput(decodedOutput);
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.OUTPUT_CHANGE, {
          roomId,
          output: decodedOutput,
        });
      }
    } catch (err) {
      decodedOutput = 'Error running code: ' + err.message;
      setOutput(decodedOutput);
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.OUTPUT_CHANGE, {
          roomId,
          output: decodedOutput,
        });
      }
    }

    


    setIsRunning(false);
  };

  const handleCopyCode = () => {
    const codeContent = cmInstance.current ? cmInstance.current.getValue() : code;
    navigator.clipboard.writeText(codeContent);
  };

  const handleResetCode = () => {
    const language = languages.find(lang => lang.id === selectedLanguage);
    if (language && cmInstance.current) {
      cmInstance.current.setValue(language.sample);
      setCode(language.sample);
    }
  };

  const handleClearOutput = () => {
    setOutput('');

    
  };

  // Question Overlay "Modal"
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="language-selector">
          <label htmlFor="language-select">Language:</label>
          <select 
            id="language-select"
            value={selectedLanguage} 
            onChange={handleLanguageChange}
            className="language-dropdown"
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="editor-actions">

          {/* Question button */}


          <button onClick={()=>{setShowModal(true)}}>Question</button>


          <button 
            onClick={handleCopyCode}
            className="action-btn copy-btn"
            title="Copy Code"
          >
            <Copy size={16} />
            copy code
          </button>
          <button 
            onClick={handleResetCode}
            className="action-btn reset-btn"
            title="Reset Code"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button 
            onClick={handleRunCode}
            disabled={isRunning}
            className="run-btn"
          >
            <Play size={16} />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="code-section">
          <div className="section-header">
            <h3>Code Editor</h3>
          </div>
          <div 
            ref={editorRef}
            className="codemirror-container"
          />
        </div>

        <div className="io-section">
          <div className="input-section">
            <div className="section-header">
              <h3>Input</h3>
            </div>
            <textarea
              value={input}
              onChange={(e) => {setInput(e.target.value)

                
                //Experimental: sync input with clients
                if (socketRef.current) {
                  socketRef.current.emit(ACTIONS.INPUT_CHANGE, {
                    roomId,
                    input: e.target.value,
                  });
                }
                
              }}
              className="input-textarea"
              placeholder="Enter input for your program..."
            />
          </div>

          <div className="output-section">
            <div className="section-header">
              <h3>Output</h3>
              <button 
                onClick={handleClearOutput}
                className="clear-btn"
              >
                Clear
              </button>
            </div>
            <div className="output-display">
              {output || 'Output will appear here...'}
            </div>
          </div>
        </div>
      </div>
      {showModal && <Modal onClose={()=>{setShowModal(false)}} />}
    </div>
    
  );
};

export default Editor;