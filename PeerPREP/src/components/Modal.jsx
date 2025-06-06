import React, { use,useEffect,useRef,useState } from 'react'
import { X , SendHorizontal} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';


export const Modal = ({onClose}) => {
    const modalRef = useRef();
    const closeModal = (e) => {
        if(modalRef.current === e.target) {
            onClose();
        }
    }

   
    const [questionNumber, setQuestionNumber] = useState();
    const [received_question,setReceived_question] = useState([]);
    const [problemStatement,setProblemStatement] = useState('');


    // Form Submission
    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        setQuestionNumber(data.questionNumber);

        console.log(data.questionNumber);

        findQuestion(data.questionNumber);

        e.target.reset();

    }

    // Updates ProblemStatement everytime a new question is received and displays it in textarea
    useEffect(()=>{
        if(received_question.length!=0){
            const formatted_examples=parseExamples(received_question[0].example);
            
            const ps = "Question Number: "+received_question[0].qNo + '\n'.repeat(2) + 
                        "Problem Statement: "+received_question[0].problem_statement + '\n'.repeat(2) +
                        "Examples:\n"+formatted_examples.map((ex, i) =>`Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}\n` + (ex.explanation?`Explanation: ${ex.explanation}`:"")).join('\n\n')+ '\n'.repeat(2) +
                        "Constraints: \n"+received_question[0].constraints.map((conn,j)=>`${j+1}. ${conn}`).join('\n') + '\n'.repeat(2);
            setProblemStatement(ps);
        }
        else{
            setProblemStatement("");
        }

         
    },[received_question])

    

    // Gemini API 

    const ai = new GoogleGenAI({apiKey:"AIzaSyAxZ25NpgNJv48cuNvG1PNpHSf156nWobY"});

    async function findQuestion(qNumber) {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents:
                `Find the problem statement for question number ${qNumber} from leetcode.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            qNo: {
                                type: Type.STRING,
                            },
                            problem_statement: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING,
                                },
                            },
                            example:{
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING,
                                },
                            },
                            constraints: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING,
                                },
                            }
                        },
                        propertyOrdering: ["qNo", "problem_statement", "example", "constraints"],
                    },
                },
            },
        });

        let data = [];
        try {
            data = JSON.parse(response.text);
        } catch (e) {
            data = [];
        }
        setReceived_question(data);

    
    }

    // formats the examples received
    function parseExamples(received_question) {
      const examples = [];
      let currentExample = {};

      const addCurrentExample = () => {
        if (Object.keys(currentExample).length > 0) {
          examples.push(currentExample);
          currentExample = {};
        }
      };

      const parseLine = (line) => {
        if (line.startsWith("Input: ")) {
          return { type: "input", content: line.replace("Input: ", "") };
        } else if (line.startsWith("Output: ")) {
          return { type: "output", content: line.replace("Output: ", "") };
        } else if (line.startsWith("Explanation: ")) {
          return {
            type: "explanation",
            content: line.replace("Explanation: ", ""),
          };
        }
        return null;
      };

      const handleParsedLine = (parsed) => {
        if (parsed.type === "input") {
          addCurrentExample();
          currentExample = { input: parsed.content };
        } else if (parsed.type === "output") {
          currentExample.output = parsed.content;
        } else if (parsed.type === "explanation") {
          currentExample.explanation = parsed.content;
        }
      };

      received_question.forEach((item) => {
        if (item.includes("\n")) {
          // Combined format
          addCurrentExample();
          const lines = item.split("\n");
          lines.forEach((line) => {
            const parsed = parseLine(line);
            if (parsed) handleParsedLine(parsed);
          });
          addCurrentExample();
        } else {
          // Separate format
          const parsed = parseLine(item);
          if (parsed) handleParsedLine(parsed);
        }
      });

      addCurrentExample();
      return examples;
    }

    


  return (
    <div ref={modalRef} onClick={closeModal} className='question-overlay'>
        <div className='question-box'>
            <button className="closebutton" onClick={onClose}><X size={30}/></button>
            <div className='question-content'>
                <h1>Ask your Question</h1>
                <form onSubmit={handleSubmit} id='questionForm' action="" method="GET" className='question-form'>
                    <input 
                        name='questionNumber'
                        type="number"
                        placeholder='Enter your Question Number'
                        className='question-io'
                        required
                    />
                </form>
                <textarea 
                    readOnly 
                    name="question" 
                    id="" 
                    placeholder='Your problem statement will appear here' 
                    rows={10} 
                    cols={100} 
                    className='question-io ps-box'
                    value={received_question?problemStatement:""}
                     >
                    
                </textarea>
                <button  type="submit" className='send-button' form='questionForm'><SendHorizontal size={30}/></button>
            </div>
        </div>
    </div>
  )
}


