import React from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const plans = [
  {
    name: "Free",
    price: 0,
    features: [
      "1 download/day",
      "Limited premium features",
    ],
  },
  {
    name: "Bronze",
    price: 199,
    features: [
      "5 downloads/day",
      "Priority support",
    ],
  },
  {
    name: "Silver",
    price: 499,
    features: [
      "15 downloads/day",
      "Ad-free viewing",
    ],
  },
  {
    name: "Gold",
    price: 999,
    features: [
      "Unlimited downloads",
      "Ad-free viewing",
      "Premium features",
    ],
  },
];

const Subscription = () => {
  const { user } = useUser();
  const router = useRouter();

  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    // Prevent multiple payment requests
    if (loadingPlan) {
      return;
    }

    setLoadingPlan(plan);

    try {
      // Create Razorpay order
      const { data: order } = await axiosInstance.post(
        "/subscription/create-order",
        { plan }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,

        name: "YourTube",
        description: `${plan} Subscription`,

        order_id: order.id,

        handler: async function (response: any) {
          console.log("Payment Response:", response);

          try {
            const verify = await axiosInstance.post(
              "/subscription/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user._id,
                plan,
              }
            );

            if (verify.data.success) {
  alert("Subscription upgraded successfully!");

  const updatedUser = {
    ...user,
    plan,
  };

  localStorage.setItem("user", JSON.stringify(updatedUser));

  window.location.reload();
}
          } catch (error: any) {
            console.log("Payment verification error:", error);

            alert("Payment verification failed.");
          } finally {
            setLoadingPlan(null);
          }
        },

        prefill: {
          name: user.name,
          email: user.email,
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay payment window closed.");
            setLoadingPlan(null);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);

      razorpay.open();
    } catch (error: any) {
      console.log("Create order error:", error);
      console.log(error.response);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Unable to create payment.");
      }

      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-2 text-3xl font-bold">
        Upgrade Your Plan
      </h1>

      <p className="mb-8 text-gray-600">
        Current Plan:
        <span className="ml-2 font-semibold">
          {user?.plan || "Free"}
        </span>
      </p>

      <div className="grid gap-6 md:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-lg border p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold">
              {plan.name}
            </h2>

            <p className="my-4 text-xl">
              ₹{plan.price}
            </p>

            <ul className="mb-6 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature}>
                  ✓ {feature}
                </li>
              ))}
            </ul>

            {plan.name !== "Free" && (
              <button
                onClick={() => handleUpgrade(plan.name)}
                disabled={loadingPlan !== null}
                className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingPlan === plan.name
                  ? "Processing..."
                  : "Upgrade"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;