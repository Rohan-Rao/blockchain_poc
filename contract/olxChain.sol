pragma solidity ^0.5.0;
import "./ERC20Interface.sol";
contract olxChain is ERC20Interface{
    
   // mapping(address => userStruct) private users;
    
    struct itemStruct{
        string itemName;
        uint itemPrice;
        string manufacturerName;
        string listedBy;
        bool isListed;
    }
    
    struct requestToken{
        string requestFrom;
        uint requestAmmount;
        bool isServed;
    }
    mapping(uint => requestToken) private requestList; 
    requestToken _tempRequest;
    uint256 requestTokenCounter;
    mapping(address => itemStruct[]) private itemsByUser;
    itemStruct _tempItem;
    itemStruct[] marketplace;
    uint256 flag;
    mapping(address => itemStruct[]) private purchaseList;
    mapping(address => itemStruct[]) private soldList;
    
    uint256 constant private MAX_UINT256 = 2**256 - 1;
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    
    
    string private name;
    uint private decimal;
    string private symbol;
    
    constructor() public{
        name = "OLX Token";
        decimal = 1;
        symbol = "OLXToken";
        flag = 0;
        balances[msg.sender] = 10000;                    // Give the creator all initial tokens
        totalSupply = 10000;                             // Update total supply
        requestTokenCounter = 0;
    }
    
    
    function addItem(address _userAddress, 
        string memory _itemName,
        uint _itemPrice,
        string memory _manufacturerName,
            string memory _listedBy) public {
            itemStruct[] storage _items = itemsByUser[_userAddress];
             _tempItem.itemName = _itemName;
             _tempItem.itemPrice = _itemPrice;
             _tempItem.manufacturerName = _manufacturerName;
             _tempItem.listedBy = _listedBy;
             _tempItem.isListed = false;
             _items.push(_tempItem);
        }
        
    function getItem(address _userAddress, uint _index) public view returns(string memory,
                                                      uint,
                                                      string memory,
                                                      string memory,
                                                      bool
                                                      ){
            itemStruct memory _item = itemsByUser[_userAddress][_index];
            return(
                    _item.itemName,
                    _item.itemPrice,
                    _item.manufacturerName,
                    _item.listedBy,
                    _item.isListed
                );
        }
    
    function listInMarket(address _queryAddress,
        uint _index 
    )public {
        itemStruct memory itemToBeListed = itemsByUser[_queryAddress][_index];
        if(flag > 0){
            marketplace[(marketplace.length - flag)] = itemToBeListed;
            flag = flag - 1;
        }else{
            marketplace.push(itemToBeListed);
        }
         itemStruct storage setTrue = itemsByUser[_queryAddress][_index];
         setTrue.isListed = true;
        //counter = counter + 1;
    }
    
    function displayFromMarket(uint _index) public view returns(string memory,
                                                      uint,
                                                      string memory,
                                                      string memory
                                                      ){
        itemStruct memory marketPlaceItem = marketplace[_index];
        return (marketPlaceItem.itemName,
                marketPlaceItem.itemPrice,
                marketPlaceItem.manufacturerName,
                marketPlaceItem.listedBy
                );
    }
    function purchaseItem(
                         uint marketPlaceIndex,
                         address _buyerId,
                         address _sellerId,
                         uint _value
                         )public {
                          
             transfer(_buyerId, _sellerId, _value, 0, false);
             itemStruct[] storage _purchaseditems = purchaseList[_buyerId];
            // _tempItem.itemName = _itemName;
            // _tempItem.itemPrice = _itemPrice;
            // _tempItem.manufacturerName = _manufacturerName;
            // _tempItem.listedBy = _listedBy;
            // _purchaseditems.push(_tempItem);
            
            itemStruct[] storage _soldItem = soldList[_sellerId];
            // _tempItem.itemName = _itemName;
            // _tempItem.itemPrice = _itemPrice;
            // _tempItem.manufacturerName = _manufacturerName;
            // _tempItem.listedBy = _listedBy;
            // _soldItem.push(_tempItem);
            
            _purchaseditems.push(marketplace[marketPlaceIndex]);
            _soldItem.push(marketplace[marketPlaceIndex]);
            marketplace[marketPlaceIndex] = marketplace[(marketplace.length-1)];
            flag = flag + 1;
    } 
    
    function getPurchaseList(address _query, uint _purchaseId) public view returns(string memory,
                                                                    uint,
                                                                    string memory,
                                                                    string memory
    ){
                itemStruct memory _purchasedItem = purchaseList[_query][_purchaseId];
                return(
                        _purchasedItem.itemName,
                        _purchasedItem.itemPrice,
                        _purchasedItem.manufacturerName,
                        _purchasedItem.listedBy
                    );    
    }
    
        function getSoldList(address _query, uint _soldId) public view returns(string memory,
                                                                    uint,
                                                                    string memory,
                                                                    string memory
    ){
                itemStruct memory _soldItem = soldList[_query][_soldId];
                return(
                        _soldItem.itemName,
                        _soldItem.itemPrice,
                        _soldItem.manufacturerName,
                        _soldItem.listedBy
                    );    
    }
    

    function requestTokenAdmin(string memory _requestFrom,
                               uint _requestAmmount,
                               bool _isServed
                                ) public{
                                    
                requestToken storage _requestStruct   = requestList[requestTokenCounter];
                _requestStruct.requestFrom = _requestFrom;
                _requestStruct.requestAmmount = _requestAmmount;
                _requestStruct.isServed = _isServed;
                
                requestTokenCounter = requestTokenCounter + 1;
    }
    
    function getMarketPlaceCount() public view returns(uint){
        return (marketplace.length - flag);
    } 
    
    function getItemcount(address _queryAddress) public view returns(uint){
        return(itemsByUser[_queryAddress].length);
    }
    
    function getPurchaseCount(address _queryAddress) public view returns(uint){
        return(purchaseList[_queryAddress].length);
    } 
    
    function getSoldCount(address _queryAddress) public view returns(uint){
        return(soldList[_queryAddress].length);
    }
    function getRequestsCount() public view returns(uint){
        return(requestTokenCounter);
    }
    
    function getRequestList(uint _index) public view returns(uint, string memory, uint, bool){
        requestToken memory temp = requestList[_index];
        return(_index,
               temp.requestFrom,
               temp.requestAmmount,
               temp.isServed);
    }
    
       function transfer(address _from, address _to, uint256 _value, uint _requestIndex, bool _isAdmin) public returns (bool success) {  
        require(balances[_from] >= _value, 'Insufficient funds');
        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value); 
        if(_isAdmin == true){
            requestToken storage _temp = requestList[_requestIndex];
            _temp.isServed = true;
        }
        return true;
    }


    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }
    
    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
    

   
}
