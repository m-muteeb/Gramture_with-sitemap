import React from "react";
import "../../assets/css/homepage.css"; // Import the CSS file
import img1 from "../../assets/images/OBJECTS.jpg";
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
      <section className="container py-5 content-section">
        <div className="row">
          <div className="col-md-6 mt-2">
            <h1 className="mb-3">Welcome to Gramture</h1>
            <p>
            Whenever curriculum wings update or publish new content, students face unavailability or a shortage of books in the market. Students also face difficulty in purchasing new books, which may affect their studies. To solve such situations and problems, we launch Gramture. The <b>Gramture</b> is just like an e-library for students as well as teachers.
            </p>
            <p>
            <b>Gramture</b> is an educational website that provides study materials
              for 9th, 10th, first-year, and second-year students.
            </p>
            {/* <p>
              The content is written in simple and easy-to-understand language,
              making it perfect for exam preparation and improving writing
              skills.
              </p> */}
            <p>
              With free access to high-quality educational resources,
              Gramture is a valuable platform for students looking to learn
              effectively and perform well in their studies.
            </p>
          </div>
          <div className="col-md-6 mt-4">

          
          <div className="col-md-6">
            <img
              src={img1}
              alt="Gramture - Your Study Companion"
              className="img-fluid rounded mt-2"
              // loading="lazy"
              fetchpriority="high"
              />
          </div>
        </div>
      </div>
      </section>
    </main>
              </>
  );
};

export default Home;
