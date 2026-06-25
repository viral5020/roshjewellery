import React, { useState } from 'react';

const MProfitStyleForm = () => {
  const [purchaseRows, setPurchaseRows] = useState([
    { asset: '', qty: 0, price: 0, brokerage: 0, amount: 0, sector: '' },
  ]);
  const [saleRows, setSaleRows] = useState([
    { asset: '', qty: 0, price: 0, brokerage: 0, amount: 0, sector: '' },
  ]);
  const [charges, setCharges] = useState({
    stt: 0, stamp: 0, other: 0, total: 0
  });
  const [meta, setMeta] = useState({
    date: new Date().toISOString().substring(0, 10),
    broker: '', contractNote: '', settlement: '',
    autoTransfer: false
  });

  const handleRowChange = (type, index, field, value) => {
    const rows = [...(type === 'purchase' ? purchaseRows : saleRows)];
    rows[index][field] = field === 'asset' || field === 'sector' ? value : parseFloat(value) || 0;
    rows[index].amount = rows[index].qty * rows[index].price + (type === 'purchase' ? rows[index].brokerage : -rows[index].brokerage);
    type === 'purchase' ? setPurchaseRows(rows) : setSaleRows(rows);
  };

  const addRow = type => {
    const newRow = { asset: '', qty: 0, price: 0, brokerage: 0, amount: 0, sector: '' };
    type === 'purchase' ? setPurchaseRows([...purchaseRows, newRow]) : setSaleRows([...saleRows, newRow]);
  };

  const handleSave = async () => {
    const formData = {
      purchases: purchaseRows,
      sales: saleRows,
      charges,
      meta
    };

    try {
      // Make the API call to save the transaction data
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Transaction saved:', result.transaction);  // Log the saved transaction
        alert('Transaction saved successfully!');  // Show a success message (you can customize this)
        // Optionally, reset the form or redirect to another page
      } else {
        console.error('Error saving transaction:', result.error);
        alert('Failed to save transaction. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error while saving transaction. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg font-sans text-sm">
      <h2 className="text-xl font-semibold mb-6">Add Transactions</h2>

      {/* Meta Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input type="date" value={meta.date} onChange={e => setMeta({ ...meta, date: e.target.value })} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Broker</label>
          <input type="text" placeholder="Broker" value={meta.broker} onChange={e => setMeta({ ...meta, broker: e.target.value })} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Contract Note</label>
          <input type="text" placeholder="Contract Note" value={meta.contractNote} onChange={e => setMeta({ ...meta, contractNote: e.target.value })} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Settlement No</label>
          <input type="text" placeholder="Settlement No" value={meta.settlement} onChange={e => setMeta({ ...meta, settlement: e.target.value })} className="w-full border p-2 rounded" />
        </div>
      </div>

      {/* Purchase Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold bg-gray-100 p-2 rounded">Purchase Transactions</h3>
        {purchaseRows.map((row, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 py-2">
            <div>
              <label className="block text-xs">Asset Name</label>
              <input placeholder="Asset Name" value={row.asset} onChange={e => handleRowChange('purchase', i, 'asset', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Sector</label>
              <input placeholder="Sector" value={row.sector} onChange={e => handleRowChange('purchase', i, 'sector', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Quantity</label>
              <input type="number" placeholder="Qty" value={row.qty} onChange={e => handleRowChange('purchase', i, 'qty', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Price</label>
              <input type="number" placeholder="Price" value={row.price} onChange={e => handleRowChange('purchase', i, 'price', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Brokerage</label>
              <input type="number" placeholder="Brokerage" value={row.brokerage} onChange={e => handleRowChange('purchase', i, 'brokerage', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Amount</label>
              <input type="number" disabled value={row.amount.toFixed(2)} className="w-full border p-2 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
        <button onClick={() => addRow('purchase')} className="text-blue-600 hover:underline mt-2">+ Add Row</button>
      </div>

      {/* Sale Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold bg-gray-100 p-2 rounded">Sale Transactions</h3>
        {saleRows.map((row, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 py-2">
            <div>
              <label className="block text-xs">Asset Name</label>
              <input placeholder="Asset Name" value={row.asset} onChange={e => handleRowChange('sale', i, 'asset', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Sector</label>
              <input placeholder="Sector" value={row.sector} onChange={e => handleRowChange('sale', i, 'sector', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Quantity</label>
              <input type="number" placeholder="Qty" value={row.qty} onChange={e => handleRowChange('sale', i, 'qty', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Price</label>
              <input type="number" placeholder="Price" value={row.price} onChange={e => handleRowChange('sale', i, 'price', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Brokerage</label>
              <input type="number" placeholder="Brokerage" value={row.brokerage} onChange={e => handleRowChange('sale', i, 'brokerage', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs">Amount</label>
              <input type="number" disabled value={row.amount.toFixed(2)} className="w-full border p-2 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
        <button onClick={() => addRow('sale')} className="text-blue-600 hover:underline mt-2">+ Add Row</button>
      </div>

      {/* Charges Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">STT</label>
          <input type="number" placeholder="STT" value={charges.stt} onChange={e => setCharges({ ...charges, stt: parseFloat(e.target.value) || 0 })} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Stamp Charges</label>
          <input type="number" placeholder="Stamp" value={charges.stamp} onChange={e => setCharges({ ...charges, stamp: parseFloat(e.target.value) || 0 })} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Other Charges</label>
          <input type="number" placeholder="Other" value={charges.other} onChange={e => setCharges({ ...charges, other: parseFloat(e.target.value) || 0 })} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Total Receivable</label>
          <input type="number" placeholder="Total" value={charges.total} onChange={e => setCharges({ ...charges, total: parseFloat(e.target.value) || 0 })} className="w-full border p-2 rounded" />
        </div>
      </div>

      {/* Auto Transfer Checkbox */}
      <div className="flex items-center mb-6">
        <input type="checkbox" checked={meta.autoTransfer} onChange={e => setMeta({ ...meta, autoTransfer: e.target.checked })} className="mr-2" />
        <label>Automatically transfer charges?</label>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
        <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  );
};

export default MProfitStyleForm;
