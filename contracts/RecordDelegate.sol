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

    /** State Variables */
    // symbol => chainID => amount
    mapping(bytes => mapping(uint => uint)) public minCrossChainAmounts;

    /** Constant Variables */
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");

    /** Events */
    event SetMinCrossChainAmount(uint256 indexed chainID, uint256 amount, bytes symbol);

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

}
