import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getMemberCredentials } from "../lib/members";
import "../styles/Member.css";

const Member = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    postalCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    agencyName: "",
    roleTitle: "",
    yearsExperience: "",
    credentialType: "",
    credentialId: "",
    verificationLink: "",
    backgroundCheck: "",
    motivation: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [existingCredentials, setExistingCredentials] = useState(null);
  const [userId, setUserId] = useState(null);

  // Check for existing membership on mount and when navigating to the page
  useEffect(() => {
    let isMounted = true;

    const checkExistingMembership = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (user) {
          setUserId(user.id);
          const credentials = await getMemberCredentials(user.id);
          if (isMounted) {
            setExistingCredentials(credentials);
          }
        } else {
          setExistingCredentials(null);
          setUserId(null);
        }
      } catch (error) {
        console.error("Error checking membership:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkExistingMembership();

    // Also listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUserId(session.user.id);
        const credentials = await getMemberCredentials(session.user.id);
        if (isMounted) {
          setExistingCredentials(credentials);
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setExistingCredentials(null);
          setUserId(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        throw new Error("You need to be logged in to request member approval.");
      }

      const payload = {
        user_id: user.id,
        agency_name: formData.agencyName,
        role_title: formData.roleTitle,
        years_experience: Number(formData.yearsExperience) || 0,
        credential_type: formData.credentialType,
        credential_id: formData.credentialId,
        verification_link: formData.verificationLink || null,
        background_check: formData.backgroundCheck,
        motivation: formData.motivation,
        status: "pending",
      };

      const { error } = await supabase.from("member_credentials").insert(payload);
      if (error) throw error;

      setSuccessMessage(
        "Credentials submitted! An admin will review your application and notify you once approved."
      );

      // Navigate to map page after 2 seconds
      setTimeout(() => {
        navigate("/map");
      }, 2000);
    } catch (err) {
      console.error("Member credential submission failed", err);
      setErrorMessage(err.message || "Unable to submit credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "Pending Review", className: "status-pending" },
      approved: { text: "Approved", className: "status-approved" },
      rejected: { text: "Rejected", className: "status-rejected" },
    };
    return badges[status] || badges.pending;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="member-container">
        <div className="member-card">
          <h1 className="member-title">STREET AID💙</h1>
          <p>Loading membership information...</p>
        </div>
      </div>
    );
  }

  // Show existing membership info if user has already applied
  if (existingCredentials) {
    const statusBadge = getStatusBadge(existingCredentials.status);

    return (
      <div>
        <div className="member-container">
          <div className="member-card">
            <h1 className="member-title">STREET AID💙</h1>
            <p className="member-subtitle">Your Membership</p>

            <div className={`membership-status ${statusBadge.className}`}>
              <h3>Status: {statusBadge.text}</h3>
              {existingCredentials.status === "pending" && (
                <p>Your application is under review. You will be notified once it's processed.</p>
              )}
              {existingCredentials.status === "approved" && (
                <p>Congratulations! You have full member access to advanced features.</p>
              )}
              {existingCredentials.status === "rejected" && (
                <p>Your application was not approved. Please contact support for more information.</p>
              )}
            </div>

            <div className="membership-details">
              <h3>Application Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Agency/Organization:</label>
                  <p>{existingCredentials.agency_name}</p>
                </div>
                <div className="detail-item">
                  <label>Role Title:</label>
                  <p>{existingCredentials.role_title}</p>
                </div>
                <div className="detail-item">
                  <label>Years of Experience:</label>
                  <p>{existingCredentials.years_experience}</p>
                </div>
                <div className="detail-item">
                  <label>Credential Type:</label>
                  <p>{existingCredentials.credential_type}</p>
                </div>
                <div className="detail-item">
                  <label>Credential ID:</label>
                  <p>{existingCredentials.credential_id}</p>
                </div>
                {existingCredentials.verification_link && (
                  <div className="detail-item">
                    <label>Verification Link:</label>
                    <a href={existingCredentials.verification_link} target="_blank" rel="noopener noreferrer">
                      View Credential
                    </a>
                  </div>
                )}
                <div className="detail-item">
                  <label>Background Check Status:</label>
                  <p>{existingCredentials.background_check}</p>
                </div>
                <div className="detail-item full-width">
                  <label>Motivation:</label>
                  <p>{existingCredentials.motivation}</p>
                </div>
                <div className="detail-item">
                  <label>Submitted:</label>
                  <p>{new Date(existingCredentials.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <button className="member-button" onClick={() => navigate("/map")}>
              Back to Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-up form for new members
  return (
    <div>
      <div className="member-container">
        <div className="member-card">
          <h1 className="member-title">STREET AID💙</h1>
          <p className="member-subtitle">Member Upgrade</p>
          <p className="member-description">
            Social workers and outreach specialists can request elevated access by sharing their
            credentials. Approved members unlock advanced alert tools and community management
            features.
          </p>

          <form onSubmit={handleSubmit} className="member-form">
            {errorMessage && <p className="form-error">{errorMessage}</p>}
            {successMessage && <p className="form-success">{successMessage}</p>}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
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
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Address</h3>

              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter street address"
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
                    placeholder="Enter city"
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
                    placeholder="Enter postal code"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Emergency Contact</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyContact">Contact Name *</label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Emergency contact name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyPhone">Contact Phone *</label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    placeholder="Emergency contact phone"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Professional Details</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="agencyName">Agency / Organization *</label>
                  <input
                    type="text"
                    id="agencyName"
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleChange}
                    placeholder="e.g., Calgary Outreach Services"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="roleTitle">Role Title *</label>
                  <input
                    type="text"
                    id="roleTitle"
                    name="roleTitle"
                    value={formData.roleTitle}
                    onChange={handleChange}
                    placeholder="e.g., Licensed Social Worker"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="yearsExperience">Years of Experience *</label>
                  <input
                    type="number"
                    min="0"
                    id="yearsExperience"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="credentialType">Credential Type *</label>
                  <select
                    id="credentialType"
                    name="credentialType"
                    value={formData.credentialType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select credential</option>
                    <option value="social_worker_license">Provincial Social Worker License</option>
                    <option value="nurse_license">Registered Nurse License</option>
                    <option value="counsellor_cert">Certified Counsellor</option>
                    <option value="first_responder">First Responder</option>
                    <option value="other">Other Professional Credential</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="credentialId">Credential / License ID *</label>
                  <input
                    type="text"
                    id="credentialId"
                    name="credentialId"
                    value={formData.credentialId}
                    onChange={handleChange}
                    placeholder="License number or certificate ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="verificationLink">Verification Link</label>
                  <input
                    type="url"
                    id="verificationLink"
                    name="verificationLink"
                    value={formData.verificationLink}
                    onChange={handleChange}
                    placeholder="Link to public registry or credential proof"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="backgroundCheck">Background Check Status *</label>
                <select
                  id="backgroundCheck"
                  name="backgroundCheck"
                  value={formData.backgroundCheck}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select status</option>
                  <option value="clear_last12">Clear (within 12 months)</option>
                  <option value="pending">Submitted / Pending</option>
                  <option value="not_completed">Not completed yet</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Motivation & Supporting Info</h3>

              <div className="form-group">
                <label htmlFor="motivation">How will you use STREET AID as a professional? *</label>
                <textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  placeholder="Share the kinds of support you provide and how you plan to assist the community through the platform."
                  rows="4"
                  required
                />
              </div>
            </div>

            <button type="submit" className="member-button" disabled={loading}>
              {loading ? "Submitting..." : "Submit Credentials for Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Member;
