// Path: src/Pages/SingleProduct.jsx
// Notes:
// - Mobile thumbnails appear UNDER the main image (scrollable row)
// - Desktop thumbnails remain on the LEFT
// - Image box made more compact and sits higher: max-h adjusted + smaller padding

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaBolt,
  FaHeart, FaRegHeart, FaCheckCircle, FaTruck, FaShieldAlt,
  FaThumbsUp, FaRegThumbsUp, FaReply, FaShareAlt,
  FaChevronLeft, FaChevronRight, FaTimes, FaCommentDots
} from "react-icons/fa";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

/* -----------------------------
   Helpers & UI Bits
------------------------------*/
const getMediaItems = (product) => {
  const arr = [];
  if (product?.images?.length) product.images.forEach(url => arr.push({ type: "image", url }));
  if (product?.videos?.length) product.videos.forEach(url => arr.push({ type: "video", url }));
  if ((!product?.images?.length) && product?.image) arr.unshift({ type: "image", url: product.image });
  return arr;
};

const StarRating = ({ rating, size = "text-base", showNumber = false }) => {
  const stars = [];
  const r = Number(rating || 0);
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(r)) stars.push(<FaStar key={i} className={`${size} text-yellow-400`} />);
    else if (i === Math.ceil(r) && r % 1 !== 0) stars.push(<FaStarHalfAlt key={i} className={`${size} text-yellow-400`} />);
    else stars.push(<FaRegStar key={i} className={`${size} text-gray-300`} />);
  }
  return (
    <div className="flex items-center gap-1">
      {stars}
      {showNumber && <span className="ml-2 text-gray-700 font-semibold">{r.toFixed(1)}</span>}
    </div>
  );
};

const RatingBar = ({ stars, percentage, count }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className="flex items-center gap-1 w-16">
      <span className="font-semibold text-sm">{stars}</span>
      <FaStar className="text-xs text-gray-400" />
    </div>
    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6 }}
        className="bg-green-500 h-full"
      />
    </div>
    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
  </div>
);

