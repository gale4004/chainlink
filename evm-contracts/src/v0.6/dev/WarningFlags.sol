pragma solidity 0.6.6;


import "../Owned.sol";


contract WarningFlags is Owned {

  mapping(address => bool) private flags;

  event WarningFlagOn(
    address indexed subject
  );
  event WarningFlagOff(
    address indexed subject
  );

  /**
   * @notice read the warning flag status of a contract address.
   * @param subject The contract address being checked for a warning.
   */
  function getWarningFlag(address subject)
    public
    view
    returns (bool)
  {
    return flags[subject];
  }

  /**
   * @notice allows owner to enable the warning flag for an address.
   * @param subject The contract address being checked for a warning.
   */
  function setWarningFlagOn(address subject)
    public
    onlyOwner()
    returns (bool)
  {
    if (!flags[subject]) {
      flags[subject] = true;
      emit WarningFlagOn(subject);
    }
  }

  /**
   * @notice allows owner to disable the warning flag for an address.
   * @param subject The contract address being checked for a warning.
   */
  function setWarningFlagOff(address subject)
    public
    onlyOwner()
    returns (bool)
  {
    if (flags[subject]) {
      flags[subject] = false;
      emit WarningFlagOff(subject);
    }
  }

}
