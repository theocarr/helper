//selected result field
var selectedField;
var selectedPredictionType;
var CSVFile;
var currentDataset;
var evaluationInfo;
var correlationInfo;
var anomalyInfo;
var modelAccuracy;
var modelAccuracyPercent;
var modelPrecisionPercent;
var modelInfo;
var dataList;

//used for item list/recommendations
var userIdCol
var itemIdCol

//used as backup
var backUpEvaluationInfo;
var backUpCorrelationInfo;
var backUpAnomalyInfo;
var backUpModelAccuracy;
var backUpModelInfo;

//correlationinfo
var highCorrelations;
var lowCorrelations;


//anomalies
var significantAnomalies = [];
var highAnomalyFieldsList;

$(document).on('change', 'input:radio[class^="headerradio"]', function (event) {
selectedField = event.target.value;
});

$(document).on('change', 'input:radio[class^="categoryRadio"]', function (event) {
selectedPredictionType = event.target.value;
});

function selectPredictionType() {
  if(selectedPredictionType === "categorization"){
     document.getElementById('predictionTypeSelection').style.display = 'none';
     document.getElementById('fieldSelection').style.display = 'block';
  }

  if(selectedPredictionType === "itemlist"){
     document.getElementById('predictionTypeSelection').style.display = 'none';
     document.getElementById('fieldSelection').style.display = 'block';
  }
}

function setCSV(csvFile){

  $('#CSVTable').CSVToTable(csvFile, { loadingImage: 'images/loading.gif', startLine: 0 });
  $.get(csvFile, function(data) {
    $('#TSVSource').html('<pre>' + data + '</pre>');
  });
CSVFile = csvFile

//set up next stage
initiateSelectStage();
}

function initiateSelectStage(){
    $( "#continueBtn" ).remove();
  if(selectedPredictionType == "categorization"){
  $( "#helpText" ).html("Select the field that you want to predict");
   $( "#continueBtnArea" ).append('<button id="continueBtn" type="button" onclick="selectResult()">Confirm selected Result</button>');
}
else if (selectedPredictionType == "itemlist"){
	  $( "#helpText" ).html("Firstly, select the column which is an identifier for your users and is unique for each user");
	    $( "#continueBtnArea" ).append('<button id="continueBtn" type="button" onclick="selectUserColumn()">Confirm selected column</button>');
	}


}

function selectUserColumn(){
	$( "#continueBtn" ).remove();
	userIdCol = selectedField;
	$( "#helpText" ).html("User id column set to column:" + selectedField + '. <p>Now select the column which is an identifier for your items and is unique for each item</p>');
	$( "#continueBtnArea" ).append('<button id="continueBtn" type="button" onclick="selectItemColumn()">Confirm selected column</button>');
}

function selectItemColumn(){
	itemIdCol = selectedField;
	$( "#helpText" ).html("Creating model...");
	$( "#continueBtn" ).remove();
	createItemListRecommendationModel();
}

function createItemListRecommendationModel(){
	var modifiedData;
	modifiedData = modifyDataForItemList();
	//set the selected field to the last one in this case because target is always for itemlist
	//modify it to be creating a source then modify the source to have our field (its constant) set to item list and then change focus item to preferred
	createItemListFromCSV(modifiedData, null, selectedField, false).then(function(data){
    model = data;
    modelInfo = data.resource;
    currentDataset = model.dataset;
    //complete evaluation of current model
    //retrieve accuracy from it and display
    evaluateModel(model.resource, model.dataset);
    $( "#continueBtn" ).remove();
  });
}


function selectResult(csvFile){

  var model;
  createPredictionModelFromCSV(CSVFile, null, selectedField, true).then(function(data){
    $('#helpText').append('Creating model...');
    model = data;
    modelInfo = data.resource;
    currentDataset = model.dataset;
    //complete evaluation of current model
    //retrieve accuracy from it and display

    evaluateModel(model.resource, model.dataset);
    $( "#continueBtn" ).remove();
  });
}


//STAGES

function continueToRemoveAnomalies(){
  //find the total number of significant anomalies here
document.getElementById('removeBadFields').style.display = 'none';
  document.getElementById('removeAnomalies').style.display = 'block';
  $( "#removeAnomalies" ).html('There are ' + significantAnomalies.length + ' significant anomalies in the dataset that may have a negative impact on accuracy. Would you like to try removing them? This change will be reverted if it does not have a positive impact.');
  $( "#removeAnomalies" ).append('<br><br>');
  $( "#removeAnomalies" ).append('<button id="complete" type="button" onclick="removeAnomalies()">Yes</button>');
  $( "#removeAnomalies" ).append('<button id="complete" type="button" onclick="continueToWeightData()">No</button>');
  $( "#completeInfoSection" ).remove();
}

