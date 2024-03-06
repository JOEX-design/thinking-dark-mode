// @ts-ignore
import variableMappingData from '../data/variableMapping.csv'
import progressTracker from './ProgressTracker'

const LIBRARY_KEYWORD = "黑漆麻乌"
const STORAGE_KEY = 'variable_collection'

const setVariableCollection = async() => {
	const libraryCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()
	const tempSaveCollections = []
	let savedCollections
	
	for await (const collection of libraryCollections) {
		if (collection.libraryName.includes(LIBRARY_KEYWORD)) {
			console.log(`VARAIBLES --- Found library ${collection.libraryName} ${collection.name}`)
			const result = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key) 
			tempSaveCollections.push(result)
		}
	}
	savedCollections = [].concat(...tempSaveCollections)
	await figma.clientStorage.setAsync(STORAGE_KEY, savedCollections || {});
	console.log("VARAIBLES --- Set collections:", savedCollections.length)
}


const getVariableCollection = async() => {
	let storageData;
	
	try {
		storageData = await figma.clientStorage.getAsync(STORAGE_KEY);
	} catch (e) {
		console.error('Storage init error:', e);
	}
	console.log("VARAIBLES --- Get collections:", storageData.length)
	return storageData
}


const searchVariablesFromStyle = async (styleName: String, variableCollection) => {
	console.log("VARAIBLES --- Search ", styleName)
	const searchResult = variableMappingData.filter(mapping => mapping.styleName === styleName)
	if (searchResult.length != 0) {
		console.log("VARAIBLES --- Found ", searchResult[0].variableName)
		
		// let variableCollection = await getVariableCollection()
		const targetKeyPair = variableCollection.filter(variable => variable.name === searchResult[0].variableName)
		const resultVariable = await figma.variables.importVariableByKeyAsync(targetKeyPair[0].key)
		return resultVariable
	}
	console.log("VARAIBLES --- !!!!!! Found Nothing !!!!!!")
	return
}

export {setVariableCollection, getVariableCollection, searchVariablesFromStyle}