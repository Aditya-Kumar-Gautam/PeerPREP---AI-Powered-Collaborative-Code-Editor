import React, { use,useRef } from 'react'
import { X , SendHorizontal} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

export const Modal = ({onClose}) => {
    const modalRef = useRef();
    const closeModal = (e) => {
        if(modalRef.current === e.target) {
            onClose();
        }
    }

    // Gemini API 

    const ai = new GoogleGenAI({ "GOOGLE_API_KEY" });

    async function main() {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents:
                "List a few popular cookie recipes, and include the amounts of ingredients.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            recipeName: {
                                type: Type.STRING,
                            },
                            ingredients: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING,
                                },
                            },
                        },
                        propertyOrdering: ["recipeName", "ingredients"],
                    },
                },
            },
        });

    console.log(response.text);
    }

  return (

    
    


    <div ref={modalRef} onClick={closeModal} className='question-overlay'>
        <div className='question-box'>
            <button className="closebutton" onClick={onClose}><X size={30}/></button>
            <div className='question-content'>
                <h1>Ask your Question</h1>
                <form action="GET" className='question-form'>
                    <input 
                        name='questionNumber'
                        type="text"
                        placeholder='Enter your Question Number'
                        className='question-io'
                        required
                    />
                </form>
                <textarea readOnly name="question" id="" placeholder='Your problem statement will appear here' rows={10} cols={100} className='question-io' ></textarea>
                <button  type="submit" className='send-button'><SendHorizontal size={30}/></button>
            </div>
        </div>
    </div>
  )
}
