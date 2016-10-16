var BIGML_USERNAME='theocarr'
var BIGML_API_KEY='f5d3c1ba53f4e793a2cb39829ee4290b2b196548'
var BIGML_AUTH="username="+BIGML_USERNAME+";api_key="+BIGML_API_KEY

//used in getting predictions


//COLLECTIONS
var projects = null;
var datasets = null;

function setAuth(username, apikey) {
  BIGML_AUTH = "username=" +username +";api_key=" + apikey;
}

function createDataset(sourceID){
  var datasetSource = {source : sourceID};
  datasetSource = JSON.stringify(datasetSource);
  $.ajax({
      url : "https://bigml.io/dev/dataset?username=theocarr;api_key=f5d3c1ba53f4e793a2cb39829ee4290b2b196548",
      type: "POST",
      data : datasetSource,
      contentType: 'application/json',
      success: function(data, textStatus, jqXHR)
      {
        var datasetID = data.resource;
      },
      error: function (jqXHR, textStatus, errorThrown)
      {
      }
  });
}





function createProject(){
  $.ajax({
      url : "https://bigml.io/dev/project?username=theocarr;api_key=f5d3c1ba53f4e793a2cb39829ee4290b2b196548",
      type: "POST",
      data :JSON.stringify({name: "My first project"}),
      contentType: 'application/json',
      success: function(data, textStatus, jqXHR)
      {
      },
      error: function (jqXHR, textStatus, errorThrown)
      {
      }
  });
}




function getProjects(){
  $.ajax({
      url : "https://bigml.io/dev/project?" + BIGML_AUTH, 
      type: "GET",
      contentType: 'application/json',
      async: false,
      success: function(data)
      {
        projects = data.objects;
        return projects;
      },
      error: function (jqXHR, textStatus, errorThrown)
      {
        return projects;
      }
  });
}

