import React from "react";

const HomePage: React.FC = () => {
  return (
    <div style={styles.homepage}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>Book Store</h1>
        <div style={styles.searchBox}>
          <input type="text" placeholder="Search..." style={styles.searchInput} />
          <button style={styles.searchButton}>🔍</button>
        </div>
        <div style={styles.buttonGroup}>
          <button style={styles.button}>Sign Up</button>
          <button style={styles.button}>Login</button>
        </div>
        <div style={styles.cartContainer}> {}
          <span style={styles.cartIcon}>🛒</span>
        </div>
      </div>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroBackground}></div>  {}
        <h1 style={styles.heroText}>A Book Can Change Your Life</h1>
        <button style={styles.heroButton}>Shop Now</button>
      </div>

      {/* Bestseller Section */}
      <div style={styles.bestsellerSection}>
        <h2 style={styles.bestsellerTitle}>Bestsellers</h2>
        <p style={styles.bestsellerSubtitle}>
          Do consectetur proident proident id eiusmod deserunt consequat pariat
          ad ex velit do Lorem reprehenderit.
        </p>

        <div style={styles.bestsellerContainer}>
          {[...Array(3)].map((_, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.placeholderImage}></div>
              <h3 style={styles.cardTitle}>Book</h3>
              <p style={styles.cardText}>Sample book description.</p>
              <button style={styles.buttonOutline}>Learn more</button>
            </div>
          ))}
        </div>
      </div>

       {/* Review */}
       <div style={styles.reviewSection}>
        <div style={styles.reviewContainer}>
          <div style={styles.reviewImage}></div>
          <div style={styles.reviewContent}>
            <div style={styles.reviewStars}>⭐⭐⭐⭐⭐</div>
            <p style={styles.reviewText}>
              "Aliqua cupidatat id duis irure sunt exercitation voluptate cillum. 
              Consectetur ad ex do in reprehenderit est dolor elit et exercitation do ad. 
              Consectetur ad ex do in reprehenderit est dolor elit et exercitation."
            </p>
            <h4 style={styles.reviewName}>Full Name</h4>
            <p style={styles.reviewJob}>Job Title</p>
          </div>
        </div>
      </div>
    

      {/* Deal of the Week Section */}
      <div style={styles.bestsellerSection}>
        <h2 style={styles.bestsellerTitle}>Deal of the Week</h2>
        <p style={styles.bestsellerSubtitle}>
          Get the best deals on our top-rated books. Limited time only!
        </p>
        <div style={styles.bestsellerContainer}>
          {[...Array(3)].map((_, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.placeholderImage}></div>
              <h3 style={styles.cardTitle}>Book</h3>
              <p style={styles.cardText}>Limited-time book deal.</p>
              <button style={styles.buttonOutline}>Shop Now</button>
            </div>
          ))}
        </div>
      </div>
      

      {/* Footer Section */}
      <div style={styles.footer}>
        <h2 style={styles.footerTitle}>Start Your Reading Journey</h2>
        <p style={styles.footerSubtitle}>
          Find your next favorite book and embark on an adventure through pages.
        </p>
        <button style={styles.footerButton}>Contact Us</button>
      </div>
      </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  homepage: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 50px",
    backgroundColor: "#fff",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
    position: "fixed",
    width: "100%",
    top: 0,
    zIndex: 101,
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "6px",
    overflow: "hidden",
    flexGrow: 1, 
    maxWidth: "1000px", 
  },
  searchInput: {
    padding: "10px",
    border: "none",
    outline: "none",
    width: "200px",
    flexGrow: 1, 
    minWidth: "200px", 
  },
  searchButton: {
    backgroundColor: "#EF977F",
    color: "white",
    padding: "10px",
    border: "none",
    cursor: "pointer",
  },
  button: {
    backgroundColor: "#EF977F",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
  },

  hero: {
    position: "relative",
    marginTop: "80px",
    height: "400px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "url('https://i.ibb.co/CssQMFQj/DALL-E-2025-03-06-14-57-55-A-beautiful-and-immersive-book-themed-background-image-for-an-online-book.webp')", // 📌 Kullanıcıdan gelen resim dosyası
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.5, 
    zIndex: -1, 
  },
  heroText: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#000", 
  },
  heroButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#EF977F",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  bestsellerSection: {
    marginTop: "40px",
    padding: "50px 20px",
    backgroundColor: "#fff",
  },
  bestsellerTitle: {
    fontSize: "48px",
    fontWeight: 700,
    color: "#171A1F",
    marginBottom: "10px",
  },
  bestsellerSubtitle: {
    fontSize: "18px",
    color: "#9095A1",
    maxWidth: "600px",
    margin: "0 auto 40px",
  },
  bestsellerContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  card: {
    width: "350px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
  },
  placeholderImage: {
    width: "100%",
    height: "200px",
    backgroundColor: "#e0e0e0",
    borderRadius: "10px 10px 0 0",
    marginBottom: "15px",
  },
  buttonOutline: {
    width: "120px",
    height: "44px",
    backgroundColor: "transparent",
    color: "#EF977F",
    border: "1px solid #EF977F",
    borderRadius: "6px",
    cursor: "pointer",
  },
  // Review
  reviewSection: {
    marginTop: "50px",
    padding: "50px 20px",
    backgroundColor: "#f9f9f9",
  },
  reviewContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "40px",
  },
  reviewImage: {
    width: "120px",
    height: "120px",
    backgroundColor: "#dcdcdc",
    borderRadius: "16px",
  },
  reviewContent: {
    maxWidth: "600px",
    textAlign: "left",
  },
  reviewStars: {
    fontSize: "24px",
    color: "#FFD700",
  },
  reviewText: {
    fontSize: "20px",
    color: "#171A1F",
    marginBottom: "10px",
  },
  reviewName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#171A1F",
  },
  reviewJob: {
    fontSize: "18px",
    color: "#9095A1",
  },
  footer: {
    width: "100%",
    height: "384px",
    background: "#EF977F",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    marginTop: "40px",
    padding: "20px",
  },
  footerTitle: {
    fontSize: "48px",
    fontWeight: 700,
    color: "#6F7787",
  },
  footerSubtitle: {
    fontSize: "18px",
    color: "#424856",
    maxWidth: "600px",
    textAlign: "center",
  },
  footerButton: {
    marginTop: "20px",
    width: "120px",
    height: "52px",
    background: "#CFD2DA",
    border: "none",
    borderRadius: "6px",
    fontSize: "18px",
    cursor: "pointer",
  },
  footerButtonHover: {
    background: "#A8ADB7",
  },
  
};

export default HomePage;