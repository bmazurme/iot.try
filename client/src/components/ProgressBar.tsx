import "./ProgressBar.css";

interface ProgressBarProps {
  label?: string;
  percent: number;
}

export function ProgressBar({ label, percent }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="progress">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
      <div className="progress-percent">{Math.round(clamped)}%</div>
    </div>
  );
}
