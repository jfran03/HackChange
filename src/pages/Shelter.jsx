import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Member.css";

const Shelter = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    registrationNumber: "",
    capacity: "",
    phone: "",
    contactPerson: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    servicesOffered: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Shelter registration data:", formData);
    // TODO: Wire up Supabase insert for organizations
    alert("Thank you! Your organization has been registered.");
    navigate("/");
  };

  return (
    <div>
      <div className="member-container">
        <div className="member-card">
          <h1 className="member-title">STREET AID💙</h1>
          <p className="member-subtitle">Shelter & Organization Registry</p>
          <p className="member-description">
            Share your details so community members can find your services on the STREET AID map.
          </p>

          <form onSubmit={handleSubmit} className="member-form">
            <div className="form-section">
              <h3 className="section-title">Organization Information</h3>

              <div className="form-group">
                <label htmlFor="organizationName">Organization Name *</label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="organizationType">Organization Type *</label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="homeless_shelter">Homeless Shelter</option>
                    <option value="food_bank">Food Bank</option>
                    <option value="community_center">Community Center</option>
                    <option value="nonprofit">Non-Profit Organization</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="registrationNumber">Registration Number</label>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="Business/Charity number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="capacity">Capacity</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Number of people served"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Organization phone"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Contact Person</h3>

              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person Name *</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Primary contact name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Organization email"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Location</h3>

              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Organization address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal code"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Services</h3>

              <div className="form-group">
                <label htmlFor="servicesOffered">Services Offered *</label>
                <textarea
                  id="servicesOffered"
                  name="servicesOffered"
                  value={formData.servicesOffered}
                  onChange={handleChange}
                  placeholder="Describe the services your organization offers..."
                  rows="4"
                  required
                />
              </div>
            </div>

            <button type="submit" className="member-button">
              Register Organization
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Shelter;