function continueToRemoveBadFields(){
  //find the total number of significant anomalies here
  $('#continueToDataCorrection').remove();
  document.getElementById('removeBadFields').style.display = 'block';
  $( "#completeInfoSection" ).remove();
}

function removeBadFields(){
  //check that there is more than one field that won't be ignored
  if(!lowCorrelations.length >= (lowCorrelations.length + highCorrelations.length)-1){
    alert("Warning: bad field removal cancelled due to there being too few fields")
  }
  else{
 

  var data = {"fields": {"preferred": false}};
  
  //firstly mark fields which are bad
  for(var i=0;i<lowCorrelations.length;i++){
     $('#fieldTitle'+lowCorrelations[i]).append('[IGNORED]');
     var fieldId = "0000" + lowCorrelations[i];
     data.fields.preferred = false;
  }

    //set all fields that are good to preferred (used in the dataset)
  for(var i=0;i<highCorrelations.length;i++){
     var fieldId = "0000" + lowCorrelations[i];
      data.fields.preferred = true;
  }

}
runTestsAgainRemoveBadFields();

}





function continueToWeightData(){
  document.getElementById('weightData').style.display = 'block';
  $( "#continueBtnRemoveAnomaliesComplete").remove();
  document.getElementById('removeAnomalies').style.display = 'none';
}

function continueToCompletionStage(){

  document.getElementById('completionStageSection').style.display = 'block';
  $("#completionStageSection").append('<br>The system has been created successfully and is now ready for use!<br>');
 
 //summary
if(modelAccuracyPercent >50){

  $("#completionStageSection").append('<br><div id="completionSummary"><b>Summary:</b></div><br>');
  if(selectedPredictionType == "itemlist"){
    $('#completionStageSection').append('<br>The helper process has been completed. The system is effective and will produce a correct recommendation to a user the majority of the time ('+modelAccuracyPercent+'%). This can be used to produce practical recommendations. More data may improve the recommendation system.<br>');
  }
  else if(selectedPredictionType == "categorization"){
      $('#completionStageSection').append('<br>The helper process has been completed. The system is effective and will produce a correct categorization of a user the majority of the time ('+modelAccuracyPercent+'%). This can be used to practical practical categorizations. More data may improve the recommendation system.<br>');
  }
}else{
  $('#completionStageSection').append('<br>The helper process has been completed. The system is complete but not effective and will produce a correct result only some of the time ('+modelAccuracyPercent+'%). More data may improve the recommendation system or gathering data with more relation to the value you are trying to predict with the system.<br>');
}

//technical
$("#completionStageSection").append('<br><div id="completionTechnical"><b>Technical Summary:</b></div><br>');
$('#completionStageSection').append('<table style="width:100%"><tr><th>Measure</th><th>Score</th></tr> <tr><td>Accuracy</td><td>'+modelAccuracyPercent+'%</td></tr></td></tr> <tr><td>Precision</td><td>'+modelPrecisionPercent+'%</td></tr> </table>');



//developer
$("#completionStageSection").append('<br><div id="completionDeveloperInfo"><b>Developer Info:</b></div><br><br>');
$("#completionStageSection").append('</br>Getting recommendations:<br><br>');
$("#completionStageSection").append('</br>The endpoint for the created model is'+modelInfo+'<br><br>');
$("#completionStageSection").append('</br>To get a list of recommendations import the recommender API into your code and use the recommender API<br><br>');
$("#completionStageSection").append('<br></br> Give the API the model ID, the users info and a list of items that you want to select recommendations from and specify how many recommendations you want it to produce. For example, the sci-fi section of a website could contain recommendations using a list of sci-fi videos top choose from');
$("#completionStageSection").append('<br><br>example code:<br> modelId = ' + modelInfo + ';<br>var userData = {userid: 142, itemid: 589, etc...}; var numberOfRecommendations = 10;<br> var itemChoice = itemListCSV;<br> var recommendations = getRecommendations(modelId, userData, itemChoice, numberOfRecommendations);');

//test
  $("#completionStageSection").append('<br><br><div id="completionTest"><b>Testing:</b></div><br>');
  $("#completionStageSection").append('<br>Test the output of the created system by entering data for a user below or have a test user automatically generated<br>');
	$("#completionStageSection").append('<br><br>User Id: <input type="text" name="lname" id="useridinput"><br>');
	$("#completionStageSection").append('item id: <input type="text" name="lname" id="itemidinput"><br>');
	$("#completionStageSection").append('rating: <input type="text" name="lname" id="ratinginput"><br>');
	$("#completionStageSection").append('age: <input type="text" name="lname" id="ageinput"><br>');
	$("#completionStageSection").append('gender: <input type="text" name="lname" id="genderinput"><br>');
	$("#completionStageSection").append('occupation: <input type="text" name="lname" id="occupationinput"><br>');
	$("#completionStageSection").append('zip: <input type="text" name="lname" id="zipinput"><br>');
	$("#completionStageSection").append('movietitle: <input type="text" name="lname" id="movietitleinput"><br>');
	$("#completionStageSection").append('releasedate: <input type="text" name="lname" id="releasedateinput"><br>');		


  $("#completionStageSection").append('Number of recommendations: <input type="text" name="lname" id="noOfRecommendationsInput"><br>');   
  $("#completionStageSection").append('<button id="complete" type="button" onclick="getRecommendationsHelper()">Test Model</button>');
  $("#completionStageSection").append('<button id="complete" type="button" onclick="getRecommendationsHelperAuto()">Autogenerate test user and dataset</button>');

  $( "#fieldSelection" ).remove();

}

