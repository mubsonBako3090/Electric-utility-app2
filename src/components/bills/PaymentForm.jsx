'use client';
import React from 'react';

export default function PaymentForm({ onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="payment-form">
      <input name="card" placeholder="Card number" />
      <button className="btn btn-primary">Pay</button>
    </form>
  );
}
