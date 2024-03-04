import * as React from "react";

import { Button } from "./components/Button";


export const App = () => {
  const generate = () => {
    parent.postMessage({ pluginMessage: { type: 'clickGenerate' } }, '*')
  }
  return (
    <div>
      <Button variant="primary" onClick={generate}>生成</Button>
    </div>
  )
}