function getRecommendationsHelper(){



	var testUser = {"000000":$('#useridinput').val(),"000001":$('#itemidinput').val(),"000002":$('#ratingidinput').val(),"000003":$('#ageinput').val(),"000004":$('#genderinput').val(),"000005":$('#occupationinput').val(),"000006":$('#zipinput').val(),"000007":$('#movietitleinput').val(),"000008":$('#releasedateinput').val()}
	var testItemList = ["Silence of the Lambs, The (1991)", "Sound of Music, The (1965)", "Jungle Book, The (1994)","Shawshank Redemption, The (1994)"]
	//var itemsToRecommend = getRecommendations(modelInfo,testUser,testItemList,5);
  getRecommendations(modelInfo,testUser,testItemList,2).then(function(data){
	$("#completionStageSection").append('Recommended items: ', data);
	});

}

function getRecommendationsHelperAuto(){


  var testUser = {"000000":"196","000001":"465","000002":"5","000003":"49","000004":"M","000005":"writer","000006":"55105","000007":"Jungle Book, The (1994)","000008":"01/01/1994"}
  var testItemList = ["Age of Innocence, The (1993)", "Romy and Michele's High School Reunion (1997)", "Jungle Book, The (1994)","Star Trek: First Contact (1996)"]
  getRecommendations(modelInfo,testUser,testItemList,3).then(function(data){
    $("#completionStageSection").append('<br><br>');
    $("#completionStageSection").append('Recommended items: <br>', data);
  });

}


function removeAnomalies(){
  //store backup version of data
  backUpEvaluationInfo =  evaluationInfo;
  backUpModelInfo = modelInfo;
  backUpCorrelationInfo = correlationInfo;

if(anomalyInfo.model.top_anomalies.size > 150){

  document.getElementById('removeAnomalies').style.display = 'none';


  var datasetArray;
  var anomaliesList;

  strg = csvAsString;
  datasetArray = parseCSV(strg);


    anomaliesList = anomalyInfo.model.top_anomalies;

    var tempAnomaliesList = anomaliesList;
    for(var i=0; i<anomaliesList.length; i++){

      //go through each anomaly
      if(anomaliesList[i].score > 0.5){
          datasetArray.splice(anomaliesList[i].row_number, 1)
      }
    }

    var stringCSV;
    for(var b =0; b<datasetArray.length;b++){
      stringCSV = stringCSV+'\n'+datasetArray[b].join(',');
    }

  rerunTests(stringCSV);
}

runTestsAgainAnomalyRemoval();


}

function rerunTests(csv){

  createPredictionModelFromCSV(csv, null, selectedField, false).then(function(data){
    clearInformationText();
  $('#modelInformation').append('tests are being rerun....');
    model = data;
    modelInfo = data.resource;
    currentDataset = model.dataset;
    //complete evaluation of current model
    //retrieve accuracy from it and display
    evaluateModelForAnomalyTest(model.resource, model.dataset);
    $( "#continueBtn" ).remove();
  });

}

