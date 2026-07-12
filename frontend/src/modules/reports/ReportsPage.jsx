import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/api';

export default function ReportsPage({ onShowToast, userRole }) {
  const [activeReport, setActiveReport] = useState('utilization');
  const [utilization, setUtilization] = useState(null);
  const [fuelEff, setFuelEff] = useState([]);
  const [costData, setCostData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Persistent summary KPIs (always visible at top)
  const [summaryKPIs, setSummaryKPIs] = useState({
    avgFuelEfficiency: 0,
    utilizationPct: 0,
    totalOperationalCost: 0,
    avgRoi: 0
  });

  const isFinance = userRole === 'fleet_manager' || userRole === 'financial_analyst';

  // Load all summary KPIs on mount
  useEffect(() => {
    const loadSummary = async () => {
      setSummaryLoading(true);
      try {
        const [uRes, fRes, cRes, rRes] = await Promise.all([
          api.getUtilizationReport(),
          api.getFuelEfficiencyReport(),
          api.getCostReport(),
          api.getRoiReport()
        ]);

        const kpis = { avgFuelEfficiency: 0, utilizationPct: 0, totalOperationalCost: 0, avgRoi: 0 };

        if (uRes.success && uRes.data) {
          kpis.utilizationPct = uRes.data.utilizationPct || 0;
          setUtilization(uRes.data);
        }
        if (fRes.success && fRes.data?.length) {
          kpis.avgFuelEfficiency = (fRes.data.reduce((s, v) => s + v.avgEfficiency, 0) / fRes.data.length).toFixed(1);
          setFuelEff(fRes.data);
        }
        if (cRes.success && cRes.data?.length) {
          kpis.totalOperationalCost = cRes.data.reduce((s, c) => s + c.totalOperationalCost, 0);
          setCostData(cRes.data);
        }
        if (rRes.success && rRes.data?.length) {
          kpis.avgRoi = ((rRes.data.reduce((s, v) => s + v.roi, 0) / rRes.data.length) * 100).toFixed(1);
          setRoiData(rRes.data);
        }

        setSummaryKPIs(kpis);
      } catch (err) { console.error('Summary load error:', err); }
      finally { setSummaryLoading(false); setLoading(false); }
    };
    loadSummary();
  }, [userRole]);

  // Load individual report when tab changes (data may already be cached)
  useEffect(() => {
    const loadReport = async () => {
      if (activeReport === 'utilization' && utilization) return;
      if (activeReport === 'fuel' && fuelEff.length) return;
      if (activeReport === 'cost' && costData.length) return;
      if (activeReport === 'roi' && roiData.length) return;

      setLoading(true);
      try {
        if (activeReport === 'utilization') {
          const res = await api.getUtilizationReport();
          if (res.success) setUtilization(res.data);
        } else if (activeReport === 'fuel') {
          const res = await api.getFuelEfficiencyReport();
          if (res.success) setFuelEff(res.data);
        } else if (activeReport === 'cost') {
          const res = await api.getCostReport();
          if (res.success) setCostData(res.data);
        } else if (activeReport === 'roi') {
          const res = await api.getRoiReport();
          if (res.success) setRoiData(res.data);
        }
      } catch (err) { onShowToast(err.message, 'error'); }
      finally { setLoading(false); }
    };
    loadReport();
  }, [activeReport]);

  const maxCost = costData.length > 0 ? Math.max(...costData.map(c => c.totalOperationalCost)) : 1;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📊 Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Fleet efficiency, operational cost, and ROI insights.</p>
        </div>
        {isFinance && (
          <button className="btn btn-secondary" onClick={() => api.exportCsv()}>📥 Export CSV</button>
        )}
      </div>

      {/* ===== PERSISTENT SUMMARY KPI ROW (matches mockup Section 7) ===== */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ cursor: 'pointer', borderBottom: activeReport === 'fuel' ? '2px solid var(--accent-color)' : 'none' }}
          onClick={() => setActiveReport('fuel')}>
          <div className="kpi-title">FUEL EFFICIENCY</div>
          <div className="kpi-value" style={{ color: 'var(--color-info)' }}>
            {summaryLoading ? '...' : `${summaryKPIs.avgFuelEfficiency} km/l`}
          </div>
        </div>
        <div className="glass-card" style={{ cursor: 'pointer', borderBottom: activeReport === 'utilization' ? '2px solid var(--accent-color)' : 'none' }}
          onClick={() => setActiveReport('utilization')}>
          <div className="kpi-title">FLEET UTILIZATION</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>
            {summaryLoading ? '...' : `${summaryKPIs.utilizationPct}%`}
          </div>
        </div>
        <div className="glass-card" style={{ cursor: 'pointer', borderBottom: activeReport === 'cost' ? '2px solid var(--accent-color)' : 'none' }}
          onClick={() => setActiveReport('cost')}>
          <div className="kpi-title">OPERATIONAL COST</div>
          <div className="kpi-value" style={{ color: 'var(--color-warning)' }}>
            {summaryLoading ? '...' : `₹${summaryKPIs.totalOperationalCost.toLocaleString()}`}
          </div>
        </div>
        <div className="glass-card" style={{ cursor: 'pointer', borderBottom: activeReport === 'roi' ? '2px solid var(--accent-color)' : 'none' }}
          onClick={() => setActiveReport('roi')}>
          <div className="kpi-title">VEHICLE ROI</div>
          <div className="kpi-value" style={{ color: summaryKPIs.avgRoi > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {summaryLoading ? '...' : `${summaryKPIs.avgRoi}%`}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            (Revenue − Costs) / Acquisition
          </div>
        </div>
      </div>

      {/* ===== REPORT TAB BUTTONS ===== */}
      <div className="controls-bar" style={{ flexWrap: 'wrap' }}>
        {['utilization', 'fuel', 'cost', 'roi'].map(r => (
          <button key={r} className={`btn ${activeReport === r ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveReport(r)}>
            {r === 'utilization' ? '🚛 Utilization' : r === 'fuel' ? '⛽ Fuel Efficiency' : r === 'cost' ? '💰 Cost Breakdown' : '📈 ROI Leaderboard'}
          </button>
        ))}
      </div>

      {/* ===== DETAILED REPORT PANELS ===== */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Generating report...</div>
        </div>
      ) : activeReport === 'utilization' && utilization ? (
        <div>
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="glass-card"><div className="kpi-title">Fleet Size</div><div className="kpi-value">{utilization.totalVehicles}</div></div>
            <div className="glass-card"><div className="kpi-title">On Trip</div><div className="kpi-value" style={{ color: 'var(--color-info)' }}>{utilization.onTrip}</div></div>
            <div className="glass-card"><div className="kpi-title">Utilization Rate</div><div className="kpi-value" style={{ color: 'var(--color-success)' }}>{utilization.utilizationPct}%</div></div>
          </div>
          <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Fleet Utilization Gauge</h3>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', height: '32px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: `${utilization.utilizationPct}%`, height: '100%',
                background: `linear-gradient(90deg, var(--accent-color), var(--color-success))`,
                borderRadius: '12px', transition: 'width 1s ease-in-out',
                boxShadow: '0 0 20px rgba(99,102,241,0.3)'
              }} />
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontWeight: 700, fontSize: '0.85rem' }}>
                {utilization.utilizationPct}%
              </span>
            </div>
          </div>
        </div>
      ) : activeReport === 'fuel' ? (
        fuelEff.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}><h3 style={{ color: 'var(--text-secondary)' }}>No fuel data available</h3></div>
        ) : (
          <div>
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Average Fuel Efficiency by Vehicle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {fuelEff.map(v => {
                  const maxEff = Math.max(...fuelEff.map(x => x.avgEfficiency));
                  const pct = maxEff > 0 ? (v.avgEfficiency / maxEff) * 100 : 0;
                  return (
                    <div key={v.vehicleId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 600 }}>{v.regNumber}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{v.avgEfficiency} km/L</span>
                      </div>
                      <div style={{ background: 'var(--bg-tertiary)', borderRadius: '6px', height: '20px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: v.avgEfficiency < 5 ? 'var(--color-danger)' : v.avgEfficiency < 8 ? 'var(--color-warning)' : 'var(--color-success)',
                          borderRadius: '6px', transition: 'width 0.8s ease-in-out'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : activeReport === 'cost' ? (
        costData.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}><h3 style={{ color: 'var(--text-secondary)' }}>No cost data available</h3></div>
        ) : (
          <div className="table-container">
            <table className="custom-table"><thead><tr>
              <th>Vehicle</th><th>Fuel Cost</th><th>Maintenance Cost</th><th>Total</th><th style={{ width: '30%' }}>Breakdown</th>
            </tr></thead><tbody>
              {costData.map(c => (
                <tr key={c.vehicleId}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{c.regNumber}</td>
                  <td>₹{c.fuelCost.toLocaleString()}</td>
                  <td>₹{c.maintenanceCost.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-warning)' }}>₹{c.totalOperationalCost.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', borderRadius: '6px', height: '18px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                      <div style={{ width: `${maxCost > 0 ? (c.fuelCost / maxCost) * 100 : 0}%`, background: 'var(--color-info)', height: '100%' }} title="Fuel" />
                      <div style={{ width: `${maxCost > 0 ? (c.maintenanceCost / maxCost) * 100 : 0}%`, background: 'var(--color-warning)', height: '100%' }} title="Maintenance" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody></table>
          </div>
        )
      ) : activeReport === 'roi' ? (
        roiData.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}><h3 style={{ color: 'var(--text-secondary)' }}>No ROI data available</h3></div>
        ) : (
          <div>
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>🏆 Vehicle Profitability Leaderboard</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {roiData.map((v, i) => (
                  <div key={v.vehicleId} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                    background: 'rgba(31,41,55,0.3)', borderRadius: '10px',
                    borderLeft: `4px solid ${v.roi > 0 ? 'var(--color-success)' : v.roi === 0 ? 'var(--text-muted)' : 'var(--color-danger)'}`
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '2rem', textAlign: 'center' }}>#{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{v.regNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Revenue: ₹{v.revenue.toLocaleString()} | Costs: ₹{(v.fuelCost + v.maintenanceCost).toLocaleString()}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.3rem 0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '1rem',
                      background: v.roi > 0 ? 'var(--color-success-glow)' : 'var(--color-danger-glow)',
                      color: v.roi > 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {(v.roi * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