const ReviewCard = ({ review, onLike, onReply, currentUserId }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const liked = review?.likedBy?.some(id => id?.toString() === currentUserId?.toString());

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(review._id || review.id, replyText);
    setReplyText("");
    setShowReplyBox(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border-b border-gray-200 py-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {review.userName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-gray-800">{review.userName || 'Anonymous'}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <FaCheckCircle /> Verified Purchase
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm">
              <span className="font-semibold">{review.rating}</span>
              <FaStar className="text-xs" />
            </div>
            <span className="text-gray-600 text-sm">
              {new Date(review.createdAt || review.date).toLocaleDateString()}
            </span>
          </div>

          <p className="text-gray-800 mb-3">{review.comment}</p>

          {review.images?.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Review ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded border"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => onLike(review._id || review.id)}
              className={`flex items-center gap-1 transition ${liked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              {liked ? <FaThumbsUp /> : <FaRegThumbsUp />}
              <span>Helpful ({review.helpful || 0})</span>
            </button>
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition"
            >
              <FaReply />
              <span>Reply</span>
            </button>
          </div>

          <AnimatePresence>
            {showReplyBox && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleReplySubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Submit Reply
                  </button>
                  <button
                    onClick={() => { setShowReplyBox(false); setReplyText(""); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {review.replies?.length > 0 && (
            <div className="mt-4 space-y-3">
              {review.replies.map((reply, idx) => (
                <div key={idx} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {reply.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">{reply.userName || 'Anonymous'}</span>
                      <span className="text-xs text-gray-500">{new Date(reply.createdAt || reply.date).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* -----------------------------
   Main Component
------------------------------*/
export default function SingleProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Product
  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Loading & skeleton
  const [loading, setLoading] = useState(true);

  // Gallery
  const [selected, setSelected] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Fullscreen viewer
  const [showFull, setShowFull] = useState(false);
  const [fsScale, setFsScale] = useState(1); // pinch scale
  const [fsOffset, setFsOffset] = useState({ x: 0, y: 0 }); // pan offset
  const pinchRef = useRef({ startDist: 0, lastScale: 1, lastOffset: { x: 0, y: 0 } });
  const touchRef = useRef({ startX: 0, startY: 0, isSwiping: false });

  // Share & wishlist
  const [wishlist, setWishlist] = useState(false);

  // Reviews
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });

  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    distribution: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ]
  });

  // Fetch user for review actions (non-blocking)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setCurrentUser(await res.json());
        else {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({ _id: payload.userId, id: payload.userId });
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // Fetch product + suggestions
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/products/id/${id}`);
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        if (!isMounted) return;
        setProduct(data);

        // suggestions
        if (data?.category) {
          const sRes = await fetch(`${BASE_API_URL}/api/products/${data.category}`);
          const all = await sRes.json();
          if (isMounted) setSuggestions(Array.isArray(all) ? all.filter(p => p._id !== id).slice(0, 6) : []);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  // Fetch reviews
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/reviews/product/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        const r = data.reviews || [];
        if (r.length) {
          const total = r.length;
          const sum = r.reduce((acc, it) => acc + (it.rating || 0), 0);
          const average = sum / total;
          const distribution = [5, 4, 3, 2, 1].map(star => {
            const count = r.filter(x => x.rating === star).length;
            return { stars: star, count, percentage: Math.round((count / total) * 100) };
          });
          setRatingStats({ average, total, distribution });
        } else {
          setRatingStats({
            average: 0, total: 0,
            distribution: [
              { stars: 5, count: 0, percentage: 0 },
              { stars: 4, count: 0, percentage: 0 },
              { stars: 3, count: 0, percentage: 0 },
              { stars: 2, count: 0, percentage: 0 },
              { stars: 1, count: 0, percentage: 0 },
            ]
          });
        }
      }
    } catch { /* ignore */ }
    finally { setReviewsLoading(false); }
  };
  useEffect(() => { fetchReviews(); }, [id]);

  // Sorted reviews
  const sortedReviews = useMemo(() => {
    const arr = [...reviews];
    if (sortBy === "recent") arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "helpful") arr.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    else if (sortBy === "rating") arr.sort((a, b) => (b.rating || 0) - (a.rating || 0)).reverse();
    return arr;
  }, [reviews, sortBy]);

  // Share
  const shareProduct = () => {
    const url = `${window.location.origin}/product/${id}`;
    if (navigator.share) navigator.share({ title: product?.name, url });
    else {
      navigator.clipboard.writeText(url);
      alert("Product link copied!");
    }
  };

  // Cart actions
  const addToCart = async (showAlert = true) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return false; }
    const item = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: getMediaItems(product)[selected]?.url || product.images?.[0] || product.image,
      qty: 1
    };
    try {
      const res = await fetch(`${BASE_API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item })
      });
      const data = await res.json();
      if (showAlert) alert(data.msg || (res.ok ? "Added to cart!" : "Error"));
      return res.ok;
    } catch {
      if (showAlert) alert("Server error");
      return false;
    }
  };
  const handleBuyNow = async () => {
    const success = await addToCart(false);
    if (success) navigate("/cartpage");
  };

  // Desktop hover zoom positioning
  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Mobile swipe in main gallery (not fullscreen)
  const touchStartRef = useRef({ x: 0, y: 0, t: 0 });
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    const { x, y, t } = touchStartRef.current;
    const dx = (e.changedTouches[0].clientX - x);
    const dy = (e.changedTouches[0].clientY - y);
    const dt = Date.now() - t;
    if (dt < 500 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setSelected(prev => {
        const next = dx < 0 ? prev + 1 : prev - 1;
        const media = getMediaItems(product);
        if (next < 0) return 0;
        if (next > media.length - 1) return media.length - 1;
        return next;
      });
    }
  };

  // Fullscreen pinch-to-zoom + swipe
  const dist = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  const fsTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, isSwiping: true };
    } else if (e.touches.length === 2) {
      const d = dist(e.touches[0], e.touches[1]);
      pinchRef.current.startDist = d;
      pinchRef.current.lastScale = fsScale;
      pinchRef.current.lastOffset = { ...fsOffset };
    }
  };
  const fsTouchMove = (e) => {
    if (e.touches.length === 2) {
      // pinch
      const d = dist(e.touches[0], e.touches[1]);
      const scale = Math.min(4, Math.max(1, (d / (pinchRef.current.startDist || d)) * (pinchRef.current.lastScale || 1)));
      setFsScale(scale);
    } else if (e.touches.length === 1 && fsScale > 1) {
      // pan when zoomed
      const dx = e.touches[0].clientX - (touchRef.current.startX || 0);
      const dy = e.touches[0].clientY - (touchRef.current.startY || 0);
      setFsOffset({ x: pinchRef.current.lastOffset.x + dx, y: pinchRef.current.lastOffset.y + dy });
    }
  };
  const fsTouchEnd = (e) => {
    // swipe next/prev if not zooming
    if (fsScale === 1 && touchRef.current.isSwiping && e.changedTouches?.[0]) {
      const dx = e.changedTouches[0].clientX - (touchRef.current.startX || 0);
      if (Math.abs(dx) > 50) {
        setSelected(prev => {
          const media = getMediaItems(product);
          const next = dx < 0 ? prev + 1 : prev - 1;
          if (next < 0) return 0;
          if (next > media.length - 1) return media.length - 1;
          return next;
        });
      }
    }
    // reset pan inertia
    pinchRef.current.lastOffset = { ...fsOffset };
  };

  // Keyboard nav in fullscreen
  useEffect(() => {
    const onKey = (e) => {
      if (!showFull) return;
      if (e.key === "Escape") setShowFull(false);
      if (e.key === "ArrowRight") setSelected(s => Math.min(s + 1, getMediaItems(product).length - 1));
      if (e.key === "ArrowLeft") setSelected(s => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showFull, product]);

  // Lazy preload for next/prev image
  useEffect(() => {
    if (!product) return;
    const media = getMediaItems(product);
    [media[selected + 1]?.url, media[selected - 1]?.url].forEach(src => {
      if (src) { const im = new Image(); im.src = src; }
    });
  }, [product, selected]);

  /* -----------------------------
     Loading skeleton (shimmer)
  ------------------------------*/
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="h-12 w-full bg-gray-200/70 animate-pulse rounded"></div>
            <div className="h-[420px] w-full bg-gray-200/70 animate-pulse rounded"></div>
            <div className="h-12 w-full bg-gray-200/70 animate-pulse rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-gray-200/70 animate-pulse rounded"></div>
            <div className="h-6 w-1/2 bg-gray-200/70 animate-pulse rounded"></div>
            <div className="h-10 w-full bg-gray-200/70 animate-pulse rounded"></div>
            <div className="h-40 w-full bg-gray-200/70 animate-pulse rounded"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const mediaItems = getMediaItems(product);

  // Like / Reply actions
  const handleLike = async (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login to like reviews"); navigate("/login"); return; }
    try {
      const res = await fetch(`${BASE_API_URL}/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(prev => prev.map(r => (r._id === reviewId || r.id === reviewId)
          ? { ...r, helpful: data.helpful, likedBy: data.likedBy }
          : r));
      }
    } catch { /* ignore */ }
  };

  const handleReply = async (reviewId, replyText) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login to reply"); navigate("/login"); return; }
    try {
      const res = await fetch(`${BASE_API_URL}/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: replyText })
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(prev => prev.map(r => (r._id === reviewId || r.id === reviewId)
          ? { ...r, replies: data.replies }
          : r));
      }
    } catch { /* ignore */ }
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login to submit a review"); navigate("/login"); return; }
    if (!newReview.rating) return alert("Please select a rating");
    if (!newReview.comment.trim()) return alert("Please write a comment");
    try {
      const res = await fetch(`${BASE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: id, rating: newReview.rating, comment: newReview.comment })
      });
      if (res.ok) {
        setNewReview({ rating: 0, comment: "" });
        setShowReviewForm(false);
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review");
      }
    } catch { alert("Failed to submit review. Please try again."); }
  };

  /* -----------------------------
       Render
  ------------------------------*/
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6">

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to={`/category/${product.category}`} className="hover:text-blue-600">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-800">{product.name}</span>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Left: Images (sticky on lg) */}
              <div className="flex flex-col lg:flex-row gap-4 lg:sticky lg:top-16" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                {/* Thumbnails (left on lg) */}
                <div className="hidden lg:flex flex-col gap-3 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300">
                  {mediaItems.map((item, i) => (
                    <button
                      key={i}
                      className={`w-14 h-14 border rounded-md overflow-hidden flex-shrink-0 transition-all
                        ${selected === i ? 'border-blue-500 border-2' : 'border-gray-200 hover:border-gray-400'}`}
                      onClick={() => setSelected(i)}
                    >
                      {item.type === "image" ? (
                        <img src={item.url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="relative w-full h-full bg-gray-200 flex items-center justify-center text-[10px]">
                          VIDEO
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Main Image with Zoom */}
                <div
                  className="flex-1 flex items-center justify-center bg-white border border-gray-200 rounded-lg p-3 relative overflow-hidden max-h-[360px] md:max-h-[450px] lg:max-h-[500px]"
                >
                  <button
                    onClick={() => setWishlist(!wishlist)}
                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition"
                    aria-label="Wishlist"
                  >
                    {wishlist ? <FaHeart className="text-2xl text-red-500" /> : <FaRegHeart className="text-2xl text-gray-400" />}
                  </button>

                  {mediaItems[selected]?.type === "image" ? (
                    <div
                      className="relative w-full h-full flex items-center justify-center cursor-crosshair"
                      onMouseEnter={() => window.innerWidth >= 1024 && setIsZooming(true)}
                      onMouseLeave={() => setIsZooming(false)}
                      onMouseMove={handleMouseMove}
                      onClick={() => { setShowFull(true); setFsScale(1); setFsOffset({ x: 0, y: 0 }); }}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      <motion.img
                        key={selected}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        src={mediaItems[selected]?.url}
                        alt={product.name}
                        className="max-w-full max-h-[500px] object-contain select-none"
                        style={{
                          transform: isZooming ? `scale(2.5)` : 'scale(1)',
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          transition: 'transform 0.1s ease-out'
                        }}
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <video
                      controls
                      src={mediaItems[selected]?.url}
                      className="max-w-full max-h-[500px] object-contain rounded-lg"
                      onClick={() => { setShowFull(true); setFsScale(1); setFsOffset({ x: 0, y: 0 }); }}
                      onTouchStart={(e) => e.stopPropagation()}
                    />
                  )}
                </div>

                {/* ✅ Mobile thumbnails (under the main image) */}
                <div className="lg:hidden -mt-2">
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
                    {mediaItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setSelected(i)}
                        className={`w-16 h-16 border rounded-md overflow-hidden flex-shrink-0 transition-all ${
                          selected === i ? 'border-blue-500 border-2' : 'border-gray-200'
                        }`}
                      >
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={`Thumbnail ${i + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="relative w-full h-full bg-gray-200 flex items-center justify-center text-[10px]">
                            VIDEO
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Product Details */}
              <div className="flex flex-col">
                {/* Title & Share */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">{product.name}</h1>
                  <button
                    onClick={shareProduct}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded text-sm hover:bg-gray-200"
                    aria-label="Share"
                  >
                    <FaShareAlt /> Share
                  </button>
                </div>

                {/* Rating & Count */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded">
                    <span className="font-semibold">{(ratingStats.average || 0).toFixed(1)}</span>
                    <FaStar className="text-sm" />
                  </div>
                  <StarRating rating={ratingStats.average} />
                  <span className="text-gray-600">
                    {ratingStats.total.toLocaleString()} Ratings & {reviews.length} Reviews
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                        <span className="text-green-600 font-semibold text-lg">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-green-600 mt-1">+ ₹{Math.round((product.price || 0) * 0.05)} cashback</p>
                </div>

                {/* Offers */}
                <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-800 mb-3">Available Offers</h3>
                  <div className="space-y-2 text-sm">
                    <p>🏷️ <span className="font-semibold">Bank Offer:</span> 10% instant discount on SBI Credit Cards</p>
                    <p>🏷️ <span className="font-semibold">Special Price:</span> Get extra 5% off (price inclusive)</p>
                    <p>🏷️ <span className="font-semibold">No Cost EMI:</span> Available on orders above ₹3,000</p>
                  </div>
                </div>

                {/* Delivery */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-3">Delivery</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="Enter Delivery Pincode"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button className="text-blue-600 font-semibold text-sm hover:underline">
                      Check
                    </button>
                  </div>
                  <div className="space-y-2 mt-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><FaTruck className="text-gray-600" /> Free Delivery by <span className="font-semibold">Tomorrow</span></div>
                    <div className="flex items-center gap-2"><FaShieldAlt className="text-gray-600" /> 7 Days Replacement Policy</div>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Product Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-auto">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(true)}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart />
                    ADD TO CART
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <FaBolt />
                    BUY NOW
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ratings & Reviews</h2>

            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <HashLoader color="#070A52" size={50} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Summary */}
                  <div className="lg:col-span-1">
                    <div className="border rounded-lg p-6 text-center">
                      <div className="text-5xl font-bold text-gray-800 mb-2">
                        {(ratingStats.average || 0).toFixed(1)}
                        <FaStar className="inline-block text-3xl text-yellow-400 ml-2 mb-2" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        {ratingStats.total.toLocaleString()} Ratings & {reviews.length} Reviews
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowReviewForm(true)}
                        className="w-full bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition"
                      >
                        ✍️ Write a Review
                      </motion.button>
                    </div>
                  </div>

                  {/* Distribution */}
                  <div className="lg:col-span-2">
                    <h3 className="font-semibold text-gray-800 mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                      {ratingStats.distribution.map((item) => (
                        <RatingBar
                          key={item.stars}
                          stars={item.stars}
                          percentage={item.percentage}
                          count={item.count}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                  <span className="font-semibold text-gray-700">Sort by:</span>
                  <div className="flex gap-2 flex-wrap">
                    {['recent', 'helpful', 'rating'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setSortBy(option)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          sortBy === option
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {sortedReviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No reviews yet</p>
                      <p className="text-sm">Be the first to review this product!</p>
                    </div>
                  ) : (
                    sortedReviews.map((review) => (
                      <ReviewCard
                        key={review._id || review.id}
                        review={review}
                        onLike={handleLike}
                        onReply={handleReply}
                        currentUserId={currentUser?._id || currentUser?.id}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Suggested Products */}
        {suggestions.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mb-28">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {suggestions.map(item => (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                        <img
                          src={item.images?.[0] || item.image}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                          <span>4.3</span>
                          <FaStar className="text-xs" />
                        </div>
                        <span className="text-xs text-gray-500">(234)</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">₹{item.originalPrice}</span>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Sticky Mobile Buy Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-2xl flex lg:hidden z-50">
          <button
            onClick={() => addToCart(true)}
            className="w-1/2 py-4 bg-yellow-500 text-black font-bold text-lg flex items-center justify-center gap-2"
          >
            <FaShoppingCart /> Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="w-1/2 py-4 bg-orange-600 text-white font-bold text-lg flex items-center justify-center gap-2"
          >
            <FaBolt /> Buy Now
          </button>
        </div>

        {/* ✅ Floating Feedback Button */}
        <button
          onClick={() => setShowReviewForm(true)}
          className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg bg-[#070A52] text-white px-4 py-3 flex items-center gap-2 hover:opacity-90"
        >
          <FaCommentDots />
          Feedback
        </button>

        {/* ✅ Fullscreen viewer (swipe + pinch-to-zoom) */}
        <AnimatePresence>
          {showFull && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            >
              {/* Close */}
              <button
                onClick={() => { setShowFull(false); setFsScale(1); setFsOffset({ x: 0, y: 0 }); }}
                className="absolute top-4 right-4 text-white text-2xl"
                aria-label="Close"
              >
                <FaTimes />
              </button>

              {/* Prev / Next */}
              <button
                onClick={() => setSelected(s => Math.max(0, s - 1))}
                className="absolute left-3 md:left-6 text-white/80 hover:text-white text-3xl px-3 py-2"
                aria-label="Previous"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => setSelected(s => Math.min(mediaItems.length - 1, s + 1))}
                className="absolute right-3 md:right-6 text-white/80 hover:text-white text-3xl px-3 py-2"
                aria-label="Next"
              >
                <FaChevronRight />
              </button>

              {/* Media */}
              <div
                className="max-w-[95vw] max-h-[90vh] overflow-hidden flex items-center justify-center"
                onTouchStart={fsTouchStart}
                onTouchMove={fsTouchMove}
                onTouchEnd={fsTouchEnd}
              >
                {mediaItems[selected]?.type === "image" ? (
                  <img
                    src={mediaItems[selected].url}
                    className="select-none"
                    alt=""
                    style={{
                      transform: `translate(${fsOffset.x}px, ${fsOffset.y}px) scale(${fsScale})`,
                      transformOrigin: "center center",
                      transition: "transform 80ms",
                      maxHeight: "90vh",
                      maxWidth: "95vw",
                      objectFit: "contain",
                      touchAction: "none"
                    }}
                    draggable={false}
                  />
                ) : (
                  <video
                    src={mediaItems[selected].url}
                    controls
                    autoPlay
                    className="max-h-[90vh] max-w-[95vw]"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Write a Review</h3>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      {star <= newReview.rating ? (
                        <FaStar className="text-3xl text-yellow-400" />
                      ) : (
                        <FaRegStar className="text-3xl text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={5}
                  maxLength={500}
                  className="w-full border-2 border-gray-200 rounded-lg p-4 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Share your experience with this product..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  {newReview.comment.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="flex-1 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

