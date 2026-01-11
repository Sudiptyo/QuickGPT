import React, { useEffect, useState } from "react";
import { dummyPlans } from "../assets/assets";
import Loading from "./Loading";
import { useAppContext } from "../Context/AppContext";
import toast from "react-hot-toast";

const Credits = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios } = useAppContext();

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get("/api/v1/payment/get-plans");
      if (data?.success) {
        setPlans(data?.data);
        setLoading(false);
      } else {
        toast.error(data?.message || "Failed to fetch plans");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
      setLoading(false);
    }
  };

  const purchasePlan = async (planId) => {
    try {
      const { data } = await axios.post("/api/v1/payment/purchase-plan", {
        planId,
      });
      if (data?.success) {
        window.location.href = data?.paymentUrl;
      } else {
        toast.error(data?.message || "Failed to purchase plan");
      }
    } catch (err) {
      console.log("Error Purchasing Plans: ", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-semibold text-center mb-10 xl:mt30 text-gray-800 dark:text-white">
          Credit Plans
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`border border-gray-200 dark:border-purple-700 rounded-lg shadow hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col ${
                plan._id === "pro"
                  ? "bg-purple-50 dark:bg-purple-900"
                  : "bg-white dark:bg-transparent"
              }`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-black dark:text-white dark:tew mb-2">
                  {plan.name}
                </h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-pink-300 mb-4">
                  ₹{plan.price}
                  <span> / {plan.credits} Credits</span>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() =>
                  toast.promise(purchasePlan(plan._id), {
                    loading: "Processing...",
                  })
                }
                className="mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 rounded transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Credits;
