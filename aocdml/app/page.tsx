"use client";

import { useState, useEffect } from "react";
import styles from "./Home.module.css";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState("");
  const [probability, setProbability] = useState<number | null>(null);
  const [gradcamUrl, setGradcamUrl] = useState("");
  const [shapUrl, setShapUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 16) setGreeting("Good Afternoon");
    else if (hour < 21) setGreeting("Good Evening");
    else setGreeting("Good Night");
  }, []);

  const handleAcceptConsent = () => {
    setConsentGiven(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setPrediction("");
      setProbability(null);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

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
      setGradcamUrl(`${process.env.NEXT_PUBLIC_API_URL}${data.gradcam_url}`);
      setShapUrl(`${process.env.NEXT_PUBLIC_API_URL}${data.shap_url}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong with the prediction server.");
    }
    setLoading(false);
  };

  const themeClass = isDarkMode ? styles.dark : styles.light;

  if (!consentGiven) {
    return (
      <div className={`${styles.themeWrapper} ${themeClass}`}>
        <div className={styles.consentOverlay}>
          <div className={styles.consentModal}>
            <div className={styles.modalHeader}>
              <div className={styles.iconWrapper}>
                <ShieldIcon />
              </div>
              <h2>Notice & Consent</h2>
              <p>Please review our data and liability policies before proceeding.</p>
            </div>
            
            <div className={styles.modalBody}>
              <ol className={styles.consentList}>
                <li>
                  <strong>Consent to Analysis:</strong> You consent to have the
                  uploaded images analyzed by the AI model provided by this system.
                </li>
                <li>
                  <strong>Data Security & Deletion:</strong> Any images or data you
                  provide will be handled securely and automatically deleted after
                  analysis.
                </li>
                <li>
                  <strong>Accuracy of Results:</strong> The results provided by this
                  system are <strong>not 100% accurate</strong> and must be
                  confirmed by a registered medical doctor or oncologist.
                </li>
                <li>
                  <strong>Purpose of the System:</strong> This system is designed to
                  aid medical assistance and is <strong>not a substitute</strong>{" "}
                  for professional medical advice, diagnosis, or treatment.
                </li>
                <li>
                  <strong>Limitation of Liability:</strong> The creators of this
                  system are not responsible for any actions taken based on these
                  results. You must consult a qualified medical professional before
                  making any medical decisions.
                </li>
              </ol>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.primaryButton}
                onClick={handleAcceptConsent}
              >
                I Understand and Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.themeWrapper} ${themeClass}`}>
      <nav className={styles.navbar}>
        <div className={styles.logoArea}>
          <div className={styles.logoPlaceholder}><img src="/logo.svg" alt="AOCDML Logo" /></div>
          <span className={styles.systemName}>AOCDML</span>
        </div>
        <button 
          className={styles.themeToggle} 
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </nav>

      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1>{greeting}</h1>
          <p>Upload an ultrasound image for AI-assisted classification.</p>
        </header>

        <div className={styles.dashboardGrid}>
          <section className={styles.card}>
            <h3>Image Upload</h3>
            <label className={styles.uploadZone}>
              <input
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <div className={styles.previewContainer}>
                  <img src={previewUrl} alt="Ultrasound Preview" className={styles.imagePreview} />
                  <div className={styles.changeImageOverlay}>Click to change image</div>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <UploadIcon />
                  <p><strong>Click to browse</strong> or drag and drop</p>
                  <span>Supports JPG, PNG, DICOM (converted)</span>
                </div>
              )}
            </label>

            <button 
              className={styles.primaryButton} 
              onClick={handleUpload} 
              disabled={!file || loading}
              style={{ width: "100%", marginTop: "20px" }}
            >
              {loading ? "Analyzing Image..." : "Upload & Predict"}
            </button>
          </section>

          <section className={styles.card}>
            <h3>Analysis Results</h3>
            {!prediction && !loading && (
              <div className={styles.emptyState}>
                <p>Upload an image and run the prediction to see results here.</p>
              </div>
            )}

            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Processing via AOCDML model...</p>
              </div>
            )}

            {prediction && !loading && (
              <div className={styles.resultsContainer}>
                <div className={styles.predictionBox}>
                  <h4>Diagnosis Prediction</h4>
                  <div className={styles.predictionText}>{prediction}</div>
                  <div className={styles.probabilityBar}>
                    <div 
                      className={styles.probabilityFill} 
                      style={{ width: `${probability}%` }}
                    ></div>
                  </div>
                  <p className={styles.probabilityText}>Confidence: {probability}%</p>
                </div>

                <div className={styles.downloadGrid}>
                  <a href={gradcamUrl} download className={styles.downloadButton}>
                    <DownloadIcon />
                    <span>Grad-CAM XAI</span>
                  </a>
                  <a href={shapUrl} download className={styles.downloadButton}>
                    <DownloadIcon />
                    <span>SHAP XAI</span>
                  </a>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0D46D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);