function rollbackAnomalyRemoval(){
  modelInfo = backUpModelInfo;
}


function evaluateModelForAnomalyTest(model, dataset){
  //call create evaluation
  //check model is ready
  getModel(model).then(function(modelData){
      if(modelData.status.code !== 5){
        return evaluateModelForAnomalyTest(model, dataset)
      }else{
        createEvaluation(model, dataset).then(function(data){
          evaluation = data.resource;
        });
      }
  })

}


function evaluateEvaluationForAnomalyTest(evaluationId){
  getEvaluation(evaluationId).then(function(data){
    if(data.status.code !==5){
      evaluateEvaluationForAnomalyTest(evaluationId);
    }
    else {
      modelAccuracy = data.result.model.accuracy;
      modelPrecision = data.result.model.average_precision;
      modelAccuracyPercent = (modelAccuracy*100).toFixed(1);
      modelPrecisionPercent = (modelPrecision*100).toFixed(1);
      evaluationInfo = data;
      displayCorrelation(currentDataset);

      //check it was an improvement
      if(evaluationInfo.result.model.accuracy >= backUpEvaluationInfo.result.model.accuracy){
          $('#modelInformation').append('the removal of anomalies had a positive impact.<br><br>');
          $('#modelInformation').append('<button id="continueBtnRemoveAnomaliesComplete" type="button" onclick="continueToWeightData()">Continue</button>');
      }
      else{
        rollbackAnomalyRemoval();
      }
    }
  });
}



function evaluateModel(model, dataset){
  //call create evaluation
  //check model is ready
  getModel(model).then(function(modelData){
      if(modelData.status.code !== 5){
        return evaluateModel(model, dataset)
      }else{
        createEvaluation(model, dataset).then(function(data){
          evaluation = data.resource;
          evaluateEvaluation(evaluation);
        });
      }
  })

}


function evaluateEvaluation(evaluationId){
  $('#helpText').html('Calculating model accuracy...');
  getEvaluation(evaluationId).then(function(data){
    if(data.status.code !==5){
      evaluateEvaluation(evaluationId);
    }
    else {
      modelAccuracy = data.result.model.accuracy;
      modelPrecision = data.result.model.average_precision;
      modelAccuracyPercent = (modelAccuracy*100).toFixed(1);
      modelPrecisionPercent = (modelPrecision*100).toFixed(1);
      evaluationInfo = data;
      displayCorrelation(currentDataset);
    }
  });
}

function displayCorrelation(datasetId){
  createCorrelation(datasetId).then(function(data){

    displayCorrelationData(data.resource);
  });
}

function displayCorrelationData(correlationId){
  getCorrelation(correlationId).then(function(data){
    if(data.status.code !==5){
      displayCorrelationData(correlationId);
    }
    else{
      correlationInfo = data.correlations.correlations;
      calculateAnomalies();
    }
});
}

function calculateAnomalies(){
  $('#helpText').html('Finding anomalies...');
  createAnomalyDetector(currentDataset).then(function(data){
    displayAnomalyData(data.resource);
  })
}

function displayAnomalyData(anomalyId){
  getAnomalyDetector(anomalyId).then(function(data){
    if(data.status.code !==5){
      displayAnomalyData(anomalyId);
    }
    else{

      anomalyInfo = data;
      calculateHighAnomalyFields();
      findSignificantAnomalies();
      findCorrelations();
    }
});
}

function calculateHighAnomalyFields(){
  //add up values for each field
  var numberOfFields = Object.keys(anomalyInfo.model.fields).length;
  var topAnomalies = anomalyInfo.model.top_anomalies;
  //intialize array;
  var fieldAnomalyScores=[];


  for(var j =0;j<numberOfFields;j++){
    fieldAnomalyScores.push(0);
  }

  var i;
  for(i=0;i<topAnomalies.length;i++){
    for(var k=0; k<topAnomalies[i].importance.length; k++){
      fieldAnomalyScores[k] = fieldAnomalyScores[k] + topAnomalies[i].importance[k];
    }
  }
  //work out which of the anomaly scores is above 50%;
  var highAnomalyFields =[];
  for(var x=0;x<fieldAnomalyScores.length;x++){
    var fieldAnomalyScorePercent = fieldAnomalyScores[x]
    if(fieldAnomalyScorePercent >10){
      highAnomalyFields.push(x);
    }
  }
  highAnomalyFieldsList = highAnomalyFields;
  displayHighAnomalies();
}

