'use client'

import React, { useState } from 'react'
import { Activity, AlertTriangle, BarChart3, Bell, CheckCircle2, ChevronDown, CircleHelp, Clock3, CloudUpload, Code2, Download, FileCheck2, FileCode2, FileText, Filter, FolderGit2, Gauge, GitBranch, LayoutDashboard, Menu, MoreHorizontal, Play, Plus, RefreshCw, Search, Settings, Shield, ShieldCheck, SlidersHorizontal, Upload, UserRound, X, Zap } from 'lucide-react'
import './globals.css'
import { api } from '../services/api'
const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'scans', label: 'Application Scans', icon: FolderGit2 },
  { id: 'findings', label: 'Findings', icon: AlertTriangle },
  { id: 'verification', label: 'Fix Verification', icon: FileCheck2 },
  { id: 'runtime', label: 'Runtime Protection', icon: Activity },
  { id: 'history', label: 'Scan History', icon: Clock3 },
  { id: 'reports', label: 'Reports', icon: FileText },
]
const findings = [
  { title: 'SQL query built with user input', category: 'Injection', severity: 'Critical', confidence: 'High', file: 'api/users.py', line: 42, scanner: 'Semgrep', status: 'Open', rule: 'ZG-INJ-001' },
  { title: 'Missing authentication on admin route', category: 'Auth & access', severity: 'High', confidence: 'High', file: 'routes/admin.ts', line: 18, scanner: 'CodeQL', status: 'Open', rule: 'ZG-AUTH-014' },
  { title: 'Weak password hashing algorithm', category: 'Cryptography', severity: 'High', confidence: 'Medium', file: 'auth/passwords.py', line: 76, scanner: 'Bandit', status: 'In review', rule: 'ZG-CRY-008' },
  { title: 'Dependency with known CVE', category: 'Dependencies', severity: 'Medium', confidence: 'High', file: 'requirements.txt', line: 12, scanner: 'OSV-Scanner', status: 'Open', rule: 'ZG-DEP-022' },
  { title: 'Debug mode enabled in config', category: 'Configuration', severity: 'Low', confidence: 'High', file: 'config/settings.py', line: 9, scanner: 'Semgrep', status: 'Resolved', rule: 'ZG-CON-003' },
]
const runtimeEvents = [
  { time: '09:42:18', type: 'Brute force threshold', severity: 'High', reason: '12 failed logins from same client in 60 seconds', endpoint: '/auth/login', action: 'Rate limited', outcome: 'Applied' },
  { time: '09:39:04', type: 'Normal request', severity: 'Info', reason: 'Authenticated request within expected baseline', endpoint: '/api/profile', action: 'Allowed', outcome: 'Completed' },
  { time: '09:34:51', type: 'Suspicious payload', severity: 'Medium', reason: 'Encoded SQL meta-characters in query parameter', endpoint: '/api/search', action: 'Logged', outcome: 'Recorded' },
]
const scans = [
  { id: 'scan_8f3a21', project: 'payments-api', started: 'Today, 09:18', duration: '2m 48s', files: 248, findings: 12, status: 'Completed', verification: 'Needs review' },
  { id: 'scan_7c91be', project: 'payments-api', started: 'Yesterday, 16:42', duration: '2m 31s', files: 245, findings: 14, status: 'Completed', verification: '2 verified' },
  { id: 'scan_6d22aa', project: 'web-portal', started: 'Oct 24, 11:07', duration: '4m 12s', files: 612, findings: 8, status: 'Completed', verification: 'Not retested' },
]
function Badge({ children, tone = 'muted' }) { return <span className={`badge ${tone}`}>{children}</span> }
function Card({ children, className = '' }) { return <section className={`card ${className}`}>{children}</section> }
function PageHeader({ eyebrow, title, description, action }) { return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div> }
function Stat({ icon: Icon, label, value, detail, tone = 'blue' }) { return <Card className="stat"><div className={`stat-icon ${tone}`}><Icon /></div><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div></Card> }
function normalizeFinding(f, index, filename = 'Uploaded source') {
  const meta = f?.metadata || {}
  const start = f?.start || {}
  const rawSeverity = String(f?.severity || meta.severity || 'medium').toLowerCase()
  const severity = rawSeverity.includes('critical') ? 'Critical' : rawSeverity.includes('high') || rawSeverity === 'error' ? 'High' : rawSeverity.includes('low') || rawSeverity === 'info' ? 'Low' : 'Medium'
  return {
    id: `${f?.rule_id || f?.check_id || f?.rule || 'finding'}-${index}`,
    title: f?.message || meta.message || f?.title || f?.rule_id || f?.check_id || 'Potential issue detected',
    category: f?.category || meta.category || 'Static analysis',
    severity,
    confidence: f?.confidence || meta.confidence || 'Not provided',
    file: f?.path || f?.file || filename,
    line: start.line ?? f?.start_line ?? f?.line ?? '—',
    scanner: f?.scanner || 'Semgrep',
    status: 'Open',
    rule: f?.rule_id || f?.check_id || f?.rule || `finding-${index + 1}`,
    message: f?.message || meta.message || '',
    raw: f,
  }
}

