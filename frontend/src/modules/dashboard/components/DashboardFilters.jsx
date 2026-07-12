export default function DashboardFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="dashboard-filters">
      <div className="filter-group">
        <label htmlFor="filter-period">Time Period</label>
        <select
          id="filter-period"
          className="form-select"
          value={filters.period || "today"}
          onChange={(e) => handleChange("period", e.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-region">Region</label>
        <select
          id="filter-region"
          className="form-select"
          value={filters.region || "all"}
          onChange={(e) => handleChange("region", e.target.value)}
        >
          <option value="all">All Regions</option>
          <option value="north">North</option>
          <option value="south">South</option>
          <option value="east">East</option>
          <option value="west">West</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-type">Vehicle Type</label>
        <select
          id="filter-type"
          className="form-select"
          value={filters.vehicleType || "all"}
          onChange={(e) => handleChange("vehicleType", e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="van">Van</option>
          <option value="truck">Truck</option>
          <option value="electric">Electric Van</option>
        </select>
      </div>
    </div>
  );
}
