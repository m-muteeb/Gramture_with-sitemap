import React from "react";
import "../../assets/css/homepage.css"; // Import the CSS file
import img1 from "../../assets/images/OBJECTS.webp";
import img2 from "../../assets/images/carousel img2.webp";
import img3 from "../../assets/images/carousel img3.webp";
import { Helmet } from "react-helmet-async";

const Home = () => {
  return (
    <>
    <Helmet>
      <title>
      Gramture - 9th, 10th, 1st & 2nd Year Notes, University & Study Guide
    </title>
    <meta
      name="description"
      content="9th, 10th, 1st & 2nd-year notes, essays, stories, letters, question answers & chapter summaries
      on Gramture. Your complete study guide in one place!"
      />
    </Helmet>
    <main className="container-fluid p-0">
      {/* Preload LCP Image */}
      <link rel="preload" as="image" href={img1} />

      {/* Content Section */}
      <section className="container py-5 ">
  <div className="row">
    {/* Left Column with Content */}
    <div className="col-md-6 mt-2">
      <h1 className="text-xl mb-4 text-center mt-4">Welcome to Gramture</h1>
      <p>
  Whenever curriculum wings update or publish new content, students face unavailability or a shortage of books in the market, leading to difficulties in purchasing new books. This situation can affect their studies. To solve such problems, we introduce <b>Gramture</b>, an innovative solution designed to help students and teachers.
</p>
<p>
  <b>Gramture</b> is an educational website that offers study materials for 9th, 10th, first-year, and second-year students, ensuring that students have easy access to necessary learning resources.
</p>
<p>
  With free access to high-quality educational resources, <b>Gramture</b> is a valuable platform for students looking to learn effectively and achieve academic success.
</p>

    </div>

    {/* Right Column with Carousel */}
{/* Right Column with Carousel */}
<div className="col-md-6 mt-4">
  <div
    id="gramtureCarousel"
    className="carousel slide"
    data-bs-ride="carousel" // Makes the carousel start automatically on page load
    data-bs-interval="2000" // Interval in milliseconds (set to 2 seconds for auto-slide)
    data-bs-pause="false" // Ensures it doesn't pause on hover
  >
    <div className="carousel-inner">
      <div className="carousel-item active">
        <img
          src={img1}
          className="d-block w-100"
          alt="Image 1"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '300px',
          }}
        />
      </div>
      <div className="carousel-item">
        <img
          src={img2}
          className="d-block w-100"
          alt="Image 2"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '300px',
          }}
        />
      </div>
      <div className="carousel-item">
        <img
          src={img3}
          className="d-block w-100"
          alt="Image 3"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '300px',
          }}
        />
      </div>
    </div>
    <button
      className="carousel-control-prev custom-carousel-button"
      type="button"
      data-bs-target="#gramtureCarousel"
      data-bs-slide="prev"
    >
      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Previous</span>
    </button>
    <button
      className="carousel-control-next custom-carousel-button"
      type="button"
      data-bs-target="#gramtureCarousel"
      data-bs-slide="next"
    >
      <span className="carousel-control-next-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Next</span>
    </button>
  </div>
</div>


  </div>
</section>

    </main>
              </>
  );
};

export default Home;
