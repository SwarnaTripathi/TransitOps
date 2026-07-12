export default function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-content">
          <div className="loader-spinner" />
          <p className="loader-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <span className="spinner" />
    </div>
  );
}
