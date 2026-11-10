import React from 'react'
import { IconClose, IconPhone, IconWifi } from './Icons'

export default function ConnectPhoneModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const currentHost = window.location.hostname
  const currentPort = window.location.port || '8080'
  const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="icon-badge">
              <IconPhone size={22} />
            </span>
            <div>
              <h3>Use on Phone & Tablet</h3>
              <p>Access Raj Pipes Billing on any mobile device on your shop Wi-Fi</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="step-card">
            <div className="step-num">1</div>
            <div className="step-info">
              <strong>Connect phone to the same Wi-Fi</strong>
              <p>Make sure your mobile phone and this PC are on the same shop Wi-Fi router or hotspot.</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">2</div>
            <div className="step-info">
              <strong>Find your PC's IP address</strong>
              <p>
                Open PowerShell/Command Prompt on this PC and run: <br />
                <code>ipconfig</code> <br />
                Look for <strong>IPv4 Address</strong> (e.g., <code>192.168.1.15</code>).
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">3</div>
            <div className="step-info">
              <strong>Open browser on your phone</strong>
              <p>
                Type this address in Chrome / Safari on your phone:
              </p>
              <div className="code-box">
                {isLocalhost ? `http://<YOUR-PC-IP>:${currentPort}` : `http://${currentHost}:${currentPort}`}
              </div>
            </div>
          </div>

          <div className="step-card highlight">
            <div className="step-num">★</div>
            <div className="step-info">
              <strong>Pro tip: Add to Mobile Home Screen</strong>
              <p>
                On Android (Chrome): tap <strong>⋮ &gt; Add to Home screen</strong>.<br />
                On iPhone (Safari): tap <strong>Share &gt; Add to Home Screen</strong>.<br />
                It will open full-screen like a native mobile app!
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}
