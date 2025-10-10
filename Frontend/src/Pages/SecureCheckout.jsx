import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const deliveryCharge = 50;

export default function SecureCheckout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
    state: ""
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("http://localhost:3000/api/cart", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setSubtotal(data.subtotal || 0);
        setCartItemCount(data.items?.length || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    const saved = JSON.parse(localStorage.getItem('checkoutUserInfo'));
    if (saved) setUserInfo(saved);
  }, [token]);

  useEffect(() => {
    localStorage.setItem('checkoutUserInfo', JSON.stringify(userInfo));
  }, [userInfo]);

  const clearUserCart = async () => {
    try {
      await fetch("http://localhost:3000/api/cart/clear", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
  };

  const saveOrderToDB = async (paymentStatus) => {
    if (cartItemCount === 0) {
      alert("Your cart is empty. Add products before checkout.");
      throw new Error("Empty cart");
    }

    const discountedTotal = subtotal + deliveryCharge - discount;
    const orderPayload = {
      name: userInfo.name,
      mobile: userInfo.mobile,
      address: `${userInfo.address}, ${userInfo.city}, ${userInfo.state} - ${userInfo.pincode}`,
      instructions,
      paymentMethod: selectedPayment,
      paymentStatus,
      totalAmount: discountedTotal.toFixed(2),
    };

    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert("Failed to save order: " + (errorData.message || "Unknown error"));
        throw new Error(errorData.message || "Order save failed");
      }
      await res.json();
    } catch (err) {
      throw err;
    }
  };

  const handlePaymentSuccess = async (status) => {
    try {
      await saveOrderToDB(status);
      await clearUserCart();
      saveOrderDetailsAndNavigate(status);
    } catch {
      // error handled in saveOrderToDB alert
    }
  };

  const [appliedCoupon, setAppliedCoupon] = useState(null);  // track applied coupon code

