/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { COLOR_CAPS } from "../../constants/constants";
import ColorSelector from "./_components/ColorSelector";
import Button from "./_components/Button";
import { gemeniResponse } from "../../utils/utils"

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing , setIsDrawing] = useState<boolean>(false);
  const [ currColor , setCurrColor ] = useState<string>(COLOR_CAPS[0]);
  const [resetCanvas , setResetCanvas] = useState<boolean>(false);
  const [result , setResult] = useState<any>(null);
  const [array , setArray] = useState<string[]>([]); 
  const [isFetching , setIsFetching] = useState<boolean>(false);
  const [showModal , setShowModal] = useState<boolean>(false);
  // const lazyBrush = new LazyBrush({
  //     radius: 10,
  //     enabled: true,
  //     initialPoint: { x: 0, y: 0 },
  // });

  

  useEffect(() => {
    if(resetCanvas){
      resetBoard();
      setResetCanvas(false);
    }
  } , [resetCanvas]);

  const resetBoard = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if(canvas){
      const ctx = canvas.getContext("2d");
      if(!ctx) return;
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth - canvas.offsetTop;
      canvas.style.background = "black";
      ctx.lineCap = "round";
      ctx.lineWidth = 10;
    }
  } , [])

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  }

  const finishDrawing = () => {
    setIsDrawing(false);
  }

  const draw = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    if(!isDrawing) return;
    ctx.strokeStyle = currColor;
    ctx.lineTo(e.pageX , e.pageY);
    ctx.stroke();
  }

  const sendData = () => {
    setIsFetching(true);
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    const data = canvas.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, "");
    gemeniResponse({ image : data, arrayOfString : array , key : process.env.NEXT_PUBLIC_GEMINI_API || ""}).then((res) => {
      const resp = res.response;
      setIsFetching(false);
      const finalResult : any = [];
      (resp.candidates || []).forEach((data) => {
          data.content.parts.forEach((part) => {
            finalResult.push(
              ...JSON.parse(part.text?.replace('```json\n', '')?.replace('\n```', '') || "[]").map((item: any) => {
                setArray([...array , item.expr]);
                return { [item.expr]: item.result };
              })
            );
          })
      });
      setShowModal(true);
      setResult(finalResult);
    }).catch((err) => {
      setIsFetching(false);
      console.log(err);
    });
  }

  return (
    <>
   <canvas ref={canvasRef} onMouseDown={startDrawing} id="canvas" className="absolute top-0 left-0 w-full h-full" onMouseUp={finishDrawing} onMouseOut={finishDrawing} onMouseMove={draw}/>

  { showModal && (<div className={`absolute top-2 right-10 z-40 overflow-y-auto  text-black bg-pink-400 text-xl text-bold w-80 h-80 ${result ? "" : "hidden"}`}>
     
     <div className="flex justify-end px-3">
     <button onClick={() => setShowModal(false)}>X</button>
     </div>

      {result && !isFetching && 
         Object.keys(result).map((key , index) => {
           return (
             <div key={index} className="p-2">
               {
                 Object.keys(result[key]).map((item : any , index : number) => {
                   return (
                     <div key={index} className="mt-2">
                       <p>{item} = {result[key][item]}</p>
                     </div>
                   )
                 })
               }
             </div>
           )
         })
      }


   </div>)}

   <div className="flex gap-2 z-20 relative mt-10 ml-4">
   {
    COLOR_CAPS.map((color , index) => {
      return <ColorSelector key={index} color={color} onClick={() => setCurrColor(color)}/>
    })
   }
   <Button onClick={() => setResetCanvas(true)} variant="danger">Reset</Button>
   <Button onClick={sendData} variant="success" disabled={isFetching}>Send</Button>
   <Button onClick={() => setShowModal(true)} variant="warning">Show Current Result</Button>
   </div>
   </>
  )
}


// result?.response?.candidates[0]?.content?.parts?.map(({part, index} : any) => {
//   <div key={index} onClick={() => console.log(part)}>
//     <p>{JSON.stringify(result.response)}</p>
//   </div>
// })

//part?.text.map(({text , index} : any) => Object.keys(JSON.parse(text)).map((key) => <div key={index}>{text[key]}</div>))