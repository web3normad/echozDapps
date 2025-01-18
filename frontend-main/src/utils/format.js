export const formatBalance = (balance) => {
    if (!balance) return "0.00";
    
    // Convert balance from wei to ETH (assuming 18 decimals)
    const balanceInWei = BigInt(balance);
    const ethValue = Number(balanceInWei) / Math.pow(10, 18);
    
    // Format to 4 decimal places
    return ethValue.toFixed(4);
  };
  
  export const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };