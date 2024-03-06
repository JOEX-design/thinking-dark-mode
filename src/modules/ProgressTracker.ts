class ProgressTracker {
	private totalNodes
	private totalTaskNodes
	private finishedTaskNodes
	private complete
	
	constructor() {
		this.totalNodes = 0
		this.totalTaskNodes = 0
		this.finishedTaskNodes = 0
		this.complete = false
	}
	
	setup(totalJobNodes) {
		this.totalNodes = totalJobNodes
	}

	startJob(totalTaskJobNodes) {
		this.totalTaskNodes = totalTaskJobNodes
		this.postToUI()
	}
	finishJob() {
		this.complete = true
		this.postToUI()
	}
	next() {
		this.finishedTaskNodes++
		this.postToUI()
	}
	printStatus() {
    console.log(`Total Nodes: ${this.totalNodes}, Task Nodes: ${this.totalTaskNodes}, Finished Nodes: ${this.finishedTaskNodes}`);
  }
	reset() {
		this.totalNodes = 0
		this.totalTaskNodes = 0
		this.finishedTaskNodes = 0
		this.complete = false
		// this.postToUI()
	}
	postToUI() {
		figma.ui.postMessage({type: 'progressUpdated', data: {
			totalNodes: this.totalNodes,
		  totalTaskNodes: this.totalTaskNodes,
		  finishedTaskNodes: this.finishedTaskNodes,
			complete: this.complete
		}})	
	}
}

const progressTracker = new ProgressTracker()

export default progressTracker