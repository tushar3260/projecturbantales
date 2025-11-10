import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaHeart,
  FaShareAlt,
  FaUserCircle,
  FaThumbsUp,
  FaReply,
} from "react-icons/fa";
import { BASE_API_URL } from "@/utils/constants.js";
import { toast } from "react-hot-toast";

const StarRating = ({ rating, size = "text-yellow-500" }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        if (i < Math.floor(rating)) {
          return <FaStar key={i} className={`${size} text-yellow-400`} />;
        } else if (i < rating) {
          return <FaStarHalfAlt key={i} className={`${size} text-yellow-400`} />;
        } else {
          return <FaRegStar key={i} className={`${size} text-yellow-400`} />;
        }
      })}
    </div>
  );
};

const RatingBar = ({ stars, count, total }) => {
  const percentage = total ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-sm font-medium">{stars}</span>
      <FaStar className="text-yellow-400 text-sm" />
      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
        <motion.div
          className="bg-yellow-400 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6 }}
        ></motion.div>
      </div>
      <span className="text-gray-500 text-sm">{count}</span>
    </div>
  );
};

// ---------------- Review Section ----------------
const ReviewSection = ({ id }) => {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/api/reviews/product/${id}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews", err);
    }
  };

  const handleLike = async (reviewId) => {
    try {
      const res = await fetch(`${BASE_API_URL}/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, likes: data.likes } : r
        )
      );
    } catch (err) {
      console.error("Error liking review", err);
    }
  };

  const handleReply = async (reviewId, reply) => {
    try {
      const res = await fetch(`${BASE_API_URL}/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: reply }),
      });
      const data = await res.json();
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? { ...r, replies: [...(r.replies || []), data.reply] }
            : r
        )
      );
    } catch (err) {
      console.error("Error replying to review", err);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.comment) {
      toast.error("Please fill in both fields!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...newReview, productId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviews([data.review, ...reviews]);
        setNewReview({ rating: 0, comment: "" });
        toast.success("Review added!");
      }
    } catch (err) {
      console.error("Error adding review", err);
      toast.error("Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchReviews();
  }, [id]);

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reviews</h2>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <motion.div
            key={review._id}
            className="border-b pb-4 mb-4 bg-gray-50 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-2xl text-gray-400" />
              <div>
                <h4 className="font-semibold text-gray-700">
                  {review.user?.name || "Anonymous"}
                </h4>
                <StarRating rating={review.rating} size="text-sm" />
              </div>
            </div>
            <p className="mt-2 text-gray-600">{review.comment}</p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => handleLike(review._id)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <FaThumbsUp /> {review.likes?.length || 0}
              </button>
              <button
                onClick={() => {
                  const reply = prompt("Enter your reply:");
                  if (reply) handleReply(review._id, reply);
                }}
                className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
              >
                <FaReply /> Reply
              </button>
            </div>
            {review.replies?.length > 0 && (
              <div className="ml-6 mt-3 border-l-2 border-gray-300 pl-3">
                {review.replies.map((rep, idx) => (
                  <div key={idx} className="text-sm text-gray-700 mb-2">
                    <strong>{rep.user?.name || "User"}:</strong> {rep.text}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}

      {user ? (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">Add Your Review</h3>
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`cursor-pointer ${
                  newReview.rating >= star ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() =>
                  setNewReview((prev) => ({ ...prev, rating: star }))
                }
              />
            ))}
          </div>
          <textarea
            className="w-full border rounded p-2 mb-2"
            placeholder="Write your review..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
          />
          <button
            onClick={handleSubmitReview}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      ) : (
        <p className="text-gray-600 mt-4">
          Please <Link to="/login" className="text-blue-600 underline">login</Link> to add a review.
        </p>
      )}
    </div>
  );
};

// ---------------- Main Product Page ----------------
const SingleProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/api/products/id/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product", err);
    }
  };

  const handleAddToCart = async () => {
    try {
      await fetch(`${BASE_API_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productId: id }),
      });
      toast.success("Product added to cart!");
    } catch (err) {
      toast.error("Error adding to cart");
    }
  };

  const handleWishlist = () => {
    toast.success("Added to wishlist ❤️");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Product link copied!");
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-gray-600 text-sm mb-4">
        <Link to="/" className="hover:text-blue-600">Home</Link> /{" "}
        <Link to={`/category/${product.category}`} className="hover:text-blue-600">
          {product.category}
        </Link>{" "}
        / <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <motion.img
            src={product.image}
            alt={product.name}
            className="rounded-lg shadow-lg w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <StarRating rating={product.rating} />
          <p className="text-gray-600 mt-3">{product.description}</p>
          <p className="text-2xl font-semibold mt-4 text-blue-700">
            ₹{product.price}
          </p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white flex items-center gap-2 px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              <FaShoppingCart /> Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className="border border-gray-300 text-gray-600 flex items-center gap-2 px-5 py-2 rounded-lg hover:text-red-500"
            >
              <FaHeart /> Wishlist
            </button>
            <button
              onClick={handleShare}
              className="border border-gray-300 text-gray-600 flex items-center gap-2 px-5 py-2 rounded-lg hover:text-blue-500"
            >
              <FaShareAlt /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <ReviewSection id={id} />
    </div>
  );
};

export default SingleProduct;
