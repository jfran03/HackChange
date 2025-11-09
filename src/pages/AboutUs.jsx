import "../styles/AboutUs.css";

const AboutUs = () => {
  return (
    <div>
      <div className="aboutus-container">
        <div className="aboutus-content">
          <div className="aboutus-text">
            <h1 className="aboutus-title">ABOUT STREET AID</h1>

            <section className="aboutus-section">
              <h2>Our Mission</h2>
              <p>
                STREET AID is dedicated to creating a safer, more connected community
                by bridging the gap between those in need and the resources available
                to help them. We believe that everyone deserves access to shelter,
                food, and support services.
              </p>
            </section>

            <section className="aboutus-section">
              <h2>What We Do</h2>
              <p>
                Our platform connects individuals experiencing homelessness with nearby
                shelters, food banks, and community organizations. Through real-time
                mapping and alert systems, we make it easier for people to find help
                when they need it most.
              </p>
              <ul className="features-list">
                <li>Real-time mapping of available resources</li>
                <li>Community alert system for urgent situations</li>
                <li>Direct connection to shelters and organizations</li>
                <li>Member support network</li>
              </ul>
            </section>

            <section className="aboutus-section">
              <h2>Our Vision</h2>
              <p>
                We envision a world where no one has to face hardship alone. By
                leveraging technology and community support, we are building a
                compassionate network that ensures everyone has access to the
                resources they need to thrive.
              </p>
            </section>

            <section className="aboutus-section">
              <h2>Get Involved</h2>
              <p>
                Whether you are an individual seeking support, an organization
                offering services, or someone who wants to make a difference in
                your community, STREET AID welcomes you. Together, we can create
                lasting change.
              </p>
            </section>
          </div>

          <div className="aboutus-team">
            <div className="team-placeholder">
              <div className="team-image-placeholder">
                <span className="team-icon">Team</span>
                <h3>Our Team</h3>
                <p>Dedicated to making a difference</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