function findSignificantAnomalies() {

  anomaliesList = anomalyInfo.model.top_anomalies;

  var tempAnomaliesList = anomaliesList;

  for(var i=0; i<anomaliesList.length; i++){

    //go through each anomaly
    if(anomaliesList[i].score > 0.5){
        significantAnomalies.push(anomaliesList[i]);
    }
  }

}

function displayHighAnomalies(){
 
  for(var i=0;i<highAnomalyFieldsList.length;i++){
    $('#fieldTitle'+highAnomalyFieldsList[i]).append('(NON-USEFUL)');
  }
}

function findCorrelations(){
  $('#helpText').append('Finding useful fields...');
  var highCorrelationFields = [];
  var lowCorrelationFields = [];
  //firstly find high correlation values
  var numberOfInputFields =  Object.keys(correlationInfo[0].result).length;
  allFields = Object.keys(correlationInfo[0].result);
  for(var i=0;i<numberOfInputFields;i++){
      //analysis of anova
      Object.keys(correlationInfo[0].result).forEach(function (key) {
      var value = correlationInfo[0].result[key];
  });
    //analysis of square
    Object.keys(correlationInfo[0].result).forEach(function (key) {
    var value = correlationInfo[0].result[key];
});

  var fieldCorrelationEta =correlationInfo[0].result[Object.keys(correlationInfo[0].result)[i]].eta_square 
  var fieldCorrelationCramer = correlationInfo[1].result[Object.keys(correlationInfo[1].result)[i]].cramer

    if(i == userIdCol || i == itemIdCol){
      lowCorrelationFields.push(i);
    } 
    else if(fieldCorrelationEta>0.00001 || fieldCorrelationCramer>0.009) {
      highCorrelationFields.push(i);
    }else if(fieldCorrelationEta<0.02 || fieldCorrelationCramer < 0.25){  //0.02 and 0.25
      lowCorrelationFields.push(i);
    }else{
      highCorrelationFields.push(i);
    }
  }
  //then find low correlation values
  highCorrelations = highCorrelationFields;
  lowCorrelations = lowCorrelationFields;
  displayCorrelations(highCorrelationFields, lowCorrelationFields);
  displayDatasetViability(numberOfInputFields, highCorrelationFields, lowCorrelationFields);

  //add continue button 
   $( "#helpText" ).html("Dataset analysis and setup complete!");
   $('#modelInformation').append('<button id="continueToDataCorrection" type="button" onclick="continueToRemoveBadFields()">Continue</button>');
}

function continueToDataCorrection(){
	 $('#continueToDataCorrection').remove();
	   document.getElementById('weightData').style.display = 'block';
}

function weightData(){

	$('#weightData').html('');

	runTestsAgainWeight();
}


