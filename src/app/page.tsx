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

  // Size the canvas to the viewport (and on rotate/resize), keeping existing drawing
  useEffect(() => {
    const fit = () => {
      const canvas = canvasRef.current;
      if(!canvas) return;
      const ctx = canvas.getContext("2d");
      if(!ctx) return;
      const saved = canvas.width && canvas.height ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if(saved) ctx.putImageData(saved, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = window.innerWidth < 640 ? 6 : 10;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  } , [])

  const getPoint = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const startDrawing = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getPoint(e);
    ctx.strokeStyle = currColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    // dot on tap
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    setIsDrawing(true);
  }

  const finishDrawing = () => {
    setIsDrawing(false);
  }

  const draw = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if(!canvas || !isDrawing) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    const { x, y } = getPoint(e);
    ctx.strokeStyle = currColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  const sendData = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    // JPEG has no alpha, so flatten onto black first or transparent pixels turn black-on-black unpredictably
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const fctx = flat.getContext("2d");
    if(!fctx) return;
    fctx.fillStyle = "black";
    fctx.fillRect(0, 0, flat.width, flat.height);
    fctx.drawImage(canvas, 0, 0);
    const data = flat.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, "");
    setIsFetching(true);
    gemeniResponse({ image : data, arrayOfString : array , key : process.env.NEXT_PUBLIC_GEMINI_API || ""}).then((answers) => {
      setIsFetching(false);
      setArray((prev) => [...prev, ...answers.map((a) => a.expr)]);
      setResult(answers.map((a) => ({ [a.expr]: a.result })));
      setShowModal(true);
    }).catch((err) => {
      setIsFetching(false);
      console.log(err);
      setResult([{ "Error": "Couldn't read the drawing, please try again" }]);
      setShowModal(true);
    });
  }

  return (
    <>
   <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={finishDrawing} onPointerCancel={finishDrawing} id="canvas" className="fixed top-0 left-0 w-full h-full bg-black touch-none"/>

  { showModal && (<div className={`fixed top-2 right-2 sm:right-10 z-40 overflow-y-auto text-black bg-pink-400 text-base sm:text-xl font-bold w-[calc(100vw-1rem)] max-w-80 max-h-[50vh] sm:h-80 ${result ? "" : "hidden"}`}>
     
     <div className="flex justify-end px-3">
     <button className="p-2" onClick={() => setShowModal(false)}>X</button>
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

   <div className="flex flex-wrap items-center gap-2 z-20 relative mt-3 sm:mt-10 mx-2 sm:ml-4 max-w-[calc(100vw-1rem)]">
   {
    COLOR_CAPS.map((color , index) => {
      return <ColorSelector key={index} color={color} onClick={() => setCurrColor(color)}/>
    })
   }
   <Button onClick={() => setResetCanvas(true)} variant="danger">Reset</Button>
   <Button onClick={sendData} variant="success" disabled={isFetching}>Send</Button>
   <Button onClick={() => setShowModal(true)} variant="warning">Result</Button>
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