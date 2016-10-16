
function getRecommendations(modelId, userData, itemList, numberOfRecommendations){
	
	var recommendableItems = []
	var recommendedItems = [];
	//always in the same place in the dataset
	var inputKey = "000009";
	var prediction;
	var highestConfidence = 0;

return new Promise (function(resolve, reject){

//for each item put into recommendation list
	for(var i=0;i<itemList.length;i++){

		userData[inputKey] = itemList[i];
		var input = userData;
		 createPrediction(modelId, input).then(function(d){
		 	prediction = d.prediction;
		 	for(var key in prediction) {
    			var value = prediction[key];
    			if(value){ 
	    			recommendableItems.push([d.input_data["000009"], d.confidence]);
    			}
			}

		var recommendedItems = [];

		for(var a = 0; a<numberOfRecommendations; a++){

			if(a < recommendableItems.length){
				//only add highest confidence items
				if(recommendableItems[a][1] >= highestConfidence){
					//check the recommended item is not contained in the users already consumed items
					//if(itemList.indexOf(recommendableItems[a][0]) == -1){
						highestConfidence = recommendableItems[a][1];
						recommendedItems.push(recommendableItems[a][0]);
					//}
				}
			}
			
		}

		if(recommendedItems.length == numberOfRecommendations){ 
			resolve(recommendedItems);
		}


		});
	}


	

});


}

function sortRecommendations(recommendableItems,numberOfRecommendations){
	var recommendedItems = [];

	if(numberOfRecommendations > recommendableItems.length){
		numberOfRecommendations = recommendableItems.length; 
	}

	for(var a = 0; a<numberOfRecommendations; a++){
		recommendedItems.push(recommendableItems[a][0]);
	}

	return recommendedItems;
}