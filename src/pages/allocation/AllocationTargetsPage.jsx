import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Save, Undo2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import TopBar from '../../components/TopBar.jsx';
import TickerStrip from '../../components/TickerStrip.jsx';
import StatusState from '../../components/StatusState.jsx';
import { useAppAction } from '../../context/AppActionContext.jsx';
import { APP_ACTIONS } from '../../services/appActions';
import { getAllocationTargetGroups, getTickerStrip } from '../../data/mock/selectors';
import { ProgressRow } from './AllocationPageShared.jsx';

const tickerStrip = getTickerStrip();
const targetGroups = getAllocationTargetGroups();

function normalizeTargetRows(rows) {
  return rows.map((row) => ({
    ...row,
    target: Number(row.target),
    tolerance: Number(row.tolerance),
    threshold: Number(row.threshold),
  }));
}

export default function AllocationTargetsPage({ activePage, activeSidebarItem, onNavigate, onSidebarSelect }) {
  const { pendingAction, runAction } = useAppAction();
  const [group, setGroup] = useState('Asset Class');
  const [rowsByGroup, setRowsByGroup] = useState(targetGroups);
  const rows = rowsByGroup[group];
  const normalizedRows = useMemo(() => normalizeTargetRows(rows), [rows]);
  const totalTarget = normalizedRows.reduce((sum, row) => sum + row.target, 0);
  const warnings = normalizedRows.filter((row) => Math.abs(row.current - row.target) > row.tolerance);
  const driftRows = normalizedRows.map((row) => ({
    ...row,
    drift: row.current - row.target,
    outOfTolerance: Math.abs(row.current - row.target) > row.tolerance,
    needsReview: Math.abs(row.current - row.target) > row.threshold,
  }));

  const updateRow = (index, field, value) => {
    setRowsByGroup((current) => ({
      ...current,
      [group]: current[group].map((row, rowIndex) => (
        rowIndex === index ? { ...row, [field]: value } : row
      )),
    }));
  };

  const resetGroup = () => {
    setRowsByGroup((current) => ({ ...current, [group]: targetGroups[group] }));
  };

  const saveTargets = () => runAction(APP_ACTIONS.SAVE_ALLOCATION_TARGETS, {
    modelName: `${group} Policy Model`,
    group,
    rows: normalizedRows,
    totalTarget,
  });

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} activeItem={activeSidebarItem} onSelect={onSidebarSelect} />
      <main className="dashboard allocation-page allocation-targets-page">
        <TopBar activePage={activePage} onNavigate={onNavigate} />

        <section className="title-row">
          <h1>Targets</h1>
          <div className="market-brief"><span></span><b>Allocation</b><p>Target weights, tolerance bands, and drift policy</p></div>
          <TickerStrip items={tickerStrip} />
        </section>

        <section className="allocation-target-toolbar card">
          <div className="target-group-tabs">
            {Object.keys(targetGroups).map((item) => (
              <button className={group === item ? 'active' : ''} key={item} onClick={() => setGroup(item)} type="button">
                {item}
              </button>
            ))}
          </div>
          <div className="target-toolbar-actions">
            <button onClick={resetGroup} type="button"><Undo2 size={16} />Reset</button>
            <button disabled={pendingAction === APP_ACTIONS.SAVE_ALLOCATION_TARGETS} onClick={saveTargets} type="button"><Save size={16} />Save Model</button>
          </div>
        </section>

        <section className="allocation-target-summary-grid">
          <article className="card target-summary-card">
            <span>Total target</span>
            <strong className={Math.abs(totalTarget - 100) > 0.01 ? 'red' : ''}>{totalTarget.toFixed(1)}%</strong>
            <small>{Math.abs(totalTarget - 100) > 0.01 ? 'Target model should total 100%' : 'Policy model is balanced'}</small>
          </article>
          <article className="card target-summary-card">
            <span>Out of tolerance</span>
            <strong>{warnings.length}</strong>
            <small>Rows outside policy bands</small>
          </article>
          <article className="card target-summary-card">
            <span>Largest drift</span>
            <strong>{driftRows.reduce((max, row) => Math.abs(row.drift) > Math.abs(max.drift) ? row : max, driftRows[0]).name}</strong>
            <small>{driftRows.reduce((max, row) => Math.abs(row.drift) > Math.abs(max.drift) ? row : max, driftRows[0]).drift.toFixed(1)} pts from target</small>
          </article>
          <article className="card target-summary-card">
            <span>Model scope</span>
            <strong>{group}</strong>
            <small>{rows.length} editable policy rows</small>
          </article>
        </section>

        <section className="allocation-targets-grid">
          <article className="card target-editor-card">
            <div className="allocation-card-head">
              <h3>Policy Allocation Editor</h3>
              <div><span className="dot green-dot-solid" />Current <span className="dot gray-dot-solid" />Target</div>
            </div>
            <div className="target-editor-table">
              <div className="target-editor-head"><span>Name</span><span>Current</span><span>Target</span><span>Tolerance</span><span>Drift threshold</span><span>Status</span></div>
              {driftRows.map((row, index) => (
                <div className="target-editor-row" key={row.name}>
                  <span><i style={{ background: row.color }} />{row.name}</span>
                  <strong>{row.current.toFixed(1)}%</strong>
                  <label><input min="0" max="100" onChange={(event) => updateRow(index, 'target', event.target.value)} step="0.5" type="number" value={rows[index].target} /><b>%</b></label>
                  <label><input min="0" max="25" onChange={(event) => updateRow(index, 'tolerance', event.target.value)} step="0.5" type="number" value={rows[index].tolerance} /><b>pts</b></label>
                  <label><input min="0" max="25" onChange={(event) => updateRow(index, 'threshold', event.target.value)} step="0.5" type="number" value={rows[index].threshold} /><b>pts</b></label>
                  <em className={row.outOfTolerance ? 'red' : row.needsReview ? 'orange' : 'green'}>
                    {row.outOfTolerance ? 'Outside band' : row.needsReview ? 'Review drift' : 'In range'}
                  </em>
                </div>
              ))}
            </div>
          </article>

          <article className="card target-drift-card">
            <div className="allocation-card-head">
              <h3>Current vs Target Drift</h3>
              <Target size={22} />
            </div>
            <div className="target-drift-list">
              {driftRows.map((row) => (
                <div className="target-drift-row" key={row.name}>
                  <div><span>{row.name}</span><small>{row.current.toFixed(1)}% current / {row.target.toFixed(1)}% target</small></div>
                  <div className="target-drift-track">
                    <i style={{ width: `${Math.min(100, row.current)}%`, background: row.color }} />
                    <b style={{ left: `${Math.min(100, row.target)}%` }} />
                  </div>
                  <strong className={row.drift > 0 ? 'red' : row.drift < 0 ? 'green' : ''}>{row.drift > 0 ? '+' : ''}{row.drift.toFixed(1)} pts</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="allocation-warning-grid">
          <article className="card target-warning-card">
            <div className="allocation-card-head">
              <h3>Out-of-Tolerance Warnings</h3>
              <AlertTriangle size={22} />
            </div>
            {warnings.length > 0 ? warnings.map((row) => (
              <div className="target-warning-row" key={row.name}>
                <span>{row.name}</span>
                <b>{Math.abs(row.current - row.target).toFixed(1)} pts drift</b>
                <small>Tolerance band: +/-{row.tolerance.toFixed(1)} pts</small>
              </div>
            )) : <StatusState title="All rows within tolerance" message="No allocation policy row is currently outside its tolerance band." />}
          </article>

          <article className="card target-policy-card">
            <h3>Policy Allocation Table</h3>
            <div className="target-policy-table">
              {driftRows.map((row) => (
                <div key={row.name}>
                  <span>{row.name}</span>
                  <strong>{row.target.toFixed(1)}%</strong>
                  <small>Band {(row.target - row.tolerance).toFixed(1)}% - {(row.target + row.tolerance).toFixed(1)}%</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function money(value) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}


