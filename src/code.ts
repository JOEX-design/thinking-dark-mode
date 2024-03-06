import * as VariableCollection from './modules/variableCollection';
import styleToVariable from './modules/styleToVariable'
import progressTracker from './modules/ProgressTracker';

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
    figma.ui.resize(340, 280);
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
    progressTracker.reset()
    
    if(savedCollection.length != 0) {
      let tempNodeList = []
      
      const selectedFrames = figma.currentPage.selection.filter(node => node.type) as FrameNode[];
      
      if (selectedFrames.length !== 0) {
        selectedFrames.forEach(frame => {
          const targetNodes= frame.findAll(node => node.type.length !==0)
          tempNodeList.push(frame)
          tempNodeList.push(targetNodes)
        })
        const paintNodes = [].concat(...tempNodeList)
        progressTracker.setup(paintNodes.length)
        await styleToVariable(paintNodes).catch(e => console.error(e))
        progressTracker.finishJob() 
      }
      else figma.notify("选中需要完成转化的单个或多个图层后，点击“转化”")
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

    }
    else figma.notify("请在文件的 Library 中打开变量库, 然后重新加载文件")
  }
}