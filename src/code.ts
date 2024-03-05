import variableMappingData from './variableMapping.csv';

const PREVIEW_ENV = process.env.PREVIEW_ENV

let savedCollections = []

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

  // let storageData;

  // try {
  //   console.log('try load storage')
  //     storageData = await figma.clientStorage.getAsync(storageKey);
  //     console.log('storageData', storageData)
  // } catch (e) {
  //     console.log('Storage init error:', e);
  // }

  // Query all published collections from libraries enabled for this file
  const libraryCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()
  const tempSaveCollections = []
  libraryCollections.forEach(async collection => {
    if (collection.libraryName.match(/黑漆麻乌/)) {
      console.log("found library")
      const result = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key) 
      tempSaveCollections.push(result)
      savedCollections = [].concat(...tempSaveCollections)
    }
  })

  figma.ui.postMessage({
    type: 'uiInit',
    // data: storageData || {},
});
}

initUI()


const searchVariablesFromStyleName = async (styleName) => {
  // console.log("searching...", styleName)
  const searchResult = variableMappingData.filter(mapping => mapping.styleName === styleName)
  if (searchResult.length != 0) {
    console.log("found node to transform", styleName, searchResult)
    const targetKeyPair = savedCollections.filter(variable => variable.name === searchResult[0].variableName)
    const resultVariable = await figma.variables.importVariableByKeyAsync(targetKeyPair[0].key)
    return resultVariable
  }
  return
}

const fillStyleToVariable = async frame => {

  const getNewFills = async (fillStyleId, node) => {
    return await figma.getStyleByIdAsync(fillStyleId).then(async r => {
      const variable = await searchVariablesFromStyleName(r.name)
      if (variable) {
        const fillsCopy = JSON.parse(JSON.stringify(node.fills))
        fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', variable)
        return fillsCopy
      }
      return
    }).catch(e => console.log(e))    
  }


  frame.filter(node => node.fillStyleId).forEach(async node => {
    if(node.fillStyleId == figma.mixed) {
      const mixedFills = node.getStyledTextSegments(['fills','fillStyleId'])
      mixedFills.forEach(async mixedNode => {
        const newMixedFills = await getNewFills(mixedNode.fillStyleId, mixedNode)
        if(newMixedFills) node.setRangeFills(mixedNode.start, mixedNode.end, newMixedFills) 
      })
    }
    else {
      const newFills = await getNewFills(node.fillStyleId, node)
      if (newFills) node.fills =newFills
    }
  })

}

const strokeStyleToVariable = async frame => {
  const getNewStorkes = async (strokeStyleId, node) => {
    return await figma.getStyleByIdAsync(strokeStyleId).then(async r => {
      const variable = await searchVariablesFromStyleName(r.name)
      if (variable) {
        const fillsCopy = JSON.parse(JSON.stringify(node.strokes))
        fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', variable)
        return fillsCopy
      }
      return
    }).catch(e => console.log(e))    
  }

  frame.filter(node => node.strokeStyleId).forEach(async node => {
    console.log("strokeNode", node)
    const newStrokes = await getNewStorkes(node.strokeStyleId, node)
    if (newStrokes) node.strokes = newStrokes
  })
}


figma.ui.onmessage = async msg => {
  if (msg.type === 'clickGenerate') {
      console.log("VARABLES:", savedCollections)

      if(savedCollections.length != 0) {
        const selectedFrame = figma.currentPage.selection.filter(node => node.type ===  "FRAME") as FrameNode[];
        const paintNode = selectedFrame[0].findAll( node => 
          node.type === "FRAME" || 
          node.type === "GROUP" || 
          node.type === "RECTANGLE" || 
          node.type === "TEXT" ||
          node.type === "VECTOR" ||
          node.type === "COMPONENT" || 
          node.type === "INSTANCE"
          ) as FrameNode[]
  
        await fillStyleToVariable(paintNode)
        await strokeStyleToVariable(paintNode)
      }
      else figma.notify("请在文件的 Library 中打开变量库")
  }
}