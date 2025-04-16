import React, { useState } from "react";
import axios from "axios";

const ReviewForm = ({ productId }: { productId: number }) => {
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access");

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/reviews/create/",
        {
          product: productId,
          stars,
          review_text: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Review submitted!");
    } catch (error) {
      console.error("Review error", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Write your review here..."
      />
      <input
        type="number"
        value={stars}
        onChange={(e) => setStars(parseInt(e.target.value))}
        min={1}
        max={5}
      />
      <button type="submit">Submit Review</button>
    </form>
  );
};

export default ReviewForm;

