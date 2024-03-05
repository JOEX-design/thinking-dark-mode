import * as VariableCollection from '../modules/variableCollection';

const getNewStorkes = async (strokeStyleId, node) => {
	return await figma.getStyleByIdAsync(strokeStyleId).then(async r => {
		const variable = await VariableCollection.searchVariablesFromStyle(r.name)
		if (variable) {
			const fillsCopy = JSON.parse(JSON.stringify(node.strokes))
			fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', variable)
			return fillsCopy
		}
		return
	}).catch(e => console.log(e))    
}

const getNewFills = async (fillStyleId, node) => {
	return await figma.getStyleByIdAsync(fillStyleId).then(async r => {
		const variable = await VariableCollection.searchVariablesFromStyle(r.name)
		if (variable) {
			const fillsCopy = JSON.parse(JSON.stringify(node.fills))
			fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', variable)
			return fillsCopy
		}
		return
	}).catch(e => console.log(e))    
}


const fillStyleToVariable = async frame => {
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
	frame.filter(node => node.strokeStyleId).forEach(async node => {
		const newStrokes = await getNewStorkes(node.strokeStyleId, node)
		if (newStrokes) node.strokes = newStrokes
	})
}

export {fillStyleToVariable, strokeStyleToVariable}