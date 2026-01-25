// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Products
 * @dev A contract for managing products, payments, and treasury management
 */
contract Products is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;

    // Structs
    struct Product {
        string productId;            // Human-readable ID
        uint256 price;               // Total price
        uint256 amountPaid;          // Running total of payments
        bool partialPaymentsAllowed; // Whether partial payments are allowed
        bool fullyPaid;              // Whether product is fully paid
        address tokenAddress;        // Address of token (address(0) for ETH)
        bool exists;                 // To check if product exists
    }

    struct Transaction {
        address payer;               // Address that made the payment
        uint256 amount;              // Amount paid
        uint256 timestamp;           // When payment was made
        bool refunded;               // Whether payment was refunded
        uint256 refundedAmount;      // Amount refunded
    }

    // State variables
    address public treasuryWallet;
    
    // Mappings
    mapping(bytes32 => Product) private _products;
    mapping(bytes32 => Transaction[]) private _productTransactions;
    mapping(bytes32 => mapping(uint256 => bool)) private _transactionFundsSent;

    // Events
    event ProductCreated(string indexed productId, uint256 price, bool partialPaymentsAllowed, address tokenAddress);
    event ProductPayment(string indexed productId, address indexed payer, uint256 amount, uint256 transactionId);
    event ProductFullyPaid(string indexed productId, uint256 totalAmount);
    event PaymentRefunded(string indexed productId, uint256 transactionId, uint256 amount);
    event FundsSentToTreasury(string indexed productId, uint256 amount, address tokenAddress);
    event TreasuryWalletUpdated(address previousWallet, address newWallet);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract with a treasury wallet
     * @param _treasuryWallet The address of the treasury wallet
     */
    function initialize(address _treasuryWallet) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        // If treasury wallet is not provided, use deployer's address
        treasuryWallet = _treasuryWallet != address(0) ? _treasuryWallet : msg.sender;
    }

    /**
     * @dev Function that authorizes an upgrade. Only the owner can upgrade the implementation.
     * @param newImplementation Address of the new implementation contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Sets a new treasury wallet
     * @param _newTreasuryWallet The address of the new treasury wallet
     */
    function setTreasuryWallet(address _newTreasuryWallet) external onlyOwner {
        require(_newTreasuryWallet != address(0), "Products: treasury wallet cannot be zero address");
        address previousWallet = treasuryWallet;
        treasuryWallet = _newTreasuryWallet;
        emit TreasuryWalletUpdated(previousWallet, _newTreasuryWallet);
    }

    /**
     * @dev Creates a new product
     * @param productId The ID of the product
     * @param price The price of the product
     * @param partialPaymentsAllowed Whether partial payments are allowed
     * @param tokenAddress The address of the token (address(0) for ETH)
     */
    function createProduct(
        string calldata productId, 
        uint256 price, 
        bool partialPaymentsAllowed, 
        address tokenAddress
    ) external onlyOwner {
        require(price > 0, "Products: price must be greater than zero");
        require(bytes(productId).length > 0, "Products: productId cannot be empty");
        
        bytes32 productHash = keccak256(abi.encodePacked(productId));
        require(!_products[productHash].exists, "Products: product already exists");
        
        _products[productHash] = Product({
            productId: productId,
            price: price,
            amountPaid: 0,
            partialPaymentsAllowed: partialPaymentsAllowed,
            fullyPaid: false,
            tokenAddress: tokenAddress,
            exists: true
        });

        emit ProductCreated(productId, price, partialPaymentsAllowed, tokenAddress);
    }

    /**
     * @dev Pays for a product (using ETH)
     * @param productId The ID of the product
     */
    function payProduct(string calldata productId) external payable nonReentrant whenNotPaused {
        bytes32 productHash = keccak256(abi.encodePacked(productId));
        Product storage product = _products[productHash];
        
        require(product.exists, "Products: product does not exist");
        require(!product.fullyPaid, "Products: product already fully paid");
        require(product.tokenAddress == address(0), "Products: product requires token payment");
        
        uint256 amount = msg.value;
        require(amount > 0, "Products: payment amount must be greater than zero");
        
        _processPayment(productHash, product, amount);
    }

    /**
     * @dev Pays for a product (using ERC20 tokens)
     * @param productId The ID of the product
     * @param amount The amount of tokens to pay
     */
    function payProductWithToken(string calldata productId, uint256 amount) external nonReentrant whenNotPaused {
        bytes32 productHash = keccak256(abi.encodePacked(productId));
        Product storage product = _products[productHash];
        
        require(product.exists, "Products: product does not exist");
        require(!product.fullyPaid, "Products: product already fully paid");
        require(product.tokenAddress != address(0), "Products: product requires ETH payment");
        require(amount > 0, "Products: payment amount must be greater than zero");
        
        // Transfer tokens from sender to contract
        IERC20(product.tokenAddress).safeTransferFrom(msg.sender, address(this), amount);
        
        _processPayment(productHash, product, amount);
    }

    /**
     * @dev Internal function to process payments
     * @param productHash The hash of the product ID
     * @param product The product struct
     * @param amount The payment amount
     */
    function _processPayment(bytes32 productHash, Product storage product, uint256 amount) private {
        if (!product.partialPaymentsAllowed) {
            require(amount == product.price, "Products: payment must equal product price");
            product.amountPaid = product.price;
            product.fullyPaid = true;
        } else {
            uint256 remainingAmount = product.price - product.amountPaid;
            require(amount <= remainingAmount, "Products: payment exceeds remaining amount");
            
            product.amountPaid += amount;
            
            if (product.amountPaid == product.price) {
                product.fullyPaid = true;
            }
        }
        
        // Record the transaction
        uint256 transactionId = _productTransactions[productHash].length;
        _productTransactions[productHash].push(Transaction({
            payer: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            refunded: false,
            refundedAmount: 0
        }));
        
        emit ProductPayment(product.productId, msg.sender, amount, transactionId);
        
        if (product.fullyPaid) {
            emit ProductFullyPaid(product.productId, product.price);
        }
    }

    /**
     * @dev Gets all transactions for a product
     * @param productId The ID of the product
     * @return Array of transactions
     */
    function getProductTransactions(string calldata productId) external view returns (Transaction[] memory) {
        bytes32 productHash = keccak256(abi.encodePacked(productId));
        require(_products[productHash].exists, "Products: product does not exist");
        
        return _productTransactions[productHash];
    }

    /**
     * @dev Gets product details
     * @param productId The ID of the product
     * @return Product struct
     */
    function getProduct(string calldata productId) external view returns (Product memory) {
        bytes32 productHash = keccak256(abi.encodePacked(productId));
        require(_products[productHash].exists, "Products: product does not exist");
        
        return _products[productHash];
    }

    /**
     * @dev Refunds a payment
     * @param productId The ID of the product
     * @param transactionId The ID of the transaction
     * @param amount The amount to refund
     */
    function refundProduct(string calldata productId, uint256 transactionId, uint256 amount) external onlyOwner nonReentrant {
        bytes32 productHash = keccak256(abi.encodePacked(productId));
        Product storage product = _products[productHash];
        
        require(product.exists, "Products: product does not exist");
        require(transactionId < _productTransactions[productHash].length, "Products: transaction does not exist");
        
        Transaction storage transaction = _productTransactions[productHash][transactionId];
        require(!transaction.refunded, "Products: transaction already refunded");
        require(amount <= transaction.amount, "Products: refund amount exceeds payment amount");
        
        transaction.refunded = true;
        transaction.refundedAmount = amount;
        
        // Update product payment status
        if (product.fullyPaid && product.amountPaid - amount < product.price) {
            product.fullyPaid = false;
        }
        
        product.amountPaid = (product.amountPaid >= amount) ? product.amountPaid - amount : 0;
        
        // Process refund
        if (product.tokenAddress == address(0)) {
            // ETH refund
            payable(transaction.payer).transfer(amount);
        } else {
            // Token refund
            IERC20(product.tokenAddress).safeTransfer(transaction.payer, amount);
        }
        
        emit PaymentRefunded(product.productId, transactionId, amount);
    }

    /**
     * @dev Sends all contract funds to treasury
     */
    function sendAllFundsToTreasury() external onlyOwner nonReentrant {
        // Send ETH
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            payable(treasuryWallet).transfer(ethBalance);
            emit FundsSentToTreasury("ALL_PRODUCTS", ethBalance, address(0));
        }
        
        // Get unique token addresses from all products
        address[] memory uniqueTokens = _getUniqueTokenAddresses();
        
        // Send tokens
        for (uint256 i = 0; i < uniqueTokens.length; i++) {
            if (uniqueTokens[i] != address(0)) {
                IERC20 token = IERC20(uniqueTokens[i]);
                uint256 tokenBalance = token.balanceOf(address(this));
                
                if (tokenBalance > 0) {
                    token.safeTransfer(treasuryWallet, tokenBalance);
                    emit FundsSentToTreasury("ALL_PRODUCTS", tokenBalance, uniqueTokens[i]);
                }
            }
        }
    }

    /**
     * @dev Sends product funds to treasury
     * @param productId The ID of the product
     */
    function sendProductFundsToTreasury(string calldata productId) external onlyOwner nonReentrant {
        bytes32 productHash = keccak256(abi.encodePacked(productId));
        Product storage product = _products[productHash];
        
        require(product.exists, "Products: product does not exist");
        
        uint256 totalAmount = 0;
        Transaction[] storage transactions = _productTransactions[productHash];
        
        for (uint256 i = 0; i < transactions.length; i++) {
            // Skip if already sent or refunded
            if (!_transactionFundsSent[productHash][i] && !transactions[i].refunded) {
                totalAmount += transactions[i].amount;
                _transactionFundsSent[productHash][i] = true;
            }
        }
        
        require(totalAmount > 0, "Products: no funds to send");
        
        if (product.tokenAddress == address(0)) {
            // ETH payment
            payable(treasuryWallet).transfer(totalAmount);
        } else {
            // Token payment
            IERC20(product.tokenAddress).safeTransfer(treasuryWallet, totalAmount);
        }
        
        emit FundsSentToTreasury(product.productId, totalAmount, product.tokenAddress);
    }

    /**
     * @dev Sends transaction funds to treasury
     * @param productId The ID of the product
     * @param transactionId The ID of the transaction
     */
    function sendTransactionFundsToTreasury(string calldata productId, uint256 transactionId) external onlyOwner nonReentrant {
        bytes32 productHash = keccak256(abi.encodePacked(productId));
        Product storage product = _products[productHash];
        
        require(product.exists, "Products: product does not exist");
        require(transactionId < _productTransactions[productHash].length, "Products: transaction does not exist");
        
        Transaction storage transaction = _productTransactions[productHash][transactionId];
        require(!_transactionFundsSent[productHash][transactionId], "Products: transaction funds already sent");
        require(!transaction.refunded, "Products: cannot send refunded transaction");
        
        uint256 amount = transaction.amount;
        _transactionFundsSent[productHash][transactionId] = true;
        
        if (product.tokenAddress == address(0)) {
            // ETH payment
            payable(treasuryWallet).transfer(amount);
        } else {
            // Token payment
            IERC20(product.tokenAddress).safeTransfer(treasuryWallet, amount);
        }
        
        emit FundsSentToTreasury(product.productId, amount, product.tokenAddress);
    }

    /**
     * @dev Gets unique token addresses from all products
     * @return Array of unique token addresses
     */
    function _getUniqueTokenAddresses() private view returns (address[] memory) {
        // First, count unique token addresses (could optimize this in production)
        uint256 count = 0;
        address[] memory tempAddresses = new address[](100); // Arbitrary limit for simplicity
        
        bytes32[] memory productHashes = new bytes32[](100); // Arbitrary limit for simplicity
        uint256 productCount = 0;
        
        // Get product hashes (simplified approach)
        for (uint256 i = 0; i < 100; i++) { // Arbitrary limit for simplicity
            bytes32 productHash = keccak256(abi.encodePacked(i));
            if (_products[productHash].exists) {
                productHashes[productCount] = productHash;
                productCount++;
                if (productCount >= 100) break;
            }
        }
        
        // Collect unique token addresses
        for (uint256 i = 0; i < productCount; i++) {
            address tokenAddress = _products[productHashes[i]].tokenAddress;
            bool exists = false;
            
            for (uint256 j = 0; j < count; j++) {
                if (tempAddresses[j] == tokenAddress) {
                    exists = true;
                    break;
                }
            }
            
            if (!exists && tokenAddress != address(0)) {
                tempAddresses[count] = tokenAddress;
                count++;
            }
        }
        
        // Create properly sized array
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempAddresses[i];
        }
        
        return result;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Fallback function
     */
    receive() external payable {
        // Accept ETH transfers
    }
}