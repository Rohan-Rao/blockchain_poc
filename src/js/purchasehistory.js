/*
    global variable declaratio begins
*/

purchaseListCount=0;

soldList = [];
purchaseList = [];
/*
    global variable declaration ends
*/
function getSoldListCount(){
    console.log('Geeting sold list count');
    var promise =  new Promise((resolve, reject) =>{

    mContract.getSoldCount(logedInuserKey,
                            function(error, data){
                                if(!error){
                                    resolve(data.c[0]);
                                }else{
                                    reject(error);
                                }
                            })
                        });
     return promise;                   
}


function getPurchasedListCount(){
    console.log('Geeting purchase list count');
    var promise =  new Promise((resolve, reject) =>{

    mContract.getPurchaseCount(logedInuserKey,
                            function(error, data){
                                if(!error){
                                    resolve(data.c[0]);
                                }else{
                                    reject(error);
                                }
                            })
                        });
     return promise;                   
}


function displayItems(count, totalItems, listDivId){
    if(count == totalItems){
       return;
    }else{
        if(listDivId == 'displaySoldList'){
        mContract.getSoldList(logedInuserKey,count, function(error, data){
            if(!error){
                console.log(data);
                newItem = "<div class='col-md-3 innerDiv'>";
                newItem+="<div><strong>"+data[0]+"</strong></div>";
                newItem+="<div><strong>Price: "+data[1].c[0]+" Tokens</strong></div>";
                newItem+="<div><strong>Manufactured By: "+data[2]+"</strong></div>";
                newItem+="<div><strong>Listed By: "+data[3]+"</strong></div>";   
                newItem+="</div>";     
                $('#'+listDivId).append(newItem);
                displayItems(count+1, totalItems, listDivId);
            }else{
                console.log('Error while getting list');
            }   
        });
    }else{
        mContract.getPurchaseList(logedInuserKey,count, function(error, data){
            if(!error){
                console.log(data);
                newItem = "<div class='col-md-3 innerDiv'>";
                newItem+="<div><strong>"+data[0]+"</strong></div>";
                newItem+="<div><strong>Price: "+data[1].c[0]+" Tokens</strong></div>";
                newItem+="<div><strong>Manufactured By: "+data[2]+"</strong></div>";
                newItem+="<div><strong>Listed By: "+data[3]+"</strong></div>";   
                newItem+="</div>";     
                $('#'+listDivId).append(newItem);
                displayItems(count+1, totalItems, listDivId);
            }else{
                console.log('Error while getting list');
            }   
        });
    }
    }
}
