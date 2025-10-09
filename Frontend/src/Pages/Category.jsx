import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { HashLoader } from 'react-spinners';

const Category = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('cat');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setError("Invalid category");
      setLoading(false);
      return;
    }
    fetch(`http://localhost:3000/api/products/${category}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to fetch products");
        setLoading(false);
      });
  }, [category]);

  // Cart add API with JWT
  const addToCart = async (id, name, price, image) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add items to cart.");
      return;
    }
    const item = { id, name, price, image, qty: 1 };
    try {
      const res = await fetch("http://localhost:3000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ item }),
      });
      const data = await res.json();
      alert(data.msg || (res.ok ? "Added to cart!" : "Failed to add to cart."));
    } catch (err) {
      console.error("Error:", err);
      alert("Server error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }
  if (error) {
    return <p className="text-center text-red-600 mt-10">{error}</p>;
  }

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center capitalize">{category} Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No products found.</p>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition duration-300"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-90 object-cover"
                />
                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-base text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  <div className="text-indigo-600 font-semibold text-lg mt-2">
                    ₹{product.price}
                  </div>
                  <button
                    className="w-full mt-3 bg-indigo-600 text-white text-sm py-2 rounded hover:bg-indigo-700 transition"
                    onClick={() =>
                      addToCart(product._id, product.name, product.price, product.image)
                    }
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Category;
