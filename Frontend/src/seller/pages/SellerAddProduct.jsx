// Frontend/src/seller/pages/SellerAddProduct.jsx
import React, { useState, useRef, useEffect } from "react";
import SellerNavbar from "../components/SellerNavbar";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* Rich seller add product with:
   - Upload (files -> backend -> Cloudinary) or URL
   - Auto-Arrange flipkart style (image first, then alt)
   - Manual reorder via HTML5 drag/drop
   - Submits mediaOrder + images + videos
*/

const CATEGORY_LIST = [
  "fashion","electronic","furniture","kitchen","toys","cosmetic","food","sports","appliances"
];

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function SellerAddProduct() {
  const { seller, token, logout } = useSellerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", category: "", description: "", stock: "", price: "",
    images: [], videos: [], delivery: ""
  });

  const [imageMode, setImageMode] = useState("upload"); // upload | url
  const [videoMode, setVideoMode] = useState("upload"); // upload | url
  const [autoArrange, setAutoArrange] = useState(true);
  const [mediaOrder, setMediaOrder] = useState([]); // merged array of {type, url}
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // drag refs for manual reorder
  const dragItem = useRef();
  const dragOverItem = useRef();

  const setField = (k, v) => setForm(s => ({ ...s, [k]: v }));

  // upload file to backend route which saves to Cloudinary
  const uploadFile = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000
      });
      return res.data.url || res.data.secure_url || null;
    } catch (e) {
      console.error("upload error", e);
      setErr("Upload failed. Try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // handle file input selection
  const handleFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (!url) return;
    if (type === "image") setField("images", [...form.images, url]);
    else setField("videos", [...form.videos, url]);
  };

  // add URL
  const addUrl = (type, url) => {
    if (!url) return;
    if (type === "image") setField("images", [...form.images, url]);
    else setField("videos", [...form.videos, url]);
  };

  // build flipkart-style merged order (image first, alternate)
  const buildAutoMerged = () => {
    const imgs = [...form.images];
    const vids = [...form.videos];
    const merged = [];
    let i = 0, v = 0;
    let turn = imgs.length > 0 ? "image" : "video";
    while (i < imgs.length || v < vids.length) {
      if (turn === "image" && i < imgs.length) { merged.push({ type: "image", url: imgs[i++] }); }
      else if (turn === "video" && v < vids.length) { merged.push({ type: "video", url: vids[v++] }); }
      else {
        if (i < imgs.length) merged.push({ type: "image", url: imgs[i++] });
        else if (v < vids.length) merged.push({ type: "video", url: vids[v++] });
        else break;
      }
      turn = (turn === "image") ? "video" : "image";
    }
    return merged;
  };

  // build manual merged (images then videos) as starting point
  const buildManualMerged = () => {
    return [
      ...form.images.map(u => ({ type: "image", url: u })),
      ...form.videos.map(u => ({ type: "video", url: u }))
    ];
  };

  // whenever images/videos change: update mediaOrder
  useEffect(() => {
    if (autoArrange) setMediaOrder(buildAutoMerged());
    else {
      // preserve previous order where possible, append new items
      const prevUrls = new Set(mediaOrder.map(m => m.url));
      const current = buildManualMerged();
      const preserved = current.filter(m => prevUrls.has(m.url));
      const added = current.filter(m => !prevUrls.has(m.url));
      setMediaOrder([...preserved, ...added]);
    }
    // eslint-disable-next-line
  }, [form.images.length, form.videos.length, autoArrange]);

  // drag handlers for manual reorder
  const handleDragStart = (e, pos) => { dragItem.current = pos; };
  const handleDragEnter = (e, pos) => { dragOverItem.current = pos; };
  const handleDragEnd = (e) => {
    const list = [...mediaOrder];
    const dragged = list[dragItem.current];
    list.splice(dragItem.current, 1);
    list.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setMediaOrder(list);
  };

  // remove media (both from source arrays and mediaOrder)
  const removeAt = (idx) => {
    const item = mediaOrder[idx];
    if (!item) return;
    if (item.type === "image") setField("images", form.images.filter(u => u !== item.url));
    else setField("videos", form.videos.filter(u => u !== item.url));
    // rebuild mediaOrder
    if (autoArrange) setMediaOrder(buildAutoMerged());
    else setMediaOrder(prev => prev.filter((_, i) => i !== idx));
  };

  // move left/right fallback
  const moveItem = (idx, dir) => {
    const arr = [...mediaOrder];
    const target = dir === "left" ? idx - 1 : idx + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setMediaOrder(arr);
  };

  // final merged for submit
  const finalMergedForSubmit = () => autoArrange ? buildAutoMerged() : mediaOrder;

  // submit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      if (!seller || !seller._id) throw new Error("Login required.");
      if (!form.name.trim()) throw new Error("Product name required.");
      if (!form.category) throw new Error("Category required.");
      if (!form.stock || Number(form.stock) <= 0) throw new Error("Stock must be positive.");
      if (!form.price || Number(form.price) <= 0) throw new Error("Price must be positive.");

      const merged = finalMergedForSubmit();

      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description,
        stock: Number(form.stock),
        price: Number(form.price),
        image: form.images[0] || (merged.find(m => m.type === "image")?.url || ""),
        images: form.images,
        videos: form.videos,
        delivery: form.delivery,
        sellerId: seller._id,
        mediaOrder: merged,
      };

      await axios.post(`${API_BASE}/api/sellers/products/with-stock`, payload,
        { headers: { Authorization: `Bearer ${token}` } });
      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      setErr(err.response?.data?.error || err.message || "Submit failed.");
      if (err.response?.status === 401) logout();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen bg-[#f6f5ff] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#2a0055] mb-4">Add New Product</h2>
            {err && <div className="mb-3 text-red-600">{err}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <input className="w-full p-3 border rounded" placeholder="Product name" value={form.name} onChange={e => setField("name", e.target.value)} />
                <select className="w-full p-3 border rounded" value={form.category} onChange={e => setField("category", e.target.value)}>
                  <option value="">-- Select Category --</option>
                  {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <input type="number" min="1" placeholder="Stock" className="p-3 border rounded" value={form.stock} onChange={e => setField("stock", e.target.value)} />
                  <input type="number" min="1" placeholder="Price" className="p-3 border rounded" value={form.price} onChange={e => setField("price", e.target.value)} />
                </div>

                <textarea placeholder="Short description" className="w-full p-3 border rounded" rows={4} value={form.description} onChange={e => setField("description", e.target.value)}></textarea>
                <input placeholder="Delivery info" className="w-full p-3 border rounded" value={form.delivery} onChange={e => setField("delivery", e.target.value)} />
              </div>

              <div className="p-4 border rounded bg-white space-y-4">
                <div>
                  <div className="font-semibold">Auto Arrange (Flipkart style)</div>
                  <div className="text-xs text-gray-500">Toggle to auto alternate image & video (image first). Turn off to reorder manually.</div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => setAutoArrange(true)} className={`px-3 py-1 rounded ${autoArrange ? "bg-[#2a0055] text-white" : "bg-white border"}`}>Auto</button>
                    <button type="button" onClick={() => setAutoArrange(false)} className={`px-3 py-1 rounded ${!autoArrange ? "bg-[#2a0055] text-white" : "bg-white border"}`}>Manual</button>
                  </div>
                </div>

                <div>
                  <div className="font-semibold">Images</div>
                  <div className="mt-2 flex gap-2 items-center">
                    <label className={`px-2 py-1 border rounded ${imageMode==="upload"?"bg-[#2a0055] text-white":"bg-white"}`}><input type="radio" checked={imageMode==="upload"} onChange={() => setImageMode("upload")} /> Upload</label>
                    <label className={`px-2 py-1 border rounded ${imageMode==="url"?"bg-[#2a0055] text-white":"bg-white"}`}><input type="radio" checked={imageMode==="url"} onChange={() => setImageMode("url")} /> URL</label>
                  </div>
                  <div className="mt-2">
                    {imageMode === "upload" ? (
                      <input type="file" accept="image/*" onChange={(e)=>handleFileChange(e,"image")} />
                    ) : (
                      <div className="flex gap-2">
                        <input id="img-url" className="flex-1 p-2 border rounded" placeholder="Paste image URL" />
                        <button type="button" className="px-3 py-1 bg-[#2a0055] text-white rounded" onClick={()=>{
                          const el = document.getElementById("img-url");
                          if(el?.value){ addUrl("image", el.value.trim()); el.value=""; }
                        }}>Add</button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-semibold">Videos</div>
                  <div className="mt-2 flex gap-2 items-center">
                    <label className={`px-2 py-1 border rounded ${videoMode==="upload"?"bg-[#2a0055] text-white":"bg-white"}`}><input type="radio" checked={videoMode==="upload"} onChange={()=>setVideoMode("upload")} /> Upload</label>
                    <label className={`px-2 py-1 border rounded ${videoMode==="url"?"bg-[#2a0055] text-white":"bg-white"}`}><input type="radio" checked={videoMode==="url"} onChange={()=>setVideoMode("url")} /> URL</label>
                  </div>
                  <div className="mt-2">
                    {videoMode === "upload" ? (
                      <input type="file" accept="video/*" onChange={(e)=>handleFileChange(e,"video")} />
                    ) : (
                      <div className="flex gap-2">
                        <input id="vid-url" className="flex-1 p-2 border rounded" placeholder="Paste video URL" />
                        <button type="button" className="px-3 py-1 bg-[#2a0055] text-white rounded" onClick={()=>{
                          const el = document.getElementById("vid-url");
                          if(el?.value){ addUrl("video", el.value.trim()); el.value=""; }
                        }}>Add</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Images: {form.images.length} · Videos: {form.videos.length} {uploading && "· Uploading..."}
                </div>
              </div>
            </div>

            {/* Media preview & reorder */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Media Preview & Order</h3>
                <div className="text-xs text-gray-500">Drag to reorder (manual mode) · Remove · Move left/right</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mediaOrder.length === 0 && <div className="text-sm text-gray-400 col-span-full">No media yet</div>}

                {mediaOrder.map((m, idx) => (
                  <div key={m.url + idx}
                    draggable={!autoArrange}
                    onDragStart={(e)=>!autoArrange && handleDragStart(e, idx)}
                    onDragEnter={(e)=>!autoArrange && handleDragEnter(e, idx)}
                    onDragEnd={(e)=>!autoArrange && handleDragEnd(e)}
                    className="relative border rounded overflow-hidden bg-white"
                  >
                    {m.type==="image" ? (
                      <img src={m.url} alt="media" className="w-full h-36 object-cover" />
                    ) : (
                      <video src={m.url} controls className="w-full h-36 object-cover bg-black" />
                    )}
                    <div className="p-2 flex items-center justify-between">
                      <div className="text-xs font-medium text-gray-700">{m.type.toUpperCase()}</div>
                      <div className="flex gap-2 items-center">
                        {!autoArrange && (
                          <>
                            <button type="button" onClick={()=>moveItem(idx,"left")} className="text-xs px-2 py-1 border rounded">◀</button>
                            <button type="button" onClick={()=>moveItem(idx,"right")} className="text-xs px-2 py-1 border rounded">▶</button>
                          </>
                        )}
                        <button type="button" onClick={()=>removeAt(idx)} className="text-xs px-2 py-1 bg-red-50 text-red-600 border rounded">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button disabled={saving || uploading} className="px-5 py-3 bg-[#2a0055] text-white rounded-lg" type="submit">{saving ? "Saving..." : "Add Product"}</button>
              <button type="button" onClick={()=>{ setForm({name:"",category:"",description:"",stock:"",price:"",images:[],videos:[],delivery:""}); setMediaOrder([]); }} className="px-4 py-3 border rounded">Reset</button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
