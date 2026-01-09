import { ethers } from "ethers";
import { pool } from "./db.js";
import fs from "fs";
import path from "path";

const RPC_URL = "http://127.0.0.1:8545";
const CHAIN_ID = 31337;

// Function to get contract address dynamically
function getContractAddress() {
  try {
    // Try to read from contract-addresses.json
    const addressesPath = path.join(process.cwd(), '..', 'contract-addresses.json');
    if (fs.existsSync(addressesPath)) {
      const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
      console.log(`📝 Loaded contract address: ${addresses.Commerce}`);
      return addresses.Commerce;
    }
    
    // Fallback to default address (for first time setup)
    return "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  } catch (error) {
    console.error("❌ Error reading contract addresses:", error.message);
    return "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  }
}

const ABI = [
  "event OrderPlaced(uint256 orderId, address buyer, uint256 amount)",
  "event OrderRefunded(uint256 orderId)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
let contract = null;
let currentContractAddress = null;

/* ================================
   🧠 PRODUCT MAP (NUMBER BASED)
================================ */
function mapProduct(amountEth) {
  const amt = Number(amountEth);

  if (amt === 48) return "Eminem Music";
  if (amt === 115) return "Blockchain Course";
  if (amt === 58) return "Web3 Book";
  if (amt === 45) return "R.R. Martin Book";
  if (amt === 99) return "Quantum Computing";

  return "Unknown Product";
}

/* ================================
   GET OR CREATE CONTRACT CONNECTION
================================ */
function getContract() {
  const contractAddress = getContractAddress();
  
  if (!contractAddress) {
    console.error("❌ No contract address found!");
    return null;
  }
  
  // If contract address changed or contract not initialized
  if (!contract || contractAddress !== currentContractAddress) {
    console.log(`🔄 Updating contract connection to: ${contractAddress}`);
    currentContractAddress = contractAddress;
    contract = new ethers.Contract(contractAddress, ABI, provider);
  }
  
  return contract;
}

/* ================================
   SMART INDEXER FUNCTIONS
================================ */
async function getLastBlock() {
  try {
    const contractAddress = getContractAddress();
    if (!contractAddress) return 0;
    
    const result = await pool.query(
      `SELECT last_block FROM indexer_state WHERE chain_id = $1 AND contract_address = $2`,
      [CHAIN_ID, contractAddress]
    );

    if (result.rows.length === 0) {
      // Create entry if it doesn't exist
      await pool.query(
        `INSERT INTO indexer_state (chain_id, contract_address, last_block) VALUES ($1, $2, $3)`,
        [CHAIN_ID, contractAddress, 0]
      );
      console.log("📊 Created new indexer state entry");
      return 0;
    }

    return parseInt(result.rows[0].last_block);
  } catch (error) {
    console.error("❌ Error getting last block:", error.message);
    return 0;
  }
}

async function setLastBlock(blockNumber) {
  try {
    const contractAddress = getContractAddress();
    if (!contractAddress) return;
    
    await pool.query(
      `UPDATE indexer_state SET last_block = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE chain_id = $2 AND contract_address = $3`,
      [blockNumber, CHAIN_ID, contractAddress]
    );
    console.log(`✅ Updated last block to: ${blockNumber}`);
  } catch (error) {
    console.error("❌ Error updating last block:", error.message);
  }
}

/* ================================
   BLOCKCHAIN RESET DETECTION
================================ */
async function detectBlockchainReset() {
  try {
    const storedBlock = await getLastBlock();
    const currentBlock = await provider.getBlockNumber();
    
    console.log(`📊 Stored block: ${storedBlock}, Current block: ${currentBlock}`);
    
    // If stored block is significantly higher than current block, blockchain reset
    if (storedBlock > 0 && currentBlock < storedBlock - 50) {
      console.warn("⚠️ Blockchain reset detected! Resetting indexer...");
      
      // Clear all data for this contract
      const contractAddress = getContractAddress();
      await pool.query(
        `DELETE FROM orders WHERE contract_address = $1`,
        [contractAddress]
      );
      
      // Reset indexer state
      await setLastBlock(0);
      console.log("✅ Cleared old data for fresh blockchain");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ Error detecting blockchain reset:", error.message);
    return false;
  }
}

/* ================================
   MAIN SYNC FUNCTION
================================ */
async function sync() {
  try {
    console.log("\n🔄 Starting sync...");
    
    // Check for blockchain reset
    await detectBlockchainReset();
    
    // Get contract (with dynamic address)
    const currentContract = getContract();
    if (!currentContract) {
      console.log("⏸️ Waiting for contract deployment...");
      return;
    }
    
    const fromBlock = await getLastBlock();
    const toBlock = await provider.getBlockNumber();
    
    console.log(`📊 Syncing from block ${fromBlock} to ${toBlock}`);
    console.log(`📝 Contract: ${currentContractAddress}`);
    
    if (fromBlock >= toBlock) {
      console.log("⏸️ No new blocks to sync");
      return;
    }

    /* -------- ORDER PLACED EVENTS -------- */
    const placedEvents = await currentContract.queryFilter(
      "OrderPlaced",
      fromBlock,
      toBlock
    );

    console.log(`📝 Found ${placedEvents.length} new OrderPlaced events`);
    
    for (const event of placedEvents) {
      try {
        const { orderId, buyer, amount } = event.args;
        const block = await event.getBlock();
        
        const amountEth = ethers.formatEther(amount);
        const productName = mapProduct(amountEth);
        
        console.log(`🛒 Order ${orderId}: ${productName} for ${buyer.slice(0, 8)}...`);
        
        // Insert into database
        const insertResult = await pool.query(
          `INSERT INTO orders (
            chain_id, contract_address, order_id, buyer_address,
            amount, product_name, tx_hash, block_number, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9))
          ON CONFLICT (tx_hash) DO NOTHING`,
          [
            CHAIN_ID,
            currentContractAddress,
            orderId.toString(),
            buyer.toLowerCase(),
            amountEth,
            productName,
            event.transactionHash,
            event.blockNumber,
            block.timestamp
          ]
        );
        
        if (insertResult.rowCount > 0) {
          console.log(`✅ Inserted order ${orderId}`);
        } else {
          console.log(`⏭️ Order ${orderId} already exists`);
        }
        
      } catch (eventError) {
        console.error(`❌ Error processing event:`, eventError.message);
      }
    }

    /* -------- ORDER REFUNDED EVENTS -------- */
    const refundedEvents = await currentContract.queryFilter(
      "OrderRefunded",
      fromBlock,
      toBlock
    );

    console.log(`📝 Found ${refundedEvents.length} OrderRefunded events`);
    
    for (const event of refundedEvents) {
      try {
        const orderId = event.args.orderId.toString();
        
        const updateResult = await pool.query(
          `UPDATE orders SET refunded = true 
           WHERE contract_address = $1 AND order_id = $2`,
          [currentContractAddress, orderId]
        );
        
        if (updateResult.rowCount > 0) {
          console.log(`✅ Marked order ${orderId} as refunded`);
        } else {
          console.log(`⚠️ Order ${orderId} not found for refund update`);
        }
        
      } catch (eventError) {
        console.error(`❌ Error processing refund:`, eventError.message);
      }
    }

    // Update last processed block
    await setLastBlock(toBlock);
    
    console.log(`✅ Sync completed up to block ${toBlock}`);

  } catch (error) {
    console.error("❌ Sync error:", error.message);
  }
}

/* ================================
   START INDEXER
================================ */
async function startIndexer() {
  try {
    console.log("🚀 Starting MNEE Commerce Indexer...");
    console.log(`📡 RPC URL: ${RPC_URL}`);
    console.log(`🔄 Auto-detecting contract address...`);
    
    // Initial sync
    await sync();
    
    // Schedule regular syncs (every 2 seconds)
    setInterval(sync, 2000);
    
    console.log("✅ Indexer running. Syncing every 2 seconds...");
    
  } catch (error) {
    console.error("❌ Failed to start indexer:", error.message);
    process.exit(1);
  }
}

// Start the indexer
startIndexer();

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log("\n🛑 Shutting down indexer gracefully...");
  process.exit(0);
});