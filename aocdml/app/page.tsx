"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState("");
  const [probability, setProbability] = useState<number | null>(null);
  const [gradcamUrl, setGradcamUrl] = useState("");
  const [shapUrl, setShapUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("img_file", file);

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setPrediction(data.prediction);
      setProbability(data.probability);
      setGradcamUrl(
        `${process.env.NEXT_PUBLIC_API_URL}${data.gradcam_url}`
      );
      setShapUrl(
        `${process.env.NEXT_PUBLIC_API_URL}${data.shap_url}`
      );
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AOCDML Ultrasound Image Classification</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload & Predict"}
      </button>

      {prediction && (
        <div style={{ marginTop: "30px" }}>
          <h2>Prediction:</h2>
          <p>
            <strong>{prediction}</strong>
          </p>
          <p>Probability: {probability}%</p>

          <h3>Grad-CAM</h3>
          <img src={gradcamUrl} width="300" />
          <br />
          <a href={gradcamUrl} download>
            Download Grad-CAM
          </a>

          <h3>SHAP</h3>
          <img src={shapUrl} width="300" />
          <br />
          <a href={shapUrl} download>
            Download SHAP
          </a>
        </div>
      )}
    </main>
  );
}