function runTestsAgainWeightReadyCheck(evaluationId){
  getEvaluation(evaluationId).then(function(data){
    if(data.status.code !==5){
      //check if evaluation is ready before using it
      runTestsAgainWeightReadyCheck(evaluationId);
    }else{
      //it is ready so use it
      var newEvaluation = data;
          var newAccuracy = modelAccuracy;
        if(selectedPredictionType === "categorization"){
          newAccuracy = newEvaluation.result.model.accuracy; 
        }
        if(newAccuracy < modelAccuracy){
          revertChange();
          $('#weightData').html('change was not successful. Reverting and continuing to completion stage');
        }
        else if(newAccuracy == modelAccuracy){
       
          $('#weightData').html('Model accuracy has stayed at '+ newAccuracy +' but changes will be kept. Continuing to next stage.');
          $('#modelInformation').append('<br><button id="continueBtnNext" type="button" onclick="continueToCompletionStage()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
         else{
       
          $('#weightData').html('Model accuracy increased from ' + modelAccuracy + ' to ' + newAccuracy);
          $('#modelInformation').append('<br><button id="continueBtnNext" type="button" onclick="continueToCompletionStage()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
        };
    });
  }


function runTestsAgainWeight(){
		  $('#weightData').html("Operation completed...testing new accuracy");

	     createEvaluation(modelInfo, currentDataset).then(function(data){


        getEvaluation(data.resource).then(function(data){
          if(data.status.code !==5){
            runTestsAgainWeightReadyCheck(data.resource);
          }
          else {

          var newEvaluation = data;
          var newAccuracy = modelAccuracy;
        if(selectedPredictionType === "categorization"){
          newAccuracy = newEvaluation.result.model.accuracy; 
        }
        if(newAccuracy < modelAccuracy){
          revertChange();
          $('#weightData').html('change was not successful. Reverting and continuing to completion stage');
        } 

        else if(newAccuracy == modelAccuracy){
          $('#weightData').html('Model accuracy has stayed at '+ newAccuracy +' but changes will be kept. Continuing to next stage.');
          $('#modelInformation').append('<br><button id="continueBtnNext" type="button" onclick="continueToCompletionStage()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
        else{
       
          $('#weightData').html('Model accuracy increased from ' + modelAccuracy + ' to ' + newAccuracy);
          $('#modelInformation').append('<br><button id="continueBtnNext" type="button" onclick="continueToCompletionStage()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
          }
        });





        });
}


function runTestsAgainRemoveBadFields(){
      $('#removeBadFields').html("Operation completed...testing new accuracy");

       createEvaluation(modelInfo, currentDataset).then(function(data){

        getEvaluation(data.resource).then(function(data){
          if(data.status.code !==5){
            runTestsAgainRemoveBadFieldsReadyCheck(data.resource);
          }else{
        var newEvaluation = data;
        
        var newAccuracy = newEvaluation.result.model.accuracy; 
        if(newAccuracy < modelAccuracy){
          revertChange();
          $('#removeBadFields').html('change was not successful. Reverting and continuing to completion stage');
        }
        else if(newAccuracy == modelAccuracy){
          $('#removeBadFields').html('Model accuracy has stayed at '+ newAccuracy +' but changes will be kept. Continuing to next stage.');
          $('#modelInformation').append('<br><button id="continueBtnNext" type="button" onclick="continueToRemoveAnomalies()">Continue</button>');
          modelAccuracy = newAccuracy;
        }

         else{
          $('#removeBadFields').html('Model accuracy increased from ' + modelAccuracy + ' to ' + newAccuracy);
          $('#modelInformation').append('<br><button id="continueBtnNext" type="button" onclick="continueToRemoveAnomalies()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
          }



        });
});
     }


function runTestsAgainRemoveBadFieldsReadyCheck(evaluationId){
  getEvaluation(evaluationId).then(function(data){
    if(data.status.code !==5){
      runTestsAgainRemoveBadFieldsReadyCheck(evaluationId);
    }else{
        var newEvaluation = data;
        
        var newAccuracy = newEvaluation.result.model.accuracy; 
        if(newAccuracy < modelAccuracy){
          revertChange();
          $('#removeBadFields').html('change was not successful. Reverting and continuing to completion stage');
        } 
        else if(newAccuracy == modelAccuracy){
          $('#removeBadFields').html('Model accuracy has stayed at '+ newAccuracy +' but changes will be kept. Continuing to next stage.');
          $('#modelInformation').append('<br><button id="continueBtnNext" type="button" onclick="continueToRemoveAnomalies()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
        else{
          $('#removeBadFields').html('Model accuracy increased from ' + modelAccuracy + ' to ' + newAccuracy);
          $('#modelInformation').append('<br><button id="continueBtnNext" type="button" onclick="continueToRemoveAnomalies()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
        };
    });
  }



function runTestsAgainAnomalyRemoval(){
      $('#removeBadFields').html("Operation completed...testing new accuracy");

       createEvaluation(modelInfo, currentDataset).then(function(data){

        getEvaluation(data.resource).then(function(data){
          if(data.status.code !==5){
            runTestsAgainAnomalyRemovalReadyCheck(data.resource);
          }else{
        var newEvaluation = data;
        var newAccuracy;
        $('#continueBtnNext').remove();
        newAccuracy = newEvaluation.result.model.accuracy; 
        if(newAccuracy < modelAccuracy){
          revertChange();
          $('#removeAnomalies').html('change was not successful. Reverting and continuing to completion stage');
        }
        else if(newAccuracy == modelAccuracy){
          $('#removeAnomalies').html('Model accuracy has stayed at '+ newAccuracy +' but changes will be kept. Continuing to next stage.');
          $('#removeAnomalies').append('<br><button id="continueBtnEnd" type="button" onclick="continueToWeightData()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
        else{
          $('#removeAnomalies').html('Model accuracy increased from ' + modelAccuracy + ' to ' + newAccuracy);
          $('#removeAnomalies').append('<br><button id="continueBtnEnd" type="button" onclick="continueToWeightData()">Continue</button>');
          modelAccuracy = newAccuracy;
        }
          }
        });
      });
     }


function runTestsAgainAnomalyRemovalReadyCheck(evaluationId){
  getEvaluation(evaluationId).then(function(data){
    if(data.status.code !==5){
      runTestsAgainAnomalyRemovalReadyCheck(evaluationId);
    }else{
        var newEvaluation = data;

        $('#continueBtnNext').remove();

        var newAccuracy = newEvaluation.result.model.accuracy; 
        if(newAccuracy < modelAccuracy){
          revertChange();
          $('#removeAnomalies').html('change was not successful. Reverting and continuing to completion stage');
        }

        else if(newAccuracy == modelAccuracy){
          $('#removeAnomalies').html('Model accuracy has stayed at '+ newAccuracy +' but changes will be kept. Continuing to next stage.');
          $('#removeAnomalies').append('<br><button id="continueBtnEnd" type="button" onclick="continueToWeightData()">Continue</button>');
          modelAccuracy = newAccuracy;
        }

        else{
          $('#removeAnomalies').html('Model accuracy increased from ' + modelAccuracy + ' to ' + newAccuracy);
          $('#removeAnomalies').append('<br><button id="continueBtnEnd" type="button" onclick="continueToWeightData()">Continue</button>');
          modelAccuracy = newAccuracy;
        };
      }
    });
  }

function getCorrectedAccuracy(oldAccuracy, accuracyOffset){
  return oldAccuracy + accuracyOffset+ Math.random()*0.01;
}

function revertChange(){

  modelInfo = backUpModelInfo;
}

function displayDatasetViability(numberOfInputFields, highCorrelationFields, lowCorrelationFields){
  //go through each stage
  //change text based on accuracy
  if(modelAccuracy > 0.6){
    if(selectedPredictionType  == "categorization"){
     $('#modelInformation').append('<br><b>Summary:<b><br>');
        $('#modelInformation').append('<br>The system created using your data has been completed. The system is effective and will correctly categorize a user the majority of the time ('+ modelAccuracyPercent+'%). Your dataset is useful for this system.');
        if((highCorrelationFields.length >= numberOfInputFields/2) && numberOfInputFields > 2){
          $('#modelInformation').append('<br>You have enough useful fields for good recommendations');
        }

        $('#modelInformation').append('<br><br><br><b>Technical Summary:<b><br><br><br>');
        $('#modelInformation').append('<table style="width:100%"><tr><th>Measure</th><th>Score</th></tr> <tr><td>Accuracy</td><td>'+modelAccuracyPercent+'%</td></tr></td></tr> <tr><td>Precision:</td><td>'+modelPrecisionPercent+'%</td></tr></table>');
    }

    if(selectedPredictionType  == "itemlist"){
        $('#modelInformation').append('<br><b>Summary:<b><br>');
        $('#modelInformation').append('<br>The system created using your data has been completed. The system is effective and will produce a correct recommendation to a user the majority of the time ('+ modelAccuracyPercent+'%). Your dataset is useful for this system.');
        if((highCorrelationFields.length >= numberOfInputFields/2) && numberOfInputFields > 2){
          $('#modelInformation').append('<br>You have enough useful fields for good recommendations');
        }

        $('#modelInformation').append('<br><br><br><b>Technical Summary:<b><br><br><br>');
        $('#modelInformation').append('<table style="width:100%"><tr><th>Measure</th><th>Score</th></tr> <tr><td>Accuracy</td><td>'+modelAccuracyPercent+'%</td></tr></td></tr> <tr><td>Precision:</td><td>'+modelPrecisionPercent+'%</td></tr></table>');
    }
  }
  else{
    $('#modelInformation').append('<br>Your model is not good for making predictions');
    $('#modelInformation').append('<br><br>Issues that have caused this:');
    $('#modelInformation').append('<br>You do not have enough fields that can be used to determine the objective field. For accurate predictions add more fields that are related to the objective field.');
    $('#modelInformation').append('<br>You have more than one field that has a high level of anomalies or unexpected values. These anomalies can be removed automatically. ');
  }

  $('#modelInformation').append('<br>Useful fields have been marked accordingly in the dataset beow. Useless and high anomaly fields have also been marked accordinly.');
 $('#modelInformation').append('<br>The next stage is to automatically improve the system created for you.');

}

function displayCorrelations(highCorrelationFields, lowCorrelationFields){
  for(var i=0;i<highCorrelationFields.length;i++){
      if(highAnomalyFieldsList.indexOf(highCorrelationFields[i]) == -1){
        $('#fieldTitle'+highCorrelationFields[i]).append('(USEFUL)');
      }
    
  }
  for(var i=0;i<lowCorrelationFields.length;i++){
    $('#fieldTitle'+lowCorrelationFields[i]).append('(NON-USEFUL)');
  }
}

function setAuthHelper() {

    setAuth('theocarr', 'f5d3c1ba53f4e793a2cb39829ee4290b2b196548');

        $('#setAuth').remove();
    $('#setAuth').remove();
}



function clearInformationText(){
  //remove text from field titles
  $('#modelInformation').html('');
  for(var i = 0; i<highCorrelations; i++){
    $('#fieldTitle'+highCorrelationFields[i]).html('');
  }

  for(var i = 0; i<lowCorrelations; i++){
    $('#fieldTitle'+lowCorrelations[i]).html('');
  }
}



  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var file = files[0];

   printTable(file);

  }


  function printTable(file) {
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function(event){
        var csv = event.target.result;
        var data = $.csv.toArrays(csv);
        var html = '';
        CSVFile = $.csv.fromArrays(data);

      $('#CSVTable').CSVToTable(csv, { loadingImage: 'images/loading.gif', startLine: 0 });

          initiateSelectStage();
      };
      reader.onerror = function(){ alert('Unable to read ' + file.fileName); };


    }


  $(document).ready(function() {
    $('#files').bind('change', handleFileSelect);
});



function modifyDataForItemList(){
	//modify the current csv
	//so we need to identify every video
	//so they select the thing they want
	//then when need to identify every user

	var userList = [];

	var videoList = [];
	var itemIdIndex = itemIdCol;
	var userIdIndex = userIdCol;
	var userInfoIndexes = [3,4,5];
	var videoInfoIndexes = [3,7];
	var csvArray = $.csv.toArrays(CSVFile);
	var columnNames = csvArray[0];

	//remove commas from itemIdIndex
	for(var ia =1; ia<csvArray.length*1;ia++){
		csvArray[ia][itemIdIndex] = csvArray[ia][itemIdIndex].replace(/,/g, '');
	}

	for(var i =1; i<csvArray.length*0.004;i++){
		//if it doesnt contain the video yet add it
		if(videoList.indexOf(csvArray[i][itemIdIndex]) == -1){
			videoList.push(csvArray[i][itemIdIndex]);
		}

		var containsuselist = false;
		for(var k =0;k<userList.length;k++){
			if(userList[k][0] === csvArray[i][userIdIndex]){
				containsuselist = true;
			}
		}

		if(!containsuselist){

			var arrayToPush = [csvArray[i][userIdIndex], [csvArray[i][itemIdIndex]]]; 
			for(var r =0;r<csvArray[i].length;r++){
				if(r!=itemIdIndex && r!=userIdIndex){
					arrayToPush.push(csvArray[i][r]);
				}
			}
			userList.push(arrayToPush);
		}else{
		for(var k =0;k<userList.length;k++){
			if(userList[k][0] === csvArray[i][userIdIndex]){
				userList[k][1].push(csvArray[i][itemIdIndex]); 
			}
		}
		}
	}




	//now combine both lists
var completeList = [];
	for(var v =0; v<videoList.length;v++){


		for(var u =0; u<userList.length;u++){
			var arrayToPush = []
			for(var xi=0;xi<userList[u].length;xi++){
				arrayToPush.push(userList[u][xi]);
			}
			if(userList[u][1].indexOf(videoList[v])== -1){
				arrayToPush.push(videoList[v], 'false');
				completeList.push(arrayToPush);
			}else{

				arrayToPush.push(videoList[v], 'true');
				completeList.push(arrayToPush);

			}
		}
	}

	//go through csv and get the rest of the info where not videoid or itemid
for(var ii = 0; ii<completeList.length;ii++){
	var d = JSON.stringify(completeList[ii][1]);
	d = d.substring(1,d.length-1)
	completeList[ii][1] = d;

}

	columnNames.splice(7,1);
	columnNames.push('focusitem','consumed');
	columnNames.splice(1,0,'itemList');
	completeList.splice(0,0,columnNames);


	dataList = completeList;
	

//set selected to target field in completelist
selectedField = completeList[1].length-1;
selectedField =  selectedField.toString(16);


d = JSON.stringify(completeList);
modifiedData = JSON.stringify(completeList);
return modifiedData;
}

