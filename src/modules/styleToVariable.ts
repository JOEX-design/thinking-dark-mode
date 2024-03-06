import * as VariableCollection from '../modules/variableCollection';
import progressTracker from './ProgressTracker';

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function chunk(arr, chunk) {
  let result = [];
  for (let i = 0, len = arr.length; i < len; i += chunk) {
    result.push(arr.slice(i, i + chunk));
  }
  return result;
}

const getNewStorkes = async (strokeStyleId, node, variableCollection) => {
  return await figma.getStyleByIdAsync(strokeStyleId).then(async r => {
    const variable = await VariableCollection.searchVariablesFromStyle(r.name, variableCollection)
    if (variable) {
      const strokesCopy = JSON.parse(JSON.stringify(node.strokes))
      strokesCopy[0] = figma.variables.setBoundVariableForPaint(strokesCopy[0], 'color', variable)
      return strokesCopy
    }
    return
  }).catch(e => console.log(e))    
}

const getNewFills = async (fillStyleId, node, variableCollection) => {
  console.log("GETTING NEW FILLS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  return await figma.getStyleByIdAsync(fillStyleId).then(async r => {
    const variable = await VariableCollection.searchVariablesFromStyle(r.name, variableCollection)
    if (variable) {
      const fillsCopy = JSON.parse(JSON.stringify(node.fills))
      fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', variable)
      return fillsCopy
    }
    return
  }).catch(e => console.log(e))    
}


const fillStyleToVariable = async frame => {
  const variableCollection = await VariableCollection.getVariableCollection()
  
  // await Promise.all(frame.map(async (node,i) => {
  //   if(node.fillStyleId == figma.mixed) {
  //     const mixedFills = node.getStyledTextSegments(['fills','fillStyleId'])
  //     await Promise.all(mixedFills.map(async mixedNode => {
  //       const newMixedFills = await getNewFills(mixedNode.fillStyleId, mixedNode, variableCollection)
  //       if(newMixedFills) {
  //         node.setRangeFills(mixedNode.start, mixedNode.end, newMixedFills)
  //       } 
  //     }))
  //   }    
  
  //   else {
  //     const newFills = await getNewFills(node.fillStyleId, node, variableCollection)
  //     if (newFills) {
  //       node.fills =newFills
  
  //     }
  //   }
  
  // }))
  // await Promise.all(chunks(frame, 10).reduce((acc, chunk => {
  
  // })))
  const chunkedNodes = chunk(frame, 50);

  for (let nodes of chunkedNodes) {
    const promises = nodes.map(async node => {
      if(node.fillStyleId == figma.mixed) {
        const mixedFills = node.getStyledTextSegments(['fills','fillStyleId'])
        await Promise.all(mixedFills.map(async mixedNode => {
          const newMixedFills = await getNewFills(mixedNode.fillStyleId, mixedNode, variableCollection)
          if(newMixedFills) {
            node.setRangeFills(mixedNode.start, mixedNode.end, newMixedFills)
          } 
        }))
        progressTracker.next()
      }    
      
      else {
        const newFills = await getNewFills(node.fillStyleId, node, variableCollection)
        if (newFills) {
          node.fills =newFills
          progressTracker.next()
          
        }
      }
    })
    await Promise.allSettled(promises)
    await delay(40)
  }
  
}

const strokeStyleToVariable = async frame => {
  const variableCollection = await VariableCollection.getVariableCollection()
  
  await Promise.all(frame.map(async node => {
    const newStrokes = await getNewStorkes(node.strokeStyleId, node, variableCollection).catch(e=>console.log(e))
    if (newStrokes) {
      // console.log("updateding strokes")
      node.strokes = newStrokes
      progressTracker.next()
    }    
  }))
}

export default async function styleToVariable(frameNodes) {
  const startTime = Date.now()
  
  const nodeWithFillStyle = frameNodes.filter(node => node.fillStyleId)
  const nodeWithStrokeStyle = frameNodes.filter(node => node.strokeStyleId)
  const totalTaskNodes = nodeWithFillStyle.length + nodeWithStrokeStyle.length
  
  progressTracker.startJob(totalTaskNodes)
  await fillStyleToVariable(nodeWithFillStyle)
  await strokeStyleToVariable(nodeWithStrokeStyle)
  // console.timeEnd('styleToVariable')
  
  const endTime = Date.now()
  
  console.log(`Call to styleToVariable took ${endTime - startTime} milliseconds`)
  
  // console.log(nodeWithFillStyle.length, nodeWithStrokeStyle.length)
}