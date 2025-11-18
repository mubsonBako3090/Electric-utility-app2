'use client';
import React from 'react';

export default function BillList({ bills = [] }) {
  return (
    <div className="bill-list">
      {bills.map(b => (
        <div key={b.id}>{b.title} — {b.amount}</div>
      ))}
    </div>
  );
}
