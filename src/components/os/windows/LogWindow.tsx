import React from 'react';
import type { LogEntry } from '../types';

interface LogWindowProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const LogWindow: React.FC<LogWindowProps> = ({ logs, onClear }) => {
  return (
    <div className="wbody" style={{ width: 440, maxWidth: '90vw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="dimtxt" style={{ fontSize: 11 }}>
          KERNEL TELEMETRY — {logs.length} EVENTS RECORDED
        </span>
        <button className="k ghost small" onClick={onClear}>
          CLEAR
        </button>
      </div>

      <hr />

      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          lineHeight: 1.8,
          maxHeight: '44vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {logs.length === 0 ? (
          <div className="dimtxt">— NO EVENTS RECORDED —</div>
        ) : (
          logs.map((l) => {
            const colorClass = l.type === 'ok' ? '' : l.type === 'warn' ? 'ambtxt' : 'dimtxt';
            return (
              <div key={l.id} className={colorClass}>
                <span className="dimtxt">[{l.timestamp}]</span> {l.message}
              </div>
            );
          })
        )}
      </div>

      <hr />
      <div className="dimtxt" style={{ fontSize: 10 }}>
        SYS: TAILING LIVE RING BUFFER — STDOUT / STDERR SYNCED.
      </div>
    </div>
  );
};
