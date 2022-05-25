//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum, string memory name,string memory description,string memory image,uint target, string memory creatorName) public {
        address newCampaign = address(new Campaign(minimum, msg.sender, creatorName, name, description, image, target));
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}


contract Campaign {
    // Events

    event Contribute(address to, uint amount);
    event RequestCreated(uint amount, string description);
    event FinalizedRequest(string message);

    string public CampaignName;
    string public CampaignDescription;
    string public imageUrl;
    mapping (address=>uint) public contributors;
    uint public minimumContribution;
    address public manager;
    string public managerName;
    uint public target;
    uint public raisedAmount;
    uint public contributorsCount;

    struct Request {
        string description;
        address payable recipient;
        uint value;
        bool completed;
        uint votersCount;
        mapping(address=>bool) voters;
    }
    mapping(uint=>Request) public requests;
    uint public requestsCount;

    // Modifiers
    modifier onlyManager() {
        require(msg.sender == manager,"Only manager can call this function");
        _;
    }

    constructor (uint _minimum ,address _creator, string memory _creatorName,string memory name,string memory description,string memory image,uint _target) {
      manager = _creator;
      managerName = _creatorName;
      CampaignName = name;
      CampaignDescription = description;
      imageUrl = image;

      target = _target;
      minimumContribution = _minimum;
    }
    function contribute() public payable {
        require(msg.value >= minimumContribution, "Minimum Contribution is not met");

        if(contributors[msg.sender] == 0) {
            contributorsCount++;
        }
        contributors[msg.sender] += msg.value;
        raisedAmount += msg.value;

        emit Contribute(address(this), msg.value);
    }
    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }
    function refund() public {
        require(contributors[msg.sender] > 0);

        address payable user = payable(msg.sender);
        user.transfer(contributors[msg.sender]);

        contributors[msg.sender] = 0;
    }
    function createRequest(string memory _description, address payable _recipient, uint _value) public onlyManager {
        Request storage newRequest = requests[requestsCount];
        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;
        newRequest.votersCount = 0;
        requestsCount++;

        emit RequestCreated(_value, _description);
    }

    function voteRequest(uint _index) public {
        require(contributors[msg.sender] > 0, "You must be a contributor");
        Request storage thisRequest = requests[_index];
        require(thisRequest.voters[msg.sender] == false ,"You have already voted");
        thisRequest.voters[msg.sender] = true;
        thisRequest.votersCount++;
    } 
    function finalizeRequest(uint _index) public onlyManager {
        Request storage thisRequest = requests[_index];
        require(!thisRequest.completed,"The request has been completed");
        require(thisRequest.votersCount > contributorsCount/2,"Majority doesn't support");
        thisRequest.recipient.transfer(thisRequest.value);
        thisRequest.completed = true;

        emit FinalizedRequest('Request finalized Successfully');
    }

    function getSummary() public view returns (uint,uint,uint,uint,address,string memory,string memory,string memory, uint, string memory) {
        return(
            minimumContribution,
            address(this).balance,
            requestsCount,
            contributorsCount,
            manager,
            CampaignName,
            CampaignDescription,
            imageUrl,
            target,
            managerName
          );
    }
    
}