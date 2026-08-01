import React from 'react';

export function HardwareSection() {
  return (
    <div className="hardware-grid">
      <div className="antenna-section">
        <h3>3×3 Antenna Array</h3>
        <p className="help-text">The React shell renders the hardware overview while preserving the existing UI classes.</p>
        <div className="antenna-array">
          <div className="antenna-grid">
            {['TX1', 'TX2', 'TX3', 'RX1', 'RX2', 'RX3', 'RX4', 'RX5', 'RX6'].map((antenna, index) => (
              <div key={antenna} className={`antenna ${index < 3 ? 'tx' : 'rx'} active`} data-type={antenna} />
            ))}
          </div>
          <div className="antenna-legend">
            <div className="legend-item">
              <div className="legend-color tx" />
              <span>Transmitters (3)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color rx" />
              <span>Receivers (6)</span>
            </div>
          </div>
          <div className="array-status">Configuration ready</div>
        </div>
      </div>

      <div className="config-section">
        <h3>WiFi Configuration</h3>
        <div className="config-grid">
          {[
            ['Frequency', '2.4GHz ± 20MHz'],
            ['Subcarriers', '30'],
            ['Sampling Rate', '100 Hz'],
            ['Total Cost', '$30'],
          ].map(([label, value]) => (
            <div className="config-item" key={label}>
              <label>{label}</label>
              <div className="config-value">{value}</div>
            </div>
          ))}
        </div>

        <div className="csi-data">
          <h4>Real-time CSI Data</h4>
          <div className="csi-display">
            <div className="csi-row">
              <span>Amplitude:</span>
              <div className="csi-bar">
                <div className="csi-fill amplitude" style={{ width: '75%' }} />
              </div>
              <span className="csi-value">0.75</span>
            </div>
            <div className="csi-row">
              <span>Phase:</span>
              <div className="csi-bar">
                <div className="csi-fill phase" style={{ width: '60%' }} />
              </div>
              <span className="csi-value">0.60</span>
            </div>
            <div className="csi-row">
              <span>RSSI:</span>
              <div className="csi-bar">
                <div className="csi-fill rssi" style={{ width: '85%' }} />
              </div>
              <span className="csi-value">-45 dBm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
