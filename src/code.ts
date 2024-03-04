import variableMappingData from './variableMapping.csv';

const PREVIEW_ENV = process.env.PREVIEW_ENV
const variableMappingCSVPath = '';

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
      // console.log(collection.libraryName, collection.name, collection.key)
      const result = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key) 
      tempSaveCollections.push(result)
    }
    savedCollections = [].concat(...tempSaveCollections)
    // else {
    //   figma.notify("请开启包含 Variables 的变量库")
    // }
  })



    
  figma.ui.postMessage({
    type: 'uiInit',
    // data: storageData || {},
});
}

initUI()


const searchVariablesFromStyleName = async (styleName) => {
  console.log("searching...", styleName)
  const searchResult = variableMappingData.filter(mapping => mapping.styleName === styleName)
  // console.log("result", searchResult)
  if (searchResult.length != 0) {
    console.log('result:', searchResult[0])
    const targetKeyPair = savedCollections.filter(variable => variable.name === searchResult[0].variableName)
    const resultVariable = await figma.variables.importVariableByKeyAsync(targetKeyPair[0].key)
    console.log('done searching')
    return resultVariable
  }
  return
}

const fillStyleToVariable = async frame => {
  console.log("target frame found", frame)

  const style2variable = async (fillStyleId, node) => {
    console.log("START TRANSFORM", fillStyleId, node)
    figma.getStyleByIdAsync(fillStyleId).then(async r => {
      // console.log("style result", r)
      const variable = await searchVariablesFromStyleName(r.name)
      if (variable) {
        // console.log("found mapped varaibles", variable)
        const fillsCopy = JSON.parse(JSON.stringify(node.fills))
        // console.log(node)
        fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', variable)
        node.fills = fillsCopy
        // console.log("done action")
      }
    }).catch(e => console.log(e))    
  }

  frame.filter(node => node.fillStyleId).forEach(node => {
    console.log("warning: fillstyleid", node.fillStyleId)
    if(node.fillStyleId == figma.mixed) {
      // const mixedFillStyleIDs = node.getStyledTextSegments(['fillStyleId'])
      const mixedFills = node.getStyledTextSegments(['fills','fillStyleId'])
      mixedFills.forEach(mixedNode => {
        style2variable(mixedNode.fillStyleId, mixedNode)
        figma.getStyleByIdAsync(mixedNode.fillStyleId).then(async r => {
          console.log("style result", r)
          const variable = await searchVariablesFromStyleName(r.name)
          if (variable) {
            const fillsCopy = JSON.parse(JSON.stringify(mixedNode.fills))
            // console.log("found mapped varaibles", fillsCopy)
            fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', variable)
            // console.log("mixedFills", mixedFills[index], fillsCopy)
            // mixedFills[index].fills = fillsCopy
            node.setRangeFills(mixedNode.start, mixedNode.end, fillsCopy)
            console.log("done action")
          }
        }).catch(e => console.log(e))    
      })
      // console.log(mixedFillText)
    }
    else {
      // const string = String(node.fillStyleId)
      style2variable(node.fillStyleId, node)
      // figma.getStyleByIdAsync(fillStyleId).then(async r => {
      //   const variable = await searchVariablesFromStyleName(r?.name)
      //   if (variable) {
      //     const fillsCopy = JSON.parse(JSON.stringify(node.fills))
      //     console.log(node)
      //     fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', variable)
      //     node.fills = fillsCopy
      //   }
      // })
    }
  })
}


figma.ui.onmessage = async msg => {
  if (msg.type === 'clickGenerate') {
    // Query all published collections from libraries enabled for this file
    // const libraryCollections =
    //     await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()
    // libraryCollections.forEach(async collection => {
    //   if (collection.libraryName.match(/黑漆麻乌/)) {
    //     console.log(collection.libraryName, collection.name, collection.key)
    //     const result = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key) 
    //     console.log("RESULT", result)
    //   }
      // const variables = await figma.variables.getVariableCollectionByIdAsync(collection.key)
      // console.log(variables)
    // })
    // Select a library variable collection to import into this file
    // const variablesInFirstLibrary =
        // await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libraryCollections[0].key)
    // Import the first number variable we find in that collection
      console.log("VARABLES:", savedCollections)

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

      fillStyleToVariable(paintNode)

  }
}