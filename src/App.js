import React, { useState } from 'react';
import Papa from 'papaparse';

export default function ABOrderApp() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [qtyInputs, setQtyInputs] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const parsed = results.data.map((row) => ({
            description:
              (row["ITEM DESCRIPTION"] || "") +
              (row["ITEM DESCRIPTION 2"] ? " " + row["ITEM DESCRIPTION 2"] : ""),
            vendor: row["VENDOR"],
            unitsOH: row["OH QTY"],
            caseQty: row["TIER QTY"],
            palletUnits: row["PALLET_UNITS"],
            category: row["CATEGORY"],
            itemNumber: row["ITEM NUMBER"],
          }));
          setItems(parsed);
        },
      });
    }
  };

  const addToCart = (item) => {
    const qty = parseInt(qtyInputs[item.itemNumber]) || 1;
    const newItem = { ...item, orderQty: qty };
    setCart([...cart, newItem]);
    setQtyInputs({ ...qtyInputs, [item.itemNumber]: "" });
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const generateEmail = () => {
    const body = encodeURIComponent(
      `PO Number: ${poNumber}\nCustomer: ${customerName}\nShip To: ${shipTo}\n\nItems:\n` +
        cart
          .map(
            (c) =>
              `${c.description} (${c.vendor}) - Order Qty: ${c.orderQty} pallets | Units OH: ${c.unitsOH}`
          )
          .join("\n")
    );
    const subject = encodeURIComponent(`Purchase Order ${poNumber}`);
    window.location.href = `mailto:YOUR_EMAIL@example.com?subject=${subject}&body=${body}`;
  };

  const categories = Array.from(new Set(items.map((i) => i.category))).filter(
    Boolean
  );

  const filteredItems = items.filter((i) => {
    const matchesSearch = i.description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? i.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>AB Customer Ordering App</h1>

      <div>
        <p>Upload Inventory File (CSV export from 4041):</p>
        <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
      </div>

      <div style={{ margin: "10px 0" }}>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <h2>Available Inventory</h2>
      <div
        style={{
          maxHeight: "400px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <strong>{item.description}</strong>
            <p>Vendor: {item.vendor}</p>
            <p>Units OH: {item.unitsOH}</p>
            <p>Case Qty: {item.caseQty}</p>
            <p>Units/Pallet: {item.palletUnits}</p>
            <p>Category: {item.category}</p>
            <input
              type="number"
              min="1"
              placeholder="Pallet Qty"
              value={qtyInputs[item.itemNumber] || ""}
              onChange={(e) =>
                setQtyInputs({ ...qtyInputs, [item.itemNumber]: e.target.value })
              }
            />
            <button onClick={() => addToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <h2>Cart</h2>
      {cart.map((c, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>{c.description}</strong>
          <p>{c.vendor}</p>
          <p>Order Qty: {c.orderQty} pallets</p>
          <p>Units OH: {c.unitsOH}</p>
          <button onClick={() => removeFromCart(idx)}>Remove</button>
        </div>
      ))}

      <h2>Purchase Order Info</h2>
      <input
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
      <input
        placeholder="PO Number"
        value={poNumber}
        onChange={(e) => setPoNumber(e.target.value)}
      />
      <input
        placeholder="Ship To Address"
        value={shipTo}
        onChange={(e) => setShipTo(e.target.value)}
      />
      <button onClick={generateEmail}>Generate PO Email</button>
    </div>
  );
}
