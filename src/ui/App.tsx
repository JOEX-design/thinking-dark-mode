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
      <h2 className="text-lg text-slate-600 font-medium text-center">⚡️ Style To Variable ⚡️</h2>
      <Button variant="primary" onClick={generate} className="mx-2">转化</Button>
      <div className="flex flex-1 bg-slate-100 rounded-md px-6 text-slate-400 text-sm items-center content-center border-slate-200 border shadow-inner">
        {progress &&       
          <div className="flex flex-col w-full">
            <div className="h-20 flex justify-center items-center">
              {!progress.complete && progress?.totalNodes !== 0 &&
                <Loading text={"转化中"}></Loading>
              }
              {progress.complete &&
                <div className="flex p-2.5 justify-center rounded-md w-full h-fit ">
                  <span className="text-md font-medium text-green-600 text-center">✅ 转化完成</span> 
                </div>
              }
            </div>
 
            <div className="flex justify-between">
              <div className="flex flex-col gap-0 items-center">
                <span className="text-md text-slate-600 font-semibold">{progress?.totalNodes}</span>
                <span className="text-xs text-slate-400">选中的图层节点</span>
              </div>
              <div className="flex flex-col gap-0 items-center">
                <span className="text-md text-slate-600 font-semibold">{progress?.totalTaskNodes}</span>
                <span className="text-xs text-slate-400">含Style节点</span>
              </div>
              <div className="flex flex-col gap-0 items-center">
                <span className="text-md text-green-600 font-semibold">{progress?.finishedTaskNodes}</span>
                <span className="text-xs text-slate-400">转化成功节点</span>
              </div>
            </div>
          </div>}
        {!progress &&
          <div className="text-center px-4">选中需要转化的单个或多个图层后，点击“转化”</div>
        }
      </div>

    </div>
  )
}