const applyCoupon = () => {
  const code = couponCode.trim().toUpperCase();

  if (code === "URBANTALES" || code === "AJ001") {
    if (appliedCoupon === code) {
      alert("😄 Hey, you already used this coupon! Trying hard, aren’t you?");
    } else {
      setDiscount((subtotal + deliveryCharge) * 0.2);
      setAppliedCoupon(code);
      alert("✅ Coupon Applied: 20% discount");
    }
  } else {
    setDiscount(0);
    alert("❌ Invalid Coupon");
    setAppliedCoupon(null);
  }
};


  const isAddressComplete =
    userInfo.name &&
    userInfo.mobile &&
    userInfo.address &&
    userInfo.city &&
    userInfo.pincode &&
    userInfo.state;

  const isPayButtonEnabled =
    selectedPayment &&
    (selectedPayment !== "upi" || (upiId.trim() && isUpiVerified)) &&
    isAddressComplete &&
    !isEditingAddress;

  const discountedTotal = subtotal + deliveryCharge - discount;

  const saveOrderDetailsAndNavigate = (paymentStatus) => {
    const orderDetails = {
      orderId: `ORD-${Date.now()}`,
      name: userInfo.name,
      mobile: userInfo.mobile,
      address: `${userInfo.address}, ${userInfo.city}, ${userInfo.state} - ${userInfo.pincode}`,
      totalAmount: discountedTotal.toFixed(2),
      paymentMethod: selectedPayment,
      paymentStatus,
      instructions,
      orderDate: new Date().toLocaleString(),
    };
    localStorage.setItem("lastPlacedOrder", JSON.stringify(orderDetails));
    navigate("/orderconfirmed");
  };

  const handleRazorpayPayment = async () => {
    if (!isAddressComplete) {
      alert("Please fill in all address details before proceeding with payment.");
      setIsEditingAddress(true);
      return;
    }
    // COD
    if (selectedPayment === "cod") {
      alert("✅ Cash on Delivery selected! Your order will be confirmed.");
      await handlePaymentSuccess("Pending");
      return;
    }
    try {
      const totalAmountInPaise = Math.round(discountedTotal * 100);
      const res = await fetch("http://localhost:3000/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmountInPaise }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || res.statusText);
      }
      const orderData = await res.json();
      const options = {
        key: "rzp_test_QMG1XV6hszJZlA",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "UrbanTales",
        description: "Order Payment",
        order_id: orderData.id,
        handler: async () => {
          alert("✅ Payment successful! Your order has been placed.");
          await handlePaymentSuccess("Successful");
        },
        prefill: {
          name: userInfo.name,
          email: "customer@example.com",
          contact: userInfo.mobile,
        },
        theme: { color: "#070A52" },
        image: "https://seeklogo.com/images/R/razorpay-logo-B4B31B7918-seeklogo.com.png",
      };
      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      alert("Payment error, retry!");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <HashLoader color="#070A52" size={80} />
      </div>
    );

  return (
<>
  <div className="bg-gray-200 text-gray-800 min-h-screen flex flex-col justify-between">
    <Navbar />
    <div className="flex-grow">
      <header className="bg-white flex justify-between items-center px-6 py-4 shadow">
        <div className="text-xl font-bold text-[#070A52]">Checkout</div>
        <div className="text-2xl">🛒</div>
      </header>
      <main className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-4">
        <section className="md:col-span-2 space-y-4">
          {/* Address Section */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <h2 className="font-semibold text-[#070A52] mb-2">Delivering to you</h2>
                {isEditingAddress ? (
                  <div className="space-y-2 text-sm">
                    {[
                      ["Full Name", "name"],
                      ["Mobile Number", "mobile"],
                      ["Address (House No., Building, Street, Area)", "address"],
                      ["City", "city"],
                      ["Pincode", "pincode"],
                      ["State", "state"],
                    ].map(([label, field]) => (
                      <input
                        key={field}
                        type="text"
                        placeholder={label}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 mb-2"
                        value={userInfo[field]}
                        onChange={(e) => setUserInfo({ ...userInfo, [field]: e.target.value })}
                        required
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">
                    {isAddressComplete ? (
                      <>
                        <p>
                          <strong>{userInfo.name}</strong> ({userInfo.mobile})
                        </p>
                        <p>{userInfo.address}</p>
                        <p>
                          {userInfo.city}, {userInfo.state} - {userInfo.pincode}
                        </p>
                      </>
                    ) : (
                      <p className="text-red-500">Please add your delivery address details to proceed.</p>
                    )}
                  </div>
                )}
                <textarea
                  className="w-full mt-2 border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Delivery instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows="2"
                />
              </div>
              <button
                onClick={() => {
                  if (isEditingAddress) {
                    if (isAddressComplete) setIsEditingAddress(false);
                    else alert("Fill in all fields before saving.");
                  } else setIsEditingAddress(true);
                }}
                className="text-sm font-semibold text-[#070A52] hover:underline ml-4 whitespace-nowrap"
              >
                {isEditingAddress ? "Save Address" : "Edit Address"}
              </button>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-[#070A52] mb-4">Payment Method</h2>
            <div className="mb-4">
              <label htmlFor="couponInput" className="font-medium text-[#070A52]">
                Apply Coupon
              </label>
              <div className="flex mt-1 space-x-2">
                <input
                  id="couponInput"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 w-1/2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter code (e.g., URBANTALES)"
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponCode.trim() === ""}
                  className={`px-4 py-1 rounded text-sm transition-all duration-200 ${
                    couponCode.trim() !== ""
                      ? "bg-[#070A52] hover:bg-[#060844] text-white cursor-pointer"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setCouponCode("");
                    setDiscount(0);
                    setAppliedCoupon(null); // if you have this state tracking applied coupon
                    alert("🗑️ Coupon removed");
                  }}
                  className="px-4 py-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>

            <fieldset className="border border-gray-300 rounded p-4 space-y-4">
              <legend className="font-medium text-[#070A52] px-2">Payment Options</legend>
              {/* Card via Razorpay */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={selectedPayment === "card"}
                  onChange={() => setSelectedPayment("card")}
                  className="form-radio h-4 w-4 text-[#070A52]"
                />
                <span className="flex items-center space-x-2">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyHdEg7zNW7pe7MrW4qN9qBSH29HBRQuOfnA&s"
                    className="h-5 w-5"
                    alt="razorpay"
                  />
                  <span>Credit/Debit Card via Razorpay</span>
                </span>
              </label>
              {/* Net Banking + Bank Select */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="netbanking"
                  checked={selectedPayment === "netbanking"}
                  onChange={() => setSelectedPayment("netbanking")}
                  className="form-radio h-4 w-4 text-[#070A52]"
                />
                <span>Net Banking</span>
              </label>
              {selectedPayment === "netbanking" && (
                <select className="mt-1 ml-6 border border-gray-300 rounded px-2 py-1 w-2/3 sm:w-1/2 text-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Choose your bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="pnb">Punjab National Bank</option>
                </select>
              )}
              {/* UPI Apps */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={selectedPayment === "upi"}
                  onChange={() => setSelectedPayment("upi")}
                  className="form-radio h-4 w-4 text-[#070A52]"
                />
                <span>Other UPI Apps (PhonePe, Google Pay, etc.)</span>
              </label>
              {selectedPayment === "upi" && (
                <div className="flex mt-1 ml-6 items-center space-x-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setIsUpiVerified(false);
                    }}
                    disabled={selectedPayment !== "upi"}
                    placeholder="YourUPIID@bankname"
                    className={`border border-gray-300 rounded px-3 py-1 text-sm flex-grow ${
                      selectedPayment !== "upi"
                        ? "bg-gray-100 cursor-not-allowed"
                        : "focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    disabled={!upiId.trim() || selectedPayment !== "upi" || isUpiVerified}
                    onClick={() => setIsUpiVerified(true)}
                    className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                      upiId.trim() &&
                      selectedPayment === "upi" &&
                      !isUpiVerified
                        ? "bg-[#070A52] hover:bg-[#060844] text-white cursor-pointer"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Verify
                  </button>
                  {isUpiVerified && (
                    <span className="text-green-600 text-sm">✅ Verified</span>
                  )}
                </div>
              )}
              {/* COD */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={selectedPayment === "cod"}
                  onChange={() => setSelectedPayment("cod")}
                  className="form-radio h-4 w-4 text-[#070A52]"
                />
                <span>Cash on Delivery / Pay on Delivery</span>
              </label>
            </fieldset>
          </div>
        </section>
        <aside className="bg-white p-4 rounded shadow h-fit sticky top-4">
          <button
            className={`w-full py-2 rounded text-base mb-4 transition-all duration-200 ${
              isPayButtonEnabled
                ? "bg-[#FFCC00] hover:bg-yellow-400 text-[#070A52] font-semibold cursor-pointer"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={!isPayButtonEnabled}
            onClick={handleRazorpayPayment}
          >
            Pay ₹{discountedTotal.toFixed(2)}
          </button>
          <h3 className="font-semibold text-[#070A52] mb-3 border-b pb-2">
            Order Summary
          </h3>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between">
              <span>Items Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Delivery Charges:</span>
              <span>₹{deliveryCharge.toFixed(2)}</span>
            </li>
            <li className="flex justify-between text-green-600">
              <span>Promotion Applied:</span>
              <span>- ₹{discount.toFixed(2)}</span>
            </li>
            <hr className="my-2 border-gray-300" />
            <li className="flex justify-between font-bold text-lg mt-2">
              <span>Order Total:</span>
              <span>₹{discountedTotal.toFixed(2)}</span>
            </li>
          </ul>
        </aside>
      </main>
    </div>
    <Footer />
  </div>
</>
  );
}
