console.log('-----Admin.js------');
/*
    global variables declaration section begins
*/ 
let approvedList = [];
let pendingList = []
let adminBalance;

let requestId;
let requestFrom;
let requestAmmount;
let isServed;


/*
    global variables declaration section ends
*/ 

function requestObject(requestId, 
                       requestFrom, 
                       requestAmmount, 
                       isServed){
            this.requestId = requestId;
            this.requestFrom = requestFrom;
            this.requestAmmount = requestAmmount;
            this.isServed = isServed;    
}


function getAdminBalance(){
    console.log('Getting balance from admin');
    var promise = new Promise((resolve, reject) => {
        mContract.balanceOf(logedInuserKey, function(error, data){
            if(!error){
                adminBalance = data.c[0];
                $('#displayToken').text("Tokens: "+adminBalance+" tokens");
                resolve();
            }else{
                console.log('Sorry cannot get admin balance');
                reject();
            }   
        });
    });
    return promise;
}

function approveRequest(reqObj){
    console.log('Approving request');
    if(reqObj.requestAmmount <= adminBalance){
        getUserKey(reqObj.requestFrom).then( (res) =>{
            return res.json();
        }).then( (data) => {
            var depositTo = atob(data.data); 
        mContract.transfer(logedInuserKey,
                        depositTo,
                        reqObj.requestAmmount,
                        reqObj.requestId,
                        true, 
                        function(error, data){
                            if(!error){
                                alert('Request approved. '+reqObj.requestAmmount+' transfered to '+reqObj.requestFrom);
                            }else{
                                  console.log('Request cannot be approved');  
                            }
                        });
                    })
    }else{
        alert('Sorry insufficient balance');
    }
}

function getRequestList(_index,
                        totalRequests){
    console.log('Getting each request');
    var promise2 = new Promise((resolve, reject) => {
    if(_index == totalRequests){
       resolve();
    }else{
    mContract.getRequestList(
                            _index,
                            function(error, data){
                                if(!error){
                                    console.log(data);
                                    let reqObj = new requestObject(data[0].c[0],
                                        data[1],
                                        data[2].c[0],
                                        data[3]);
                                        if(reqObj.isServed){
                                            approvedList.push(reqObj);
                                        }else{
                                            pendingList.push(reqObj);
                                        }
                                        //console.log(approvedList,pendingList);
                                   // $('#dynamicRequests').append(displayTokens(reqObj));   
                                  getRequestList(_index+1, totalRequests).then(() =>{
                                      resolve();
                                  });
                                
                                }else{
                                    console.log('Error in getting request id '+_index);    
                                    reject();
                                }
                            }
                            )
         }
        });
        return promise2;
}

function getRequestCount(){
    console.log('Getting total request count');
    var  promise = new Promise((resolve, reject) => {
        mContract.getRequestsCount(function(error, data){
            if(!error){
                console.log(data);
                getRequestList(0,data).then(() =>{
                    console.log(adminBalance);
                    resolve();
                }).catch(() => {
                    reject();
                });
                
            }else{
                console.log('error in getting request count');
                reject();
            }
        });
    })
     return promise;
}

function displayTokens(reqObj){
    newItem = "<div class='col-md-2 innerDiv'>";
    newItem+="<div><strong>From: "+reqObj.requestFrom+"</strong></div>";
    newItem+="<div><strong>Ammount: "+reqObj.requestAmmount+" Tokens</strong></div>";
    if(!reqObj.isServed){    
        newItem+="<hr/>";
        newItem+="<button id="+(reqObj.requestId)+" class='btn btn-info' onclick=approveRequest("+JSON.stringify(reqObj)+")>Approve Request</button>";
    }
    newItem+="</div>";
    return newItem;
}

function loadPendingRequests(){
    console.log('-------------->');
    for(var i=0;i<pendingList.length;i++){
        console.log(pendingList[i]);
        $('#dynamicRequests').append(displayTokens(pendingList[i]));
    }
}

function loadApprovedRequests(){
    for(var i=0;i<approvedList.length;i++){
        console.log(approvedList[i]);
        $('#dynamicRequests').append(displayTokens(approvedList[i]));
    }
}