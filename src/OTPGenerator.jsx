import React, { useState, useEffect } from 'react';
import './OTPGenerator.css';

const OTPGenerator = () => {
  // ===== STATE MANAGEMENT =====
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [inputOTP, setInputOTP] = useState('');
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [attempts, setAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState('mobile'); // 'mobile' or 'email'
  const [sentTo, setSentTo] = useState('');

  // ===== CONFIGURATION =====
  const OTP_LENGTH = 6;
  const TIMER_DURATION = 60; // seconds
  const MAX_ATTEMPTS = 3;

  // ===== TIMER EFFECT =====
  useEffect(() => {
    let interval;

    if (timer > 0 && otpSent && !otpVerified) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && otpSent && !otpVerified) {
      // Timer ended
      setOtpSent(false);
      setInputOTP('');
      setMessage('OTP expired. Click "Send OTP" to send a new one.');
      setMessageType('error');
    }

    return () => clearInterval(interval);
  }, [timer, otpSent, otpVerified]);

  // ===== GENERATE OTP LOGIC =====
  const generateOTP = () => {
    // Generate random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  };

  // ===== VALIDATE PHONE NUMBER =====
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  // ===== VALIDATE EMAIL =====
  const validateEmail = (mail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mail);
  };

  // ===== SEND OTP HANDLER =====
  const handleSendOTP = () => {
    if (isBlocked) {
      setMessage('Too many failed attempts. Try again later.');
      setMessageType('error');
      return;
    }

    // Validate contact method
    if (contactMethod === 'mobile') {
      if (!phoneNumber.trim()) {
        setMessage('Please enter your phone number.');
        setMessageType('error');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        setMessage('Please enter a valid 10-digit phone number.');
        setMessageType('error');
        return;
      }
    } else if (contactMethod === 'email') {
      if (!email.trim()) {
        setMessage('Please enter your email address.');
        setMessageType('error');
        return;
      }
      if (!validateEmail(email)) {
        setMessage('Please enter a valid email address.');
        setMessageType('error');
        return;
      }
    }

    // Generate OTP
    const newOTP = generateOTP();
    setGeneratedOTP(newOTP);
    setOtpSent(true);
    setInputOTP('');
    setTimer(TIMER_DURATION);
    setAttempts(3); // Reset attempts
    const target = contactMethod === 'mobile' ? phoneNumber : email;
    setSentTo(target);
    setMessage(
      `OTP sent to ${
        contactMethod === 'mobile' ? '📱' : '📧'
      } ${target}! Code: ${newOTP}`
    ); // Demo: show OTP
    setMessageType('info');
  };

  // ===== VALIDATE OTP INPUT =====
  const handleInputChange = (e) => {
    const value = e.target.value;

    // Allow only numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Limit to OTP_LENGTH digits
    if (value.length <= OTP_LENGTH) {
      setInputOTP(value);
    }
  };

  // ===== VERIFY OTP HANDLER =====
  const handleVerifyOTP = () => {
    // Check empty
    if (!inputOTP.trim()) {
      setMessage('Please enter the OTP.');
      setMessageType('error');
      return;
    }

    // Check length
    if (inputOTP.length < OTP_LENGTH) {
      setMessage(`OTP must be ${OTP_LENGTH} digits.`);
      setMessageType('error');
      return;
    }

    // Compare OTP
    if (inputOTP === generatedOTP) {
      setMessage('✅ OTP Verified Successfully!');
      setMessageType('success');
      setOtpVerified(true);
      setOtpSent(false);
      setTimer(0);
      setInputOTP('');
    } else {
      // Wrong OTP
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      setInputOTP('');
      setPhoneNumber('');
      setEmail('');
      setContactMethod('mobile');
      setSentTo('');

      if (newAttempts === 0) {
        // Block user
        setIsBlocked(true);
        setMessage('❌ Max attempts reached. Account blocked for 5 minutes.');
        setMessageType('error');
        setOtpSent(false);

        // Unblock after 5 minutes (demo: 5 seconds)
        setTimeout(() => {
          setIsBlocked(false);
          setAttempts(3);
          setMessage('');
          setGeneratedOTP('');
        }, 5000); // Change to 300000 for 5 minutes in production
      } else {
        setMessage(`❌ Wrong OTP. ${newAttempts} attempt(s) remaining.`);
        setMessageType('error');
      }
    }
  };

  // ===== RESEND OTP HANDLER =====
  const handleResendOTP = () => {
    if (timer === 0 && otpSent) {
      handleSendOTP();
    }
  };

  // ===== RESET ALL =====
  const handleReset = () => {
    setGeneratedOTP('');
    setInputOTP('');
    setTimer(0);
    setOtpSent(false);
    setMessage('');
    setOtpVerified(false);
    setAttempts(3);
    setIsBlocked(false);
    setPhoneNumber('');
    setEmail('');
    setContactMethod('mobile');
    setSentTo('');
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h1>🔐 OTP Verification</h1>

        {/* Message Display */}
        {message && <div className={`message ${messageType}`}>{message}</div>}

        {/* OTP Sent & Not Verified */}
        {otpSent && !otpVerified && (
          <>
            {/* OTP Input Field */}
            <div className="input-group">
              <label htmlFor="otp-input">Enter OTP:</label>
              <input
                id="otp-input"
                type="text"
                placeholder="000000"
                value={inputOTP}
                onChange={handleInputChange}
                maxLength={OTP_LENGTH}
                disabled={isBlocked || timer === 0}
                className="otp-input"
              />
              <span className="char-count">
                {inputOTP.length}/{OTP_LENGTH}
              </span>
            </div>

            {/* Timer Display */}
            <div className={`timer ${timer <= 10 ? 'warning' : ''}`}>
              {timer > 0 ? (
                <>
                  ⏱️ Time remaining: <strong>{timer}s</strong>
                </>
              ) : (
                '⏰ OTP Expired'
              )}
            </div>

            {/* Contact Method Toggle */}
            {!otpVerified && (
              <div className="contact-method-toggle">
                <button
                  className={`toggle-btn ${
                    contactMethod === 'mobile' ? 'active' : ''
                  }`}
                  onClick={() => {
                    setContactMethod('mobile');
                    setMessage('');
                  }}
                >
                  📱 Mobile
                </button>
                <button
                  className={`toggle-btn ${
                    contactMethod === 'email' ? 'active' : ''
                  }`}
                  onClick={() => {
                    setContactMethod('email');
                    setMessage('');
                  }}
                >
                  📧 Email
                </button>
              </div>
            )}

            {/* Phone Number Input */}
            {!otpVerified && contactMethod === 'mobile' && (
              <div className="input-group">
                <label htmlFor="phone">Phone Number:</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="phone-input"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\ ''D/g,);
                    if (value.length <= 10) {
                      setPhoneNumber(value);
                    }
                  }}
                  maxLength="10"
                />
                <span className="char-count">{phoneNumber.length}/10</span>
              </div>
            )}

            {/* Email Input */}
            {!otpVerified && contactMethod === 'email' && (
              <div className="input-group">
                <label htmlFor="email">Email Address:</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="phone-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="button-group">
              <button
                onClick={handleVerifyOTP}
                disabled={
                  isBlocked || timer === 0 || inputOTP.length < OTP_LENGTH
                }
                className="btn btn-primary"
              >
                Verify OTP
              </button>
              <button
                onClick={handleResendOTP}
                disabled={timer > 0 || isBlocked}
                className="btn btn-secondary"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* Initial State or Success State */}
        {(!otpSent || otpVerified) && !isBlocked && (
          <>
            <div className="info-text">
              {otpVerified
                ? '✅ Your account is verified!'
                : 'Choose how to receive OTP'}
            </div>

            {/* Contact Method Toggle */}
            {!otpVerified && (
              <div className="contact-method-toggle">
                <button
                  className={`toggle-btn ${
                    contactMethod === 'mobile' ? 'active' : ''
                  }`}
                  onClick={() => {
                    setContactMethod('mobile');
                    setMessage('');
                  }}
                >
                  📱 Mobile
                </button>
                <button
                  className={`toggle-btn ${
                    contactMethod === 'email' ? 'active' : ''
                  }`}
                  onClick={() => {
                    setContactMethod('email');
                    setMessage('');
                  }}
                >
                  📧 Email
                </button>
              </div>
            )}

            {/* Phone Number Input */}
            {!otpVerified && contactMethod === 'mobile' && (
              <div className="input-group">
                <label htmlFor="phone">Phone Number:</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="phone-input"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setPhoneNumber(value);
                    }
                  }}
                  maxLength="10"
                />
                <span className="char-count">{phoneNumber.length}/10</span>
              </div>
            )}

            {/* Email Input */}
            {!otpVerified && contactMethod === 'email' && (
              <div className="input-group">
                <label htmlFor="email">Email Address:</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="phone-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {/* Send OTP Button */}
            <button
              onClick={handleSendOTP}
              disabled={otpVerified}
              className="btn btn-primary btn-full"
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </>
        )}

        {/* Reset Button (Always visible) */}
        {(otpSent || otpVerified || isBlocked) && (
          <button onClick={handleReset} className="btn btn-outline btn-full">
            Start Over
          </button>
        )}
      </div>
    </div>
  );
};

export default OTPGenerator;
