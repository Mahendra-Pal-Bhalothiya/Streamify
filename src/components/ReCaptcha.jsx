// frontend/src/components/ReCaptcha.jsx
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

const ReCaptcha = ({ onChange, onExpired, siteKey }) => {
  const handleChange = (token) => {
    console.log("reCAPTCHA token:", token);
    onChange(token);
  };

  const handleExpired = () => {
    console.log("reCAPTCHA expired");
    onExpired?.();
  };

  const handleErrored = () => {
    console.log("reCAPTCHA error");
    onChange(null);
  };

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpired}
        onErrored={handleErrored}
        theme="light"
        size="normal"
      />
    </div>
  );
};

export default ReCaptcha;
