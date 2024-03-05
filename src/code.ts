import * as VariableCollection from './modules/variableCollection';
import {fillStyleToVariable, strokeStyleToVariable} from './modules/styleToVariable'

const PREVIEW_ENV = process.env.PREVIEW_ENV

async function initUI() {
  figma.showUI(__html__, {
    // themeColors: true
  }); 
  console.clear();

  figma.skipInvisibleInstanceChildren = true;

  if (PREVIEW_ENV === 'figma') {
    figma.ui.resize(300, 100);
  } else {
    figma.ui.resize(340, 520);
  } 

  await VariableCollection.setVariableCollection()

  figma.ui.postMessage({
    type: 'uiInit',
});
}

initUI()

figma.ui.onmessage = async msg => {
  if (msg.type === 'clickGenerate') {
      let savedCollection = await VariableCollection.getVariableCollection()

      if(savedCollection.length != 0) {
        let tempNodeList = []

        const selectedFrames = figma.currentPage.selection.filter(node => node.type ===  "FRAME") as FrameNode[];
        selectedFrames.forEach(frame => {
          const targetNodes= frame.findAll(node => node.type.length !==0)
          tempNodeList.push(frame)
          tempNodeList.push(targetNodes)
          console.log(targetNodes.length)
        })
        const paintNodes = [].concat(...tempNodeList)
        console.log("!!!!!!", paintNodes)
        // paintNode = selectedFrame[0].findAll( node => 
          // node.type === "FRAME" || 
          // node.type === "GROUP" || 
          // node.type === "RECTANGLE" || 
          // node.type === "ELLIPSE" || 
          // node.type === "LINE" || 
          // node.type === "TEXT" ||
          // node.type === "VECTOR" ||
          // node.type === "COMPONENT" || 
          // node.type === "INSTANCE"
          // node.type.length !== 0
          // ) as FrameNode[]
  
        await fillStyleToVariable(paintNodes)
        await strokeStyleToVariable(paintNodes)
      }
      else figma.notify("请在文件的 Library 中打开变量库")
  }
}