function getScanFindings(scan) {
  const raw = scan?.result?.static_analysis?.findings || scan?.static_analysis?.findings || []
  return raw.map((finding, index) => normalizeFinding(finding, index, scan?.filename || 'Uploaded source'))
}

function saveJsonDownload(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function Overview({ setPage, scanHistory, latestScan }) {
  const allFindings = scanHistory.flatMap(scan => getScanFindings(scan))
  const recentFindings = allFindings.slice(0, 5)
  const flaggedScans = scanHistory.filter(scan => scan.result?.ml_analysis?.model_flagged).length
  const semgrepFailures = scanHistory.filter(scan => scan.result?.static_analysis?.status === 'failed').length
  return <><PageHeader eyebrow="SECURITY POSTURE / OVERVIEW" title="ZeroGuard AI dashboard" description="Live summary from scans completed in this browser." action={<button className="button primary" onClick={() => setPage('scans')}><Plus /> New scan</button>} />
    {!scanHistory.length && <div className="notice"><CircleHelp /><span>No scan data yet. Upload a C/C++ source file in Application Scans to populate this dashboard.</span><button className="text-button" onClick={()=>setPage('scans')}>Start scan →</button></div>}
    <div className="stats-grid"><Stat icon={BarChart3} label="Completed scans" value={scanHistory.length} detail="Saved in this browser"/><Stat icon={AlertTriangle} label="Semgrep findings" value={allFindings.length} detail="Across saved scan results" tone="amber"/><Stat icon={Gauge} label="ML-flagged scans" value={flaggedScans} detail="Experimental model signal" tone="red"/><Stat icon={Activity} label="Semgrep scan errors" value={semgrepFailures} detail="Scans needing review" tone="blue"/></div>
    <div className="grid-two"><Card><div className="card-title"><div><h2>Latest scan</h2><p>{latestScan ? `${latestScan.filename} · ${new Date(latestScan.timestamp).toLocaleString()}` : 'No completed scan yet'}</p></div><Badge tone={latestScan?'green':'muted'}>{latestScan?'Completed':'Waiting'}</Badge></div>{latestScan ? <><div className="runtime-mini"><div><span>ML risk score</span><strong>{latestScan.result?.ml_analysis?.risk_score ?? '—'}%</strong></div><div><span>Semgrep findings</span><strong>{getScanFindings(latestScan).length}</strong></div><div><span>Static analysis</span><strong>{latestScan.result?.static_analysis?.status || 'Unknown'}</strong></div></div><p className="muted">{latestScan.result?.ml_analysis?.warning || 'ML output is an experimental prediction.'}</p><button className="button secondary full" onClick={()=>setPage('scans')}>View scan results <ArrowIcon /></button></> : <button className="button primary" onClick={()=>setPage('scans')}>Run first scan <ArrowIcon /></button>}</Card>
    <Card><div className="card-title"><div><h2>Scan activity</h2><p>Most recent saved scans</p></div><Badge tone="info">Local history</Badge></div>{scanHistory.length ? <div className="finding-list">{scanHistory.slice(0,5).map(scan=><div className="finding-row" key={scan.id}><div className="severity-mark blue"></div><div className="finding-main"><strong>{scan.filename}</strong><span>{new Date(scan.timestamp).toLocaleString()} · {getScanFindings(scan).length} findings</span></div><Badge tone="green">Completed</Badge></div>)}</div> : <p className="muted">Completed scans will appear here.</p>}<button className="button secondary full" onClick={()=>setPage('history')}>Open scan history <ArrowIcon /></button></Card></div>
    <Card><div className="card-title"><div><h2>Recent findings</h2><p>From actual Semgrep results</p></div><button className="text-button" onClick={()=>setPage('findings')}>View all →</button></div>{recentFindings.length ? <div className="finding-list">{recentFindings.map((f,i)=><div className="finding-row" key={`${f.id}-${i}`}><div className={`severity-mark ${f.severity.toLowerCase()}`}></div><div className="finding-main"><strong>{f.title}</strong><span>{f.file}:{f.line} · {f.scanner}</span></div><Badge tone={f.severity.toLowerCase()}>{f.severity}</Badge></div>)}</div> : <p className="muted">No Semgrep findings in saved scans yet. If a scan has zero findings, check its static-analysis status.</p>}</Card>
  </>
}
function Scans({ setPage, onScanComplete, latestScan }) {
  const [file, setFile] = useState(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function startScan() {
    if (!file || running) return
    const allowedExtensions = ['.c', '.h', '.cc', '.cpp', '.cxx', '.hpp']
    const lowerName = file.name.toLowerCase()
    if (!allowedExtensions.some(ext => lowerName.endsWith(ext))) {
      setError('Choose a C/C++ source file (.c, .h, .cc, .cpp, .cxx, .hpp). ZIP files are not supported.')
      return
    }
    if (file.size > 1024 * 1024) {
      setError('The file is larger than the backend limit of 1 MB.')
      return
    }
    setRunning(true); setResult(null); setError('')
    const startedAt = Date.now()
    try {
      const data = await api.analyzeFile(file)
      setResult(data)
      onScanComplete?.({
        id: `scan_${startedAt.toString(36)}`,
        filename: file.name,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        result: data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed. Check that the backend is running.')
    } finally { setRunning(false) }
  }

  const findings = result ? (result.static_analysis?.findings || []).map((f, i) => normalizeFinding(f, i, file?.name)) : []
  const suggestions = result?.fix_suggestions
  return <>
    <PageHeader eyebrow="APPLICATION SECURITY" title="Application Security Scans" description="Upload C/C++ source code to run the connected ML and Semgrep analysis." action={<Badge tone="info">Live backend</Badge>} />
    <div className="scan-grid">
      <Card className="upload-card">
        <div className="card-title"><div><h2>Upload source code</h2><p>C/C++ source files only · maximum 1 MB</p></div><Badge tone="info">Backend analysis</Badge></div>
        <label className="dropzone"><input type="file" accept=".c,.h,.cc,.cpp,.cxx,.hpp" onChange={e => { setFile(e.target.files?.[0] || null); setResult(null); setError('') }} /><Upload /><strong>{file ? file.name : 'Choose a source file'}</strong><span>{file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Click to browse C/C++ source files'}</span></label>
        {file && <div className="file-chip"><FileCode2 /><span>{file.name}</span><button onClick={() => { setFile(null); setResult(null); setError('') }} aria-label="Remove file"><X /></button></div>}
        {running && <div className="progress-box"><div className="progress-head"><span>Analyzing with backend...</span><strong>In progress</strong></div><div className="progress"><i style={{ width: '100%' }} /></div><span className="muted">Waiting for ML and static-analysis response.</span></div>}
        {error && <div className="notice"><AlertTriangle /><span>{error}</span></div>}
        <div className="scan-actions"><button className="button secondary" onClick={() => { setFile(null); setResult(null); setError('') }} disabled={running || !file}>Cancel</button><button className="button primary" onClick={startScan} disabled={!file || running}><Play /> {running ? 'Scanning...' : 'Start scan'}</button></div>
      </Card>
      <Card><div className="card-title"><div><h2>What scanning covers</h2><p>Checks configured in the backend</p></div></div><div className="coverage"><div><CheckCircle2 /><span>ML-based code analysis</span></div><div><CheckCircle2 /><span>Static analysis with Semgrep, when available</span></div><div><CheckCircle2 /><span>Potential vulnerability findings</span></div><div><CheckCircle2 /><span>Suggested fixes returned by backend</span></div></div><div className="notice"><CircleHelp /><span>ML scores are experimental predictions. A clean scan does not guarantee the application is completely secure.</span></div></Card>
    </div>
    {result && <div className="scan-results">
      <Card className="scan-summary"><div className="card-title"><div><h2>Scan results · {file?.name}</h2><p>Completed {new Date().toLocaleString()}</p></div><Badge tone="green">Completed</Badge></div>
        <div className="stats-grid"><Stat icon={Gauge} label="ML risk score" value={`${result.ml_analysis?.risk_score ?? result.summary?.ml_risk_score ?? '—'}%`} detail={result.ml_analysis?.model_flagged ? 'Model flagged this code' : 'Model did not flag this code'} tone="amber"/><Stat icon={AlertTriangle} label="Semgrep findings" value={result.static_analysis?.finding_count ?? findings.length} detail={result.static_analysis?.status || 'Status unavailable'} tone="red"/><Stat icon={ShieldCheck} label="Fix suggestions" value={Array.isArray(suggestions) ? suggestions.length : suggestions ? 1 : 0} detail="Returned by backend" tone="green"/></div>
        <p className="muted">{result.ml_analysis?.warning || 'ML score is a model estimate, not proof of a vulnerability.'}</p>
        {result.static_analysis?.status === 'failed' && <div className="notice"><AlertTriangle /><span>Semgrep failed: {result.static_analysis?.error || 'No error details returned'}</span></div>}
        <div className="card-title"><div><h2>Detected findings</h2><p>These rows come from the actual Semgrep response.</p></div><Badge tone="info">{findings.length} findings</Badge></div>
        {findings.length ? <div className="table-wrap"><table><thead><tr><th>Finding</th><th>Severity</th><th>Location</th><th>Rule</th></tr></thead><tbody>{findings.map(f=><tr key={f.id}><td><strong>{f.title}</strong><span className="sub">{f.category}</span></td><td><Badge tone={f.severity.toLowerCase()}>{f.severity}</Badge></td><td className="mono">{f.file}:{f.line}</td><td className="mono">{f.rule}</td></tr>)}</tbody></table></div> : <p className="muted">No Semgrep findings were returned. Check the Semgrep status above; zero findings is not a guarantee of security.</p>}
        <div className="card-title"><div><h2>Fix remedies</h2><p>Suggestions returned by `generate_suggestions()`.</p></div></div>
        {suggestions && (Array.isArray(suggestions) ? suggestions.length > 0 : Object.keys(suggestions).length > 0) ? <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:13,padding:16,background:'var(--surface-secondary, #f5f5f5)',borderRadius:8}}>{JSON.stringify(suggestions,null,2)}</pre> : <p className="muted">No fix suggestions were returned for this scan.</p>}
        <div className="scan-actions"><button className="button secondary" onClick={()=>saveJsonDownload(result, `zeroguard-${file?.name || 'scan'}-results.json`)}><Download /> Export results</button><button className="button primary" onClick={()=>setPage('findings')}>Open Findings <ArrowIcon /></button><button className="button secondary" onClick={()=>setPage('verification')}>Verify a fix <ArrowIcon /></button></div>
      </Card>
    </div>}
  </>
}
function ArrowIcon(){return <span>→</span>}
function Findings({ scanHistory, latestScan, setPage }) {
  const [q,setQ]=useState(''); const [selected,setSelected]=useState<any>(null)
  const allFindings = scanHistory.flatMap(scan => getScanFindings(scan).map(f => ({...f, scanId: scan.id, scanFilename: scan.filename, fixSuggestions: scan.result?.fix_suggestions})))
  const filtered = allFindings.filter(f => `${f.title} ${f.file} ${f.rule} ${f.severity}`.toLowerCase().includes(q.toLowerCase()))
  return <><PageHeader eyebrow="APPLICATION SECURITY" title="Findings" description="Review actual potential issues returned by your completed scans." action={<button className="button secondary" onClick={()=>saveJsonDownload(allFindings,'zeroguard-findings.json')}><Download /> Export JSON</button>} /><div className="toolbar"><div className="search"><Search /><input placeholder="Search title, file, or rule ID" value={q} onChange={e=>setQ(e.target.value)}/></div></div><Card className="table-card"><div className="table-meta"><span>Showing {filtered.length} findings from {scanHistory.length} saved scans</span><Badge tone="info">Live scan data</Badge></div>{filtered.length ? <div className="table-wrap"><table><thead><tr><th>Finding</th><th>Severity</th><th>Confidence</th><th>Affected file</th><th>Scanner</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(f=><tr key={`${f.scanId}-${f.id}`} onClick={()=>setSelected(f)} style={{cursor:'pointer'}}><td><strong>{f.title}</strong><span className="sub">{f.category} · {f.rule}</span></td><td><Badge tone={f.severity.toLowerCase()}>{f.severity}</Badge></td><td>{f.confidence}</td><td className="mono">{f.file}:{f.line}</td><td>{f.scanner}</td><td><Badge tone="muted">Open</Badge></td><td><MoreHorizontal /></td></tr>)}</tbody></table></div> : <div className="empty-state" style={{padding:24}}><h3>No saved findings yet</h3><p>Run a C/C++ scan first. Findings will appear here when Semgrep returns them.</p><button className="button primary" onClick={()=>setPage('scans')}>Start a scan</button></div>}</Card>{selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><Badge tone={selected.severity.toLowerCase()}>{selected.severity}</Badge><h2>{selected.title}</h2><p>{selected.file}:{selected.line} · {selected.scanner} · {selected.rule}</p></div><button className="icon-button" onClick={()=>setSelected(null)}><X /></button></div><div className="detail-grid"><div><h3>Finding details</h3><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(selected.raw,null,2)}</pre></div><div><h3>Backend fix suggestions</h3>{selected.fixSuggestions ? <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(selected.fixSuggestions,null,2)}</pre> : <p>No fix suggestions were returned for this scan.</p>}</div></div><div className="modal-actions"><button className="button secondary" onClick={()=>setSelected(null)}>Close</button><button className="button primary" onClick={()=>{setSelected(null);setPage('verification')}}>Retest code <ArrowIcon /></button></div></div></div>}</>
}
function Verification({ latestScan }) {
  const [originalCode,setOriginalCode]=useState('')
  const [patchedCode,setPatchedCode]=useState('')
  const [result,setResult]=useState<any>(null)
  const [error,setError]=useState('')
  const [running,setRunning]=useState(false)
  async function runRetest() {
    if (!originalCode.trim() || !patchedCode.trim()) { setError('Paste both the original and patched C/C++ code.'); return }
    setRunning(true); setError(''); setResult(null)
    try { setResult(await api.retest(originalCode,patchedCode)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Retest failed.') }
    finally { setRunning(false) }
  }
  return <><PageHeader eyebrow="CORE WORKFLOW" title="Fix Verification" description="Compare the original and patched code using the backend Semgrep retest endpoint." action={<Badge tone="info">Live retest</Badge>} /><div className="verification-grid"><Card><div className="card-title"><div><h2>Original code</h2><p>Paste the vulnerable version you want to compare.</p></div></div><textarea className="text-input" rows={12} value={originalCode} onChange={e=>setOriginalCode(e.target.value)} placeholder="Paste original C/C++ source here" style={{width:'100%',fontFamily:'monospace'}}/><label className="field-label">Patched code</label><textarea className="text-input" rows={12} value={patchedCode} onChange={e=>setPatchedCode(e.target.value)} placeholder="Paste the proposed fixed version here" style={{width:'100%',fontFamily:'monospace'}}/><div className="notice"><CircleHelp /><span>Only paste code you are authorized to test. Retest compares Semgrep findings; it does not run the program or prove all behavior safe.</span></div><button className="button primary full" disabled={running} onClick={runRetest}><RefreshCw /> {running?'Running retest...':'Run backend retest'}</button>{error && <div className="notice"><AlertTriangle /><span>{error}</span></div>}</Card><Card><div className="card-title"><div><h2>Retest result</h2><p>Real response from `/api/retest`.</p></div></div>{!result ? <div className="empty-state" style={{padding:20}}><FileCheck2 /><h3>No retest run yet</h3><p>Enter both versions of the code and run the comparison.</p></div> : <><div className="verification-result"><div className="result-icon">{result.retest_passed ? <CheckCircle2 /> : <AlertTriangle />}</div><h3>{result.retest_passed ? 'No Semgrep findings remain' : 'Review required'}</h3><p>{result.comparison?.message || 'Retest completed.'}</p><div className="result-rows"><div><span>Original findings</span><Badge tone="muted">{result.before?.finding_count ?? 0}</Badge></div><div><span>Resolved findings</span><Badge tone="green">{result.comparison?.resolved_findings ?? 0}</Badge></div><div><span>Remaining findings</span><Badge tone={result.comparison?.remaining_findings ? 'amber':'green'}>{result.comparison?.remaining_findings ?? result.after?.finding_count ?? 0}</Badge></div><div><span>New findings</span><Badge tone={result.comparison?.new_findings ? 'amber':'muted'}>{result.comparison?.new_findings ?? 0}</Badge></div></div></div><h3>Remaining findings</h3><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:12}}>{JSON.stringify(result.after?.findings || [],null,2)}</pre><p className="muted">A pass means this Semgrep comparison found no remaining findings. It is not a complete security certification.</p></>}</Card></div></>
}
function Runtime(){const [events,setEvents]=useState(runtimeEvents); const [running,setRunning]=useState(false); return <><PageHeader eyebrow="ADDITIONAL MODULE" title="Runtime Protection" description="Monitor a controlled application and review protection actions returned by the backend." action={<button className="button primary" onClick={()=>{setRunning(true);setEvents([{time:'Now',type:'Brute force threshold',severity:'High',reason:'Simulated repeated failed logins crossed threshold',endpoint:'/auth/login',action:'Rate limited',outcome:'Applied'},...events])}}><Play /> Run demo scenario</button>} /><div className="runtime-head"><Card className="monitor-card"><div className="status-line"><div className="pulse green"><ShieldCheck /></div><div><span className="eyebrow">MONITORING STATUS</span><h2>{running?'Scenario active':'Connected · Demo mode'}</h2><p>Polling every 2 seconds while this page is active</p></div><Badge tone="green">Demo mode</Badge></div><div className="runtime-metrics"><div><span>Events today</span><strong>142</strong></div><div><span>Active alerts</span><strong className="text-red">2</strong></div><div><span>Actions applied</span><strong className="text-green">4</strong></div><div><span>Rate-limit status</span><strong className="text-green">Healthy</strong></div></div></Card><Card><div className="card-title"><div><h2>Detection rules</h2><p>Configured for test application</p></div><Settings /></div><div className="rule"><span>Failed login threshold</span><Badge tone="green">12 / 60s</Badge></div><div className="rule"><span>SQL injection patterns</span><Badge tone="green">Enabled</Badge></div><div className="rule"><span>Request anomaly score</span><Badge tone="green">0.82</Badge></div></Card></div><Card className="table-card"><div className="card-title"><div><h2>Live event feed</h2><p>Events are simulated until a backend is connected.</p></div><div className="feed-actions"><div className="connection"><i></i> Connected</div><button className="icon-button"><RefreshCw /></button></div></div><div className="table-wrap"><table><thead><tr><th>Timestamp</th><th>Event type</th><th>Severity</th><th>Detection reason</th><th>Endpoint</th><th>Action</th><th>Outcome</th></tr></thead><tbody>{events.map((e,i)=><tr key={i}><td className="mono">{e.time}</td><td><strong>{e.type}</strong></td><td><Badge tone={e.severity.toLowerCase()}>{e.severity}</Badge></td><td>{e.reason}</td><td className="mono">{e.endpoint}</td><td>{e.action}</td><td><Badge tone="green">{e.outcome}</Badge></td></tr>)}</tbody></table></div></Card></> }
function History({ scanHistory, setPage }) {
  return <><PageHeader eyebrow="APPLICATION SECURITY" title="Scan History" description="Completed scans saved in this browser. History remains after refresh on this browser." action={<button className="button secondary" onClick={()=>saveJsonDownload(scanHistory,'zeroguard-scan-history.json')}><Download /> Export history</button>} /><Card className="table-card"><div className="table-meta"><span>{scanHistory.length} saved scans</span><Badge tone="info">Local history</Badge></div>{scanHistory.length ? <div className="table-wrap"><table><thead><tr><th>Scan ID</th><th>File</th><th>Started</th><th>Duration</th><th>Findings</th><th>ML risk</th><th>Status</th><th></th></tr></thead><tbody>{scanHistory.map(s=><tr key={s.id}><td className="mono">{s.id}</td><td><strong>{s.filename}</strong></td><td>{new Date(s.timestamp).toLocaleString()}</td><td>{s.durationMs ? `${(s.durationMs/1000).toFixed(1)}s` : '—'}</td><td>{getScanFindings(s).length}</td><td>{s.result?.ml_analysis?.risk_score ?? '—'}%</td><td><Badge tone="green">Completed</Badge></td><td><button className="text-button" onClick={()=>setPage('findings')}>Findings →</button></td></tr>)}</tbody></table></div> : <div className="empty-state" style={{padding:24}}><Clock3 /><h3>No scan history yet</h3><p>After your first completed scan, its result will be saved here automatically.</p><button className="button primary" onClick={()=>setPage('scans')}>Run first scan</button></div>}</Card></>
}
function Reports({ scanHistory }) {
  const findingCount = scanHistory.reduce((total, scan) => total + getScanFindings(scan).length, 0)
  const exportReport = () => saveJsonDownload({project:'ZeroGuard AI', generated_at:new Date().toISOString(), scan_count:scanHistory.length, total_semgrep_findings:findingCount, scans:scanHistory}, 'zeroguard-report.json')
  return <><PageHeader eyebrow="SECURITY REPORTING" title="Reports" description="Export a report based on the scans actually saved in this browser." action={<button className="button secondary" onClick={exportReport}><Download /> Export JSON</button>} /><div className="report-grid"><Card><div className="card-title"><div><h2>Security scan report</h2><p>Generated {new Date().toLocaleString()}</p></div><FileText /></div><div className="report-stat"><strong>{scanHistory.length}</strong><span>completed scans</span><Badge tone="info">Live data</Badge></div><div className="mini-breakdown"><div><span>Semgrep findings</span><b>{findingCount}</b></div><div><span>ML flagged scans</span><b>{scanHistory.filter(s=>s.result?.ml_analysis?.model_flagged).length}</b></div><div><span>Semgrep scan failures</span><b>{scanHistory.filter(s=>s.result?.static_analysis?.status==='failed').length}</b></div></div></Card><Card><div className="card-title"><div><h2>Data included</h2><p>Actual backend responses</p></div><FileCheck2 /></div><div className="outcome-list"><div><span className="outcome green"><CheckCircle2 /></span><div><strong>ML risk scores</strong><span>Experimental predictions</span></div></div><div><span className="outcome orange"><AlertTriangle /></span><div><strong>Semgrep findings</strong><span>When static analysis completes</span></div></div><div><span className="outcome gray"><Download /></span><div><strong>Fix suggestions</strong><span>As returned by backend</span></div></div></div></Card></div><Card><div className="card-title"><div><h2>Saved scans</h2><p>Export JSON includes each saved scan response.</p></div></div>{scanHistory.length ? <div className="table-wrap"><table><thead><tr><th>File</th><th>Date</th><th>Risk score</th><th>Findings</th></tr></thead><tbody>{scanHistory.map(s=><tr key={s.id}><td>{s.filename}</td><td>{new Date(s.timestamp).toLocaleString()}</td><td>{s.result?.ml_analysis?.risk_score ?? '—'}%</td><td>{getScanFindings(s).length}</td></tr>)}</tbody></table></div> : <p className="muted">No scan data to report yet.</p>}</Card></>
}
function SettingsPage(){return <><PageHeader eyebrow="WORKSPACE CONFIGURATION" title="Settings" description="Configure how ZeroGuard AI connects to your backend and presents security data." /><div className="settings-grid"><Card><div className="card-title"><div><h2>API connection</h2><p>Secrets are never stored in frontend settings.</p></div><GitBranch /></div><label className="field-label">API base URL</label><input className="text-input" defaultValue="http://127.0.0.1:8000" /><div className="setting-row"><div><strong>Connection status</strong><span>Backend health check</span></div><Badge tone="amber">Not connected</Badge></div><button className="button secondary"><RefreshCw /> Test connection</button></Card><Card><div className="card-title"><div><h2>Dashboard preferences</h2><p>Control local presentation settings.</p></div><SlidersHorizontal /></div><div className="setting-row"><div><strong>Demo mode</strong><span>Show clearly labeled simulated data</span></div><label className="switch"><input type="checkbox" defaultChecked/><i></i></label></div><div className="setting-row"><div><strong>Runtime refresh interval</strong><span>Polling while runtime page is active</span></div><select><option>2 seconds</option><option>5 seconds</option><option>10 seconds</option></select></div><div className="setting-row"><div><strong>Compact tables</strong><span>Use denser row spacing</span></div><label className="switch"><input type="checkbox"/><i></i></label></div></Card></div></>}
export default function Page(){
  const [page,setPage]=useState('overview')
  const [mobile,setMobile]=useState(false)
  const [scanHistory,setScanHistory]=useState<any[]>(()=>{
    if (typeof window === 'undefined') return []
    try { return JSON.parse(window.localStorage.getItem('zeroguard.scanHistory') || '[]') } catch { return [] }
  })
  const latestScan = scanHistory[0] || null
  function handleScanComplete(scan) {
    setScanHistory(current => [scan, ...current.filter(item => item.id !== scan.id)].slice(0,100))
  }
  React.useEffect(()=>{ try { window.localStorage.setItem('zeroguard.scanHistory', JSON.stringify(scanHistory)) } catch (err) { console.error('Could not save scan history', err) } },[scanHistory])
  const content={
    overview:<Overview setPage={setPage} scanHistory={scanHistory} latestScan={latestScan}/>,
    scans:<Scans setPage={setPage} onScanComplete={handleScanComplete} latestScan={latestScan}/>,
    findings:<Findings scanHistory={scanHistory} latestScan={latestScan} setPage={setPage}/>,
    verification:<Verification latestScan={latestScan}/>,
    runtime:<Runtime/>,
    history:<History scanHistory={scanHistory} setPage={setPage}/>,
    reports:<Reports scanHistory={scanHistory}/>,
    settings:<SettingsPage/>
  }[page]
  return <div className="app"><aside className={`sidebar ${mobile?'open':''}`}><div className="brand"><div className="brand-mark"><Shield /></div><div><strong>ZeroGuard</strong><span>AI SECURITY PLATFORM</span></div></div><div className="workspace"><div className="workspace-icon">P</div><div><strong>ZeroGuard workspace</strong><span>Local scan history</span></div><ChevronDown /></div><nav>{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={page===item.id?'selected':''} onClick={()=>{setPage(item.id);setMobile(false)}}><Icon />{item.label}</button>})}</nav><div className="sidebar-foot"><button className={page==='settings'?'selected':''} onClick={()=>setPage('settings')}><Settings /> Settings</button><div className="help"><CircleHelp /><span><strong>Need help?</strong><small>Read the docs</small></span></div></div></aside><main className="main"><header className="topbar"><button className="menu-button" onClick={()=>setMobile(!mobile)}><Menu /></button><div className="breadcrumbs"><span>ZeroGuard AI</span><span>/</span><strong>{nav.find(n=>n.id===page)?.label || 'Settings'}</strong></div><div className="top-actions"><div className="global-search"><Search /><span>Search</span><kbd>Ctrl K</kbd></div><button className="icon-button"><Bell /><i className="notification-dot"></i></button><div className="profile">ZG</div></div></header><div className="content">{content}</div></main></div>
}
