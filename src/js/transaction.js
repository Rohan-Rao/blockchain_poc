
let mContract = web3.eth.contract(config.cabi).at(config.caddress);

console.log("------------------The app started--------------------");

/*
    global variables declaration section begins
*/ 
    
        var name;
        var price;
        var manName;
        var listedBy;
        var isListed;
        var logedInuserKey = sessionStorage.publicKey;
        var logedInuserName = sessionStorage.username;

    var itemList = [];
    var marketList = [];
    
/*
    global variables declaration section ends
*/ 

function itemObject(name,
                    price,
                    manName,
                    listedBy,
                    isListed
    ){
        this.name = name;
        this.price = price;
        this.manName = manName;
        this.listedBy = listedBy;
        this.isListed = isListed;
}

function balanceOf(){
    if(typeof(Storage) != "undefined"){
        console.log(sessionStorage.publicKey);
        console.log('inside balance');
    }
    mContract.balanceOf(logedInuserKey, function(error, data){
        if(!error){
            console.log('inside data');
            console.log(JSON.stringify(data));
            $('#displayToken').text("Tokens: "+data+" tokens");
            return data;      
        }else{
            console.log('error while getting balance');
        }
    });
}

function getMarketPlaceCount(){
    console.log('Getting count from marketplace');
    mContract.getMarketPlaceCount(function(error, data){
        if(!error){
            var marketItemsCount = data.c[0];
           /* if(marketItemsCount == marketList.length){
                var displayAllMarketItems='';
                for(let i=0;i<marketItemsCount;i++){
                    displayAllMarketItems += displayMarketItems(displayAllMarketItems,
                                                               marketList[i],
                                                               i);
                }
                $('#dynamicMarketItems').append(displayAllMarketItems);
            }else{*/
                   displayFromMarket(0, marketItemsCount); 
            //}
        }else{
            console.log('error while getting count from marketplace');
        }
    });
}

function getItemCount(){
    console.log('Getting item count of user');
    mContract.getItemcount(logedInuserKey, function(error, data){
        if(!error){
            var userItemCount = data.c[0];
            console.log(userItemCount);
            if(userItemCount == itemList.length){
                for(let i=0;i<userItemCount;i++){
                    $('#dynamicItemContent').append(displayUserItems('',itemList[i], i)); 
                }        
            }else{
                getItem(logedInuserKey, 0, userItemCount);      
            }
        }else{
            console.log(error);
        }
    })
}

function getItem(_userAddress,
                _index,
                userItemCount
    ){
        console.log('getting user listed items');
        if(_index == userItemCount){
            return;
        }
            mContract.getItem(_userAddress,
                         _index, function(error, data){
                            if(!error){
                                console.log(data);
                                 itemList.push(new itemObject(
                                        data[0],
                                        data[1].c[0],
                                        data[2],
                                        data[3],
                                        data[4]
                                 ));   
                                 $('#dynamicItemContent').append(displayUserItems('',
                                                        itemList[itemList.length-1], 
                                                        itemList.length -1)); 
                                 getItem(_userAddress, _index+1, userItemCount);                       

                            }else{
                                 console.log(error);      
                            }       
                         })                
}

function displayFromMarket(_index, totalItems){
    if(_index == totalItems){
        return;
    }else{
    mContract.displayFromMarket(_index,function(error, data){
        if(!error){
            console.log('Displaying item from market');
            console.log(data);
            marketList.push(new itemObject(data[0],
                                          data[1].c[0],
                                          data[2],
                                          data[3],
                                          true));
            $('#dynamicMarketItems').append(displayMarketItems('', 
                                            marketList[marketList.length - 1], 
                                            _index));
            displayFromMarket(_index+1, totalItems);
        }else{
            console.log(error);
        }
    });
  }
}
function addItem(_userAddress, _itemName, _itemPrice, _manufacturerName, _listedBy){
    console.log('Adding item to blockchain');
    console.log(_userAddress);
    mContract.addItem(_userAddress,
            _itemName,
            _itemPrice,
            _manufacturerName,
            _listedBy,
            function(error, result){
                if(!error){
                    console.log('New item successfully added to blockchain'); 
                    itemList.push(new itemObject(_itemName,
                                                 _itemPrice,
                                                 _manufacturerName,
                                                 _listedBy,
                                                 false  
                        ));  
                    $('#dynamicItemContent').append(displayUserItems('',
                                                    itemList[itemList.length-1], 
                                                    itemList.length - 1));
                }else{
                       console.log(error);
                }
            });
}
$('#getBal').on("click",function(){
    balanceOf("0xce1921cca79dd39e5280dc1651bfe92dccdbadad");
})

