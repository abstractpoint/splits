// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
}

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint256 value) external returns (bool);
}

/**
 * @title SplitMain
 * @author WAC
 */
contract SplitMain {
    uint256 public constant PERCENTAGE_SCALE = 10e5;
    address internal wethAddress;
    mapping(address => uint) public balances;
    mapping(address => bytes32) public splitHashes;

    // The CreateSplit event is emitted after each successful split creation.
    event CreateSplit(
                      address indexed splitAddress,
                      bytes32 indexed splitHash,
                      address[] accounts,
                      uint32[] percentAllocations
                      );

    // The DistributeSplit event is emitted after each successful split distribution.
    event DistributeSplit(
                          address indexed splitAddress,
                          uint256 amount
                          );

    // The TransferETH event is emitted after each eth transfer to an account is attempted.
    event TransferETH(
                      // The account to which the transfer was attempted.
                      address indexed account,
                      // The amount for transfer that was attempted.
                      uint256 amount,
                      // Whether or not the transfer succeeded.
                      bool success
                      );

    constructor(address wethAddress_) {
        wethAddress = wethAddress_;
    }

    // TODO: use uint256 for percentAllocations?
    function createSplit(
                         address[] calldata accounts,
                         uint32[] calldata percentAllocations
                         ) external {
        require(accounts.length == percentAllocations.length, "Mismatched accounts & allocations array lengths");
        // TODO: do we need to check that e.g. percentAllocations adds up to 100? yes, could be used to extract funds
        // TODO: do we need to check that e.g. percentAllocations are all non-negative? no, overflow in check that sums up to 100 should be triggered if negative allocations used
        // TODO: should we cap split size?
        bytes32 splitHash = hashSplit(accounts, percentAllocations);
        address splitAddress = address(uint160(bytes20(splitHash)));
        splitHashes[splitAddress] = splitHash;
        emit CreateSplit(splitAddress, splitHash, accounts, percentAllocations);
    }

    function receiveSplitFunds(
                                address split
                                ) external payable {
        balances[split] += msg.value;
    }

    function distributeSplitBalance(
                        address split,
                        address[] calldata accounts,
                        uint32[] calldata percentAllocations
                        ) external {
        require(splitHashes[split] != 0, "Invalid split");
        // TODO: is this, or any other checks, necessary (for extra hash collision resistance)?
        require(accounts.length == percentAllocations.length, "Mismatched accounts & allocations array lengths");
        require(verifyHash(accounts, percentAllocations, splitHashes[split]), "Invalid split");
        uint toDistribute = balances[split];
        balances[split] = 0;
        // TODO: pay distributor
        for(uint i=0; i < accounts.length; i++) {
            // TODO: amountFromPercent or scaleAmountByPercentage?
            balances[accounts[i]] += scaleAmountByPercentage(toDistribute, percentAllocations[i]);
        }
        emit DistributeSplit(split, toDistribute);
    }

    function claimBalance(address account) external {
        // ensure address isn't split
        require(splitHashes[account] == 0, "Splits cannot be claimed");
        uint claimableFunds = balances[account];
        balances[account] = 0;
        transferETHOrWETH(account, claimableFunds);
        // TODO: add mutable distribution fee, if msg.sender != account
    }

    function scaleAmountByPercentage(uint256 amount, uint256 scaledPercent)
        public
        pure
        returns (uint256 scaledAmount)
    {
        /*
          Example:
          If there is 100 ETH in the account, and someone has 
          an allocation of 2%, we call this with 100 as the amount, and 2*10e3
          as the scaled percent.

          To find out the amount we use, for example: (100 * 2*10e3) / (10e5)
          which returns 2 -- i.e. 2% of the 100 ETH balance.
        */
        scaledAmount = (amount * scaledPercent) / (PERCENTAGE_SCALE);
    }

    //======== Private Functions ========

    function amountFromPercent(uint256 amount, uint32 percent)
        private
        pure
        returns (uint256)
    {
        // Solidity 0.8.0 lets us do this without SafeMath.
        return (amount * percent) / 100;
    }

    // Will attempt to transfer ETH, but will transfer WETH instead if it fails.
    function transferETHOrWETH(address to, uint256 value)
        private
        returns (bool didSucceed)
    {
        // Try to transfer ETH to the given recipient.
        didSucceed = attemptETHTransfer(to, value);
        if (!didSucceed) {
            // If the transfer fails, wrap and send as WETH, so that
            // the auction is not impeded and the recipient still
            // can claim ETH via the WETH contract (similar to escrow).
            IWETH(wethAddress).deposit{value: value}();
            IWETH(wethAddress).transfer(to, value);
            // At this point, the recipient can unwrap WETH.
        }

        emit TransferETH(to, value, didSucceed);
    }

    function attemptETHTransfer(address to, uint256 value)
        private
        returns (bool)
    {
        // Here increase the gas limit a reasonable amount above the default, and try
        // to send ETH to the recipient.
        // NOTE: This might allow the recipient to attempt a limited reentrancy attack.
        (bool success, ) = to.call{value: value, gas: 30000}("");
        return success;
    }

    function verifyHash(
                        address[] calldata accounts,
                        uint32[] calldata percentAllocations,
                        bytes32 hash
                        ) private pure returns (bool) {
        bytes32 computedHash = hashSplit(accounts, percentAllocations);
        return computedHash == hash;
    }

    function hashSplit(
                       address[] calldata accounts,
                       uint32[] calldata percentAllocations
                       ) private pure returns (bytes32 computedHash) {
        // TODO: does encodePacked move the data to memory? can this be avoided when hashing?
        // TODO: abi.encode vs abi.encodePacked? is there any collision worries w the latter?
        bytes32 accountsHash = keccak256(abi.encodePacked(accounts));
        bytes32 percentAllocationsHash = keccak256(abi.encodePacked(percentAllocations));
        computedHash = keccak256(abi.encodePacked(accountsHash, percentAllocationsHash));
    }
}
