import React from 'react';

export default function WatchlistPanel({ drivers }) {
  const today = new Date();

  const calculateRiskScore = (driver) => {
    const expiry = new Date(driver.licenseExpiryDate);
    const diffTime = expiry - today;
    const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let expiryRisk = 0;
    if (daysToExpiry < 0) {
      expiryRisk = 100;
    } else {
      expiryRisk = Math.max(0, 100 - daysToExpiry * 2); // Ramps up within 50 days
    }

    const safetyRisk = 100 - driver.safetyScore;
    
    // Risk formula: 60% weight on license expiry risk + 40% weight on safety risk
    return Math.round(0.6 * expiryRisk + 0.4 * safetyRisk);
  };

  const getDaysToExpiryText = (expiryDateStr) => {
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days === 0) return 'Expires today';
    return `Expires in ${days}d`;
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'watchlist-score-high';
    if (score >= 40) return 'watchlist-score-medium';
    return 'watchlist-score-low';
  };

  const driversWithRisk = drivers
    .map(driver => ({
      ...driver,
      riskScore: calculateRiskScore(driver)
    }))
    // Sort descending by risk score
    .sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="glass-card" style={{ height: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Compliance Watchlist</span>
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Risk scores calculated dynamically based on license expiry proximity (60%) and safety metrics (40%).
      </p>

      {driversWithRisk.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
          No drivers registered yet.
        </div>
      ) : (
        <div className="watchlist-container">
          {driversWithRisk.map(driver => (
            <div key={driver._id} className="watchlist-card">
              <div className="watchlist-info">
                <span className="watchlist-name">{driver.name}</span>
                <span className="watchlist-meta">
                  {driver.licenseNumber} &bull; Safety: {driver.safetyScore}/100
                </span>
                <span className="watchlist-meta" style={{ color: new Date(driver.licenseExpiryDate) < today ? 'var(--color-danger)' : 'var(--text-secondary)', marginTop: '0.15rem', fontWeight: new Date(driver.licenseExpiryDate) < today ? 600 : 400 }}>
                  {getDaysToExpiryText(driver.licenseExpiryDate)}
                </span>
              </div>
              <div className="watchlist-score-container">
                <span className={`watchlist-score-badge ${getScoreClass(driver.riskScore)}`}>
                  Risk: {driver.riskScore}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {driver.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
