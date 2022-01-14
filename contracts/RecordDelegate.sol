// SPDX-License-Identifier: MIT

pragma experimental ABIEncoderV2;
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

contract RecordDelegate is
    Initializable,
    AccessControl
{
    /** Struct */
    struct SetMinCrossChainAmountParam {
        bytes symbol;
        uint  chainID;
        uint  amount;
    }

    struct SetCrossChainAgentFeeParam {
        uint  srcChainID;
        uint  destChainID;
        uint  tokenPairID;
        uint  value;
        bool  isPercent;
    }

    struct CrossChainAgentFee {
        uint  numerator;
        uint  denominator;
    }

    /** State Variables */
    // symbol => chainID => amount
    mapping(bytes => mapping(uint => uint)) public minCrossChainAmounts;

    // srcChainID => destChainID => tokenPairID => CrossChainAgentFee
    mapping(uint => mapping(uint => mapping(uint => CrossChainAgentFee))) internal mapCrossChainAgentFees;

    /** Constant Variables */
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");
    uint256 public constant DENOMINATOR = 1 ether;

    /** Events */
    event SetMinCrossChainAmount(uint256 indexed chainID, uint256 amount, bytes symbol);
    event SetCrossChainAgentFee(uint256 indexed srcChainID, uint256 indexed destChainID, uint256 indexed tokenPairID, uint256 numerator, uint256 denominator, bool isPercent);

    /** Modifier */
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "no access");
        _;
    }

    function initialize(address _admin, address _operator)
        external
        initializer
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(OPERATOR_ROLE, _operator);
    }

    function setMinCrossChainAmounts(SetMinCrossChainAmountParam [] calldata params)
        external
        onlyOperator
    {
        for (uint i = 0; i < params.length; ++i) {
            minCrossChainAmounts[params[i].symbol][params[i].chainID] = params[i].amount;
            emit SetMinCrossChainAmount(params[i].chainID, params[i].amount, params[i].symbol);
        }
    }

    function setMinCrossChainAmount(SetMinCrossChainAmountParam calldata param)
        external
        onlyOperator
    {
        minCrossChainAmounts[param.symbol][param.chainID] = param.amount;
        emit SetMinCrossChainAmount(param.chainID, param.amount, param.symbol);
    }

    function getMinCrossChainAmount(bytes calldata symbol, uint256 chainID)
        external
        view
        returns (uint256 amount)
    {
        return minCrossChainAmounts[symbol][chainID];
    }

    function setCrossChainAgentFees(SetCrossChainAgentFeeParam [] calldata params)
        external
        onlyOperator
    {
        uint256 denominator;
        for (uint i = 0; i < params.length; ++i) {
            if (params[i].isPercent) {
                denominator = DENOMINATOR;
                require(params[i].value < DENOMINATOR, "too large value");
            }
            mapCrossChainAgentFees[params[i].srcChainID][params[i].destChainID][params[i].tokenPairID] = CrossChainAgentFee({
                numerator: params[i].value,
                denominator: denominator
            });
            emit SetCrossChainAgentFee(params[i].srcChainID, params[i].destChainID, params[i].tokenPairID, params[i].value, denominator, params[i].isPercent);
        }
    }

    function setCrossChainAgentFee(SetCrossChainAgentFeeParam calldata param)
        external
        onlyOperator
    {
        uint256 denominator;
        if (param.isPercent) {
            denominator = DENOMINATOR;
            require(param.value < DENOMINATOR, "too large value");
        }
        mapCrossChainAgentFees[param.srcChainID][param.destChainID][param.tokenPairID] = CrossChainAgentFee({
            numerator: param.value,
            denominator: denominator
        });
        emit SetCrossChainAgentFee(param.srcChainID, param.destChainID, param.tokenPairID, param.value, denominator, param.isPercent);
    }

    function getCrossChainAgentFee(uint256 srcChainID, uint256 destChainID, uint256 tokenPairID)
        external
        view
        returns (uint256 numerator, uint256 denominator)
    {
        CrossChainAgentFee storage feeInfo = mapCrossChainAgentFees[srcChainID][destChainID][tokenPairID];
        numerator = feeInfo.numerator;
        denominator = feeInfo.denominator;
    }
}
