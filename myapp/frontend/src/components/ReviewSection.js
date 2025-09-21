import React, { useState, useEffect } from "react";

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [username] = useState(localStorage.getItem("user") || "guest");

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews")
      .then(res => res.json())
      .then(setReviews);
  }, []);

  const submitReview = async () => {
    const res = await fetch("http://localhost:5000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, rating, text })
    });
    if (res.ok) {
      const newReview = await res.json();
      setReviews([...reviews, newReview]);
    }
  };

  return (
    <div>
      <h2>Reviews</h2>
      {reviews.map(r => (
        <div key={r.id}>
          <b>{r.username}</b> ⭐{r.rating} <p>{r.text}</p>
        </div>
      ))}
      {username !== "guest" && (
        <div>
          <select value={rating} onChange={e => setRating(e.target.value)}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <textarea value={text} onChange={e => setText(e.target.value)} />
          <button onClick={submitReview}>Add Review</button>
        </div>
      )}
    </div>
  );
}