function getSources() {
  var promise = $.ajax({
        url : "https://bigml.io/dev/source?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data.objects;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      data = data.objects;
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}


function getDatasets() {
  var promise = $.ajax({
        url : "https://bigml.io/dev/dataset?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data.objects;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      data = data.objects;
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}

function getDataset(datasetId){
  var promise = $.ajax({
        url : "https://bigml.io/dev/"+datasetId+ "?" + BIGML_AUTH, 
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}

function getModel(modelId){
  var promise = $.ajax({
        url : "https://bigml.io/dev/"+modelId+ "?" + BIGML_AUTH, 
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}

function getModels() {
  var promise = $.ajax({
        url : "https://bigml.io/dev/model?" + BIGML_AUTH, 
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data.objects;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      data = data.objects;
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}

function getPredictions() {
  var promise = $.ajax({
        url : "https://bigml.io/dev/prediction?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data.objects;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      data = data.objects;
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}

function createPrediction(modelID, inputData){
  var data = {model : modelID,
    input_data : inputData};
  d = JSON.stringify(data);
  var promise = $.ajax({
        url : "https://bigml.io/dev/prediction?" + BIGML_AUTH,
        type: "POST",
        data: d,
        contentType: 'application/json',
        async: true,
        success: function(data, textStatus, jqXHR)
        {
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      //data = data.objects;
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}


//create functions
function createSource(data, project){

    var d = {data: data, project: project}
    d = JSON.stringify(d);

    var promise = $.ajax({
          url : "https://bigml.io/dev/source?" + BIGML_AUTH,
          type: "POST",
          data: d,
          contentType: 'application/json',
          async: true,
          success: function(data, textStatus, jqXHR)
          {
          },
          error: function (jqXHR, textStatus, errorThrown)
          {
          }
      }).then(function(data){
        //data = data.objects;
        if(data.status.code !==5){
          return checkReady(data.resource);
        }
        else{return data};
      });

      promise.done(function(data) {
      });
      return promise;
}

function createSourceFromRemote(remoteFile, project){

    var d = {remote: remoteFile, project: project}
    d = JSON.stringify(d);

    var promise = $.ajax({
          url : "https://bigml.io/dev/source?" + BIGML_AUTH,
          type: "POST",
          data: d,
          contentType: 'application/json',
          async: true,
          success: function(data, textStatus, jqXHR)
          {
          },
          error: function (jqXHR, textStatus, errorThrown)
          {
          }
      }).then(function(data){

        if(data.status.code !==5){
          return checkReady(data.resource);
        }
        else{return data};
      });

      promise.done(function(data) {
      });
      return promise;
}

function checkReady(sourceId){
  var promise = $.ajax({
        url : "https://bigml.io/dev/" + sourceId + "?" + BIGML_AUTH, 
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      if(data.status.code !==5){
        return checkReady(sourceId);
      }else{
      return data;
    }
    });

    promise.done(function(data) {
    });
    return promise;
}


//create functions
function createRemoteSource(sourceUrl, project){

  var d = {remote: sourceUrl, project: project}
  d = JSON.stringify(d);

  var promise = $.ajax({
        url : "https://bigml.io/dev/source?" + BIGML_AUTH,
        type: "POST",
        data: d,
        contentType: 'application/json',
        async: true,
        success: function(data, textStatus, jqXHR)
        {
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      //data = data.objects;
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}

function createDataset(source, project){

  var d = {source: source, project: project}
  d = JSON.stringify(d);

  var promise = $.ajax({
        url : "https://bigml.io/dev/dataset?" + BIGML_AUTH,
        type: "POST",
        data: d,
        contentType: 'application/json',
        async: true,
        success: function(data, textStatus, jqXHR)
        {
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      if(data.status.code !==5){
        return checkReady(data.resource);
      }
      else{return data};
    });

    promise.done(function(data) {
    });
    return promise;
}

function checkDataReady(datasetId){
  var promise = $.ajax({
        url : "https://bigml.io/dev/"+datasetId+ "?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      if(data.status.code !== 5){

        return checkDatasetReady(datasetId);
      }
      return data;
    });

    promise.done(function(data) {
    });
    return promise;

}

function checkDatasetReady(dataset){
  var datasetReady = true;
  getDataset(dataset).then(function(d){
    datasetReady = (d.status.code !== 1);
    if(datasetReady){
      return d
    }else{
      return checkDatasetReady(dataset);
    }
  })

}

function checkModelReady(datasetId){
  var promise = $.ajax({
        url : "https://bigml.io/dev/"+datasetId+ "?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      if(data.status.code < 3){

        return checkModelsetReady(datasetId);
      }
      return data;
    });

    promise.done(function(data) {
    });
    return promise;

}

function checkModelsetReady(model){
  var datasetReady = false;
  getModel(model).then(function(d){
    datasetReady = (d.status.code > 2);
    if(datasetReady){
      return true
    }else{
      return checkModelsetReady(model);
    }
  })

}


function combineDatasets(dataset1, dataset2, project) {
  var d = {origin_datasets: [dataset1, dataset2], project: project}
  d = JSON.stringify(d);

  var promise = $.ajax({
        url : "https://bigml.io/dev/dataset?" + BIGML_AUTH,
        type: "POST",
        data: d,
        contentType: 'application/json',
        async: true,
        success: function(data, textStatus, jqXHR)
        {
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
 }


function createModel(dataset, project, predictedFieldId, balanceWeights){

  var d = {dataset: dataset, project: project, objective_field: predictedFieldId, "balance_objective": balanceWeights}
  d = JSON.stringify(d);

  var promise = $.ajax({
        url : "https://bigml.io/dev/model?" + BIGML_AUTH,
        type: "POST",
        data: d,
        contentType: 'application/json',
        async: true,
        success: function(data, textStatus, jqXHR)
        {
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}


function getSource(sourceId) {
  var promise = $.ajax({
        url : "https://bigml.io/dev/" + sourceId + "?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      //data = data;
      return data;
    });

    promise.done(function(data) {
    });
    return promise;

}

function updateSource(sourceId, update) {
  update = JSON.stringify(update);
  var promise = $.ajax({
        url : "https://bigml.io/dev/" + sourceId + "?" + BIGML_AUTH,
        type: "PUT",
        data: update,
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      return data;
    });

    promise.done(function(data) {
    });
    return promise;

}



function updateDataset(dataset, data){


  if(data.preferred){
    update = JSON.stringify(update);
    var promise = $.ajax({
          url : "https://bigml.io/dev/" + dataset + "?" + BIGML_AUTH,
          type: "PUT",
          data: update,
          contentType: 'application/json',
          async: true,
          success: function(data)
          {
            data = data;
          },
          error: function (jqXHR, textStatus, errorThrown)
          {
          }
      }).then(function(data){
        return data;
      });

      promise.done(function(data) {
      });
      return promise;
  }
}


//data has to specify fieldname and value
function updatePredictionModel(modelId, updateData, project) {

var predictedField;

updateData = [{"sepal length":5.1,"sepal width":3.5,"petal length":1.4,"petal width":0.2 ,"species":"Iris-setosa"},{"sepal length":4.9,"sepal width":3.0,"petal length":1.4,"petal width":0.2 ,"species":"Iris-setosa"}]

updateData = JSON.stringify(updateData).replace(/"/g, '\"');

  return new Promise (function(resolve, reject){
    getModel(modelId).then(function(data){
      var newDataset;
      var currentDataset = data.dataset;
      predictedField = data.objective_field;
   createSource(updateData, project).then(function(data){
     sourceId = data.resource;
      createDataset(sourceId, project).then(function(data){
        updateData = data.resource;
        //resolve(data.resource);
        combineDatasets(updateData, currentDataset).then(function(data){
          newDataset = data.resource;
          createModel(newDataset, project, predictedField).then(function(data){
            resolve(data.resource);
          });
        });
      });
   });
 });
});
}


function getPrediction(model, input) {
 var inputData = {"sepal length":5.1,"sepal width":3.5,"petal length":1.4,"petal width":0.2 ,"species":"Iris-setosa"};
  return new Promise (function(resolve, reject){
    createPrediction(model, inputData).then(function(d){
      resolve(d.prediction[Object.keys(d.prediction)[0]]);
    })
  })
}

function CreatePredictionModelFromFields(fields, project){

}

//this is to create a model just from the fields. Not used in helper. 
function createPredictionModel(fields, project) {

  var project = project;
  var source = null;
  var dataset = null;
  var model = null;
  var prediction = null;


  //VALIDATION
  //if final field is not last make it last
  if(fields[fields.length-1].prediction !== true){
    var lastField = fields[fields.length-1];
    for(var i = 0; i< fields.length-1;i++){
      //if i is prediction true, then remove from here and add to end.
      if(fields[i].prediction) {
        fields[fields.length-1] = fields[i];
        fields[i] = lastField;
      }
    }
    //test
    if(fields[fields.length-1].prediction !== true){
      alert('Error: no valid target field in fields (createPredictionUI)')
    }
  }

var sourceData =[];

var sourceDataFields = {};
for(var i =0;i<fields.length;i++) {
    var fieldName = fields[i].name;
}

sourceDataFields = "a,b,c,d\n,,,";


return new Promise (function(resolve, reject){
 createSource(sourceDataFields, project).then(function(data){
    source = data.resource
    updateSourcesUI();
    //then set the fields to correct data type
 getSource(source).then(function(d){
      d = d.fields

var i=0;


var fieldArray = $.map(d, function(value, index) {
    return [value];
});


fieldArray.forEach(function(key, index){

});


  $.each(d, function(key, value, index) {
      value = fieldArray[index];
  });

    //DELETE unneccesary keys
    for (var key in d) {
      if (d.hasOwnProperty(key)) {
        delete(d[key]['order']);
        delete(d[key]['term_analysis']);
        delete(d[key]['column_number']);
      }
    }




    updateSource(source, update).then(function(d){
      createDataset(source).then(function(d){
        dataset = d.resource;

      createModel(dataset).then(function(d){
         model=d.resource;
         resolve(model);
        })

      });
    });


});

});
});
};





function createItemListFromCSV(csv, project, predictedField, fromUrl) {


return new Promise (function(resolve, reject){


  createSource(csv, project).then(function(d){
      var sourceId = d.resource;
        //here we modify the source to have a itemlist field

        var update = {fields:  {"000001": {"name": "itemlist", "optype":"items","item_analysis": {"separator": ","}}}};
       //var update = JSON.stringify({fields: {"0000001": {"optype": "items", "items_analysis": {"separator": ","}}}})
       
       // updateSource(sourceId, update).then(function(d){
       getSource(sourceId).then(function(d){



                createDataset(sourceId, project).then(function(d){


          var datasetId = d.resource;//{"preferred": true}
          var datasetUpdate = {fields:  {"000009": {"preferred": true}}};
          updateSource(datasetId, datasetUpdate).then(function(d){
          var predictedFieldId;

                   predictedFieldId = "000000" + predictedField;
                   predictedFieldId.substr(predictedFieldId.length-7);


                   predictedFieldId = (new Array(6 + 1).join('0') + predictedField).slice(-6);
                  predictedFieldId = ("000000" + predictedField).slice(-6);

          createModel(datasetId, project, predictedFieldId, true).then(function(d){
            resolve(d);
          });
        });
      });

        });

    });
//}
});
}










function createPredictionModelFromCSV(csv, project, predictedField, fromUrl) {


return new Promise (function(resolve, reject){

  createSource(csv, project).then(function(d){
      var sourceId = d.resource;

      createDataset(sourceId, project).then(function(d){
          var datasetId = d.resource;

          var predictedFieldId;

                   predictedFieldId = "000000" + predictedField;
                   predictedFieldId.substr(predictedFieldId.length-7);


                   predictedFieldId = (new Array(6 + 1).join('0') + predictedField).slice(-6);
                  predictedFieldId = ("000000" + predictedField).slice(-6);

          createModel(datasetId, project, predictedFieldId).then(function(d){
            resolve(d);
          });
      });

    });
//}
});
}

function createEvaluation(modelId, datasetId) {

    var d = {model:modelId, dataset: datasetId}
    d = JSON.stringify(d);

    var promise = $.ajax({
          url : "https://bigml.io/dev/evaluation?" + BIGML_AUTH,
          type: "POST",
          data: d,
          contentType: 'application/json',
          async: true,
          success: function(data, textStatus, jqXHR)
          {
          },
          error: function (jqXHR, textStatus, errorThrown)
          {
          }
      }).then(function(data){
        return data;
      });

      promise.done(function(data) {
      });
      return promise;
}

function getEvaluation(evaluationId) {
  var promise = $.ajax({
        url : "https://bigml.io/dev/"+evaluationId+ "?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}

function createCorrelation(datasetId) {
    //check model ready first

    var d = {dataset: datasetId}
    d = JSON.stringify(d);

    var promise = $.ajax({
          url : "https://bigml.io/dev/correlation?" + BIGML_AUTH,
          type: "POST",
          data: d,
          contentType: 'application/json',
          async: true,
          success: function(data, textStatus, jqXHR)
          {
          },
          error: function (jqXHR, textStatus, errorThrown)
          {
          }
      }).then(function(data){
        //data = data.objects;
        return data;
      });

      promise.done(function(data) {
      });
      return promise;
}


function getCorrelation(correlationId) {
  var promise = $.ajax({
        url : "https://bigml.io/dev/"+correlationId+ "?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}



function createAnomalyDetector(datasetId) {
    //check model ready first

    var d = {dataset: datasetId, top_n: 100}
    d = JSON.stringify(d);

    var promise = $.ajax({
          url : "https://bigml.io/dev/anomaly?" + BIGML_AUTH,
          type: "POST",
          data: d,
          contentType: 'application/json',
          async: true,
          success: function(data, textStatus, jqXHR)
          {
          },
          error: function (jqXHR, textStatus, errorThrown)
          {
          }
      }).then(function(data){
        //data = data.objects;
        return data;
      });

      promise.done(function(data) {
      });
      return promise;
}

function getAnomalyDetector(anomalyId) {
  var promise = $.ajax({
        url : "https://bigml.io/dev/"+anomalyId+ "?" + BIGML_AUTH,
        type: "GET",
        contentType: 'application/json',
        async: true,
        success: function(data)
        {
          data = data;
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
        }
    }).then(function(data){
      return data;
    });

    promise.done(function(data) {
    });
    return promise;
}