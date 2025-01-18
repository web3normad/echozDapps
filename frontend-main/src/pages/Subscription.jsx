
import { useState } from "react";
import { Check } from "lucide-react";
import { Contract } from "starknet";

// Contract address and ABI
const SUBSCRIPTION_CONTRACT_ADDRESS = "your_contract_address_here";

const SubscriptionABI = [
  {
    type: "function",
    name: "upgrade_subscription",
    inputs: [
      { name: "tier", type: "core::felt252" }
    ],
    outputs: [],
    state_mutability: "external",
  }
];

const SUBSCRIPTION_TIERS = {
  Free: 0,
  Basic: 1,
  Premium: 2,
  Ultimate: 3,
};

const Subscription = () => {
  const [activeSubscription, setActiveSubscription] = useState("Free");
  const [processingTier, setProcessingTier] = useState(null);

  const subscriptionTiers = [
    {
      name: "Free",
      price: "0 STRK",
      features: [
        "100 Listening Minutes/Month",
        "Limited Genre Access",
        "Standard Audio Quality",
        "No Offline Playback",
      ],
    },
    {
      name: "Basic",
      price: "50 STRK",
      features: [
        "500 Listening Minutes/Month",
        "Full Genre Access",
        "High Audio Quality",
        "Basic Offline Playback",
      ],
    },
    {
      name: "Premium",
      price: "100 STRK",
      features: [
        "1500 Listening Minutes/Month",
        "All Genre Access",
        "Lossless Audio Quality",
        "Unlimited Offline Playback",
        "Exclusive Releases",
      ],
    },
    {
      name: "Ultimate",
      price: "150 STRK",
      features: [
        "Unlimited Listening",
        "Priority Content Curation",
        "AI-Powered Recommendations",
        "Collaborative Playlists",
        "Artist Connect Sessions",
      ],
    },
  ];

  const handlePurchaseSubscription = async (tierName) => {
    try {
      setProcessingTier(tierName);

      if (!window['starknet']) {
        throw new Error("Please connect your Starknet wallet");
      }

      await window['starknet'].enable();
      const account = await window['starknet'].account;

      const contract = new Contract(
        SubscriptionABI,
        SUBSCRIPTION_CONTRACT_ADDRESS,
        account
      );

      // Call the contract to upgrade subscription
      const { transaction_hash } = await contract.upgrade_subscription(
        SUBSCRIPTION_TIERS[tierName]
      );

      // Wait for transaction to be accepted
      await account.waitForTransaction(transaction_hash);

      setActiveSubscription(tierName);
      alert(`Successfully upgraded to ${tierName} Plan!`);
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      alert(`Failed to upgrade subscription: ${error.message}`);
    } finally {
      setProcessingTier(null);
    }
  };

  return (
    <div className="h-screen w-full pt-20 overflow-hidden flex flex-col">
      <section className="p-6 bg-white dark:bg-dark-primary-100 text-[#cc5a7e] mx-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Current Subscription</h2>
          <p className="text-gray-500 dark:text-white">{activeSubscription} Plan</p>
        </div>
      </section>

      <section className="mt-8 px-6 grid grid-cols-4 gap-6">
        {subscriptionTiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col justify-between bg-white dark:bg-dark-primary-100 dark:text-white border rounded-lg shadow-lg p-6 ${
              activeSubscription === tier.name
                ? "border-[#cc5a7e]"
                : "border-transparent hover:border-[#1bf3dc]"
            }`}
          >
            <h3 className="text-xl font-bold text-[#cc5a7e]">{tier.name}</h3>
            <p className="text-3xl font-bold mb-4">{tier.price}</p>
            <ul className="mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <Check className="text-[#cc5a7e] w-5 h-5 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePurchaseSubscription(tier.name)}
              disabled={processingTier === tier.name || activeSubscription === tier.name}
              className={`w-full py-3 rounded-lg font-bold ${
                activeSubscription === tier.name
                  ? "bg-[#22577a] text-white cursor-not-allowed"
                  : processingTier === tier.name
                  ? "bg-gray-300 text-gray-500"
                  : "bg-gray-200 hover:bg-gray-300 text-black"
              }`}
            >
              {activeSubscription === tier.name
                ? "Current Plan"
                : processingTier === tier.name
                ? "Processing..."
                : "Upgrade"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Subscription;