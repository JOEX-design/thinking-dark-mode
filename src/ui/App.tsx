import * as React from "react";
import { useState, useEffect } from 'react';

import { Button } from "./components/Button";
import { Loading } from "./components/Loading";


export const App = () => {
  const [progress, setProgress] = useState(null);
  const generate = () => {
    parent.postMessage({ pluginMessage: { type: 'clickGenerate' } }, '*')
  }
  
  useEffect(() => {
    onmessage = msg => {
      const pluginMsg = msg.data.pluginMessage ? msg.data.pluginMessage : null
      
      if (pluginMsg && pluginMsg.type === 'progressUpdated') {
        setProgress(pluginMsg.data)
      }
    }
  }, [])
  return (
    <div className="flex flex-col gap-4 p-3 pt-5 h-full">
    <h2 className="text-lg text-slate-600 font-medium text-center">⚡️ Style to Variable</h2>
    <Button variant="primary" onClick={generate} className="mx-2">转化</Button>
    {progress &&       
      <div className="flex flex-col flex-1">
      {!progress.complete && progress?.totalNodes !== 0 &&
        <Loading text={"转化中"}></Loading>
      }
      {progress.complete &&
        <div className="flex p-2.5 bg-green-50 justify-center m-5 rounded-md">
          <span className="text-md text-green-700 text-center">✅ 转化完成</span> 
        </div>}
        <div className="flex justify-between p-2">
          <div className="flex flex-col gap-0 items-center">
            <span className="text-lg text-slate-600 font-medium">{progress?.totalNodes}</span>
            <span className="text-sm text-slate-400">选中的图层节点</span>
          </div>
          <div className="flex flex-col gap-0 items-center">
            <span className="text-lg text-slate-600 font-medium">{progress?.totalTaskNodes}</span>
            <span className="text-sm text-slate-400">含Style节点</span>
          </div>
          <div className="flex flex-col gap-0 items-center">
            <span className="text-lg text-slate-600 font-medium">{progress?.finishedTaskNodes}</span>
            <span className="text-sm text-slate-400">转化成功节点</span>
          </div>
        {/* <span>{progress?.finishedTaskNodes} / {progress?.totalTaskNodes}</span> */}
        </div>
      </div>}
      {!progress &&
        <div className="flex flex-1 bg-slate-100 rounded-md p-8 text-slate-400 text-sm items-center content-center border-slate-200 border">
          <div className="text-center">选中需要完成转化的单个或多个图层后，点击“转化”</div>
        </div>
      }
    </div>
  )
}