function listInMarket(btnId){
    console.log('Adding item to market');
    mContract.listInMarket(logedInuserKey,
                            btnId,
                            function(error, data){
                                if(!error){
                                    console.log('Item successfully added to market');
                                   itemList[btnId].isListed = true;
                                    $('#dynamicEle'+btnId).html("<p>Listed in market !!</p>");
                                }else{
                                      console.log(error);  
                                }
                          })
}

let purchaseItemAsync =  function(marketPlaceIndex, _buyerId, _sellerId){
    console.log('Purchasng item from marketplace');
      //    console.log(itemToPurchase.price);
          console.log(_buyerId);
          var promise1 =  new Promise((resolve, reject) => 
          {
          mContract.balanceOf(_buyerId,function(error, data){
                console.log('Getting balance');
                if(!error){
                    var itemToPurchase  =  marketList[marketPlaceIndex];
                    console.log(itemToPurchase.price+" "+data.c[0]);
                    if(itemToPurchase.price <= data.c[0]){
                        resolve(itemToPurchase.price);
                    }else{
                        reject();
                    }   
                }else{
                    console.log(error);
                }
          });
    });
    return promise1;
};

let makeTransaction =  function(marketPlaceIndex, _buyerId, _sellerId, _value){

    var promise2 = new Promise((resolve, reject) =>{
        mContract.purchaseItem( marketPlaceIndex,
            _buyerId,
            _sellerId,
            _value,
            function(error, data){
                if(!error){
                    console.log('Item purchased successfully');
                    console.log(data);
                    resolve();
                }else{
                    console.log('in error');
                    reject();
                    console.log(error);
                }
            });
    })
    return promise2;
}

    function purchaseItem(marketPlaceIndex,_sellerName){
     var _buyerId = logedInuserKey;
     getUserKey(_sellerName).then( (res) =>{
        return res.json();
    }).then( (data) =>{
        var _sellerId = atob(data.data);
        console.log(_sellerId);
        purchaseItemAsync(marketPlaceIndex, _buyerId, _sellerId).then(data =>{
            console.log('done with async1 '+data);
            var transferAmmount = data;
            makeTransaction(marketPlaceIndex, _buyerId, _sellerId, transferAmmount).then(data =>{
                console.log('done with async2 '+data);     
                console.log(data);
                alert('Congrats!! You purchased a new item');
            }).catch(()=>{
                alert('Transaction cannot be completed');
            })
        }).catch(()=> {
        alert('Sorry!! You have insufficient tokens...please request some');
    });
});
}

function addItemForm(){
    addItem(logedInuserKey,
            $('#itemName').val(),
            $('#itemPrice').val(),
            $('#manName').val(),
            logedInuserName);
    $('#itemName').val('');
    $('#itemPrice').val(''); 
    $('#manName').val('');
}

function requestToken(){
    let tokenAmmount = $('#tokenAmmount').val();
    console.log(tokenAmmount);
    mContract.requestTokenAdmin(logedInuserName,
                                tokenAmmount,
                                false,
                                function(error, data){
                                    if(!error){
                                        alert('Request submitted successfully !!');
                                    }else{
                                        alert('error in generating request');
                                    }
                                });

}
function displayUserItems(newItem, item, btnId){
    newItem = "<div class='col-md-3 innerDiv'>";
    newItem+="<div><strong>"+item.name+"</strong></div>";
    newItem+="<div><strong>Price: "+item.price+" Tokens</strong></div>";
    newItem+="<div><strong>Manufactured By: "+item.manName+"</strong></div>";
    newItem+="<hr/>";
    //console.log(btnId);
    newItem+="<div id=dynamicEle"+btnId+">"
    if(item.isListed){
        newItem+="<p>Listed in market !!</p>";
    }else{
     newItem+="<button id="+(btnId)+" class='btn btn-info' onclick=listInMarket("+btnId+")>List in market</button>";
    }
    newItem+="</div>";
    newItem+="</div>";
    return newItem;
}

function displayMarketItems(newItem, marketItem, btnId){
    newItem = "<div class='col-md-3 innerDiv'>";
    newItem+="<div><strong>"+marketItem.name+"</strong></div>";
    newItem+="<div><strong>Price: "+marketItem.price+" Tokens</strong></div>";
    newItem+="<div><strong>Manufactured By: "+marketItem.manName+"</strong></div>";
    newItem+="<div><strong>Listed By: "+marketItem.listedBy+"</strong></div>";   
    newItem+="<hr/>";
    console.log(btnId);
    newItem+="<button id="+(btnId)+" class='btn btn-info' onclick=purchaseItem("+btnId+",\'"+marketItem.listedBy+"\')>Purchase Item</button>";
    newItem+="</div>";
    return newItem;
}
