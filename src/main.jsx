import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Braces, Check,
  ChevronDown, ChevronRight, CircleHelp, Code2, Cpu,
  ExternalLink, Flame, Gauge, GraduationCap, Layers3, Menu,
  Moon, PanelLeftClose, Search, ShieldCheck, Sparkles, Sun, Terminal, X,
  Zap, Database, Workflow, Bookmark, Copy, CornerDownLeft, Command as CommandIcon
} from 'lucide-react';
import { topics as coreTopics, topicGroups as coreTopicGroups, cheatCategories } from './topics';
import { advancedTopics, advancedTopicGroups } from './advanced-topics';
import { apiGroups, apiEntries } from './api-reference';
import docsSnapshots from './docs-snapshots.json';
import { BackgroundPaths } from './components/ui/background-paths';
import { Dock } from './components/ui/dock-two';
import { CodeBlock } from './components/ui/code-block';
import { FoldedCard, FoldedCardBadge, FoldedCardBorder, FoldedCardDescription, FoldedCardFold, FoldedCardFooter, FoldedCardGrid, FoldedCardHeading, FoldedCardLink, FoldedCardPreview, FoldedCardTitle } from './components/ui/folded-card';

const topics = [...coreTopics, ...advancedTopics];
const topicGroups = [...coreTopicGroups, ...advancedTopicGroups];
import './style.css';

const topicById = Object.fromEntries(topics.map((topic) => [topic.id, topic]));

const normalizeSearchText = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const quickSearchActions = [
  { id: 'go-guide', kind: 'panel', title: 'Browse the guide', description: 'All chapters · Concepts from tensors to deployment', target: 'guide', keywords: 'documentation chapters learning' },
  { id: 'go-cheatsheet', kind: 'panel', title: 'Open cheatsheet', description: 'Common commands and copy-ready snippets', target: 'cheatsheet', keywords: 'quick reference command snippets' },
  { id: 'go-api', kind: 'panel', title: 'Browse API index', description: 'Search classes, functions, arguments and methods', target: 'api', keywords: 'reference functions classes methods' },
  { id: 'go-recipes', kind: 'panel', title: 'Open recipes', description: 'Complete practical workflows', target: 'recipes', keywords: 'training examples recipe workflow' },
  { id: 'go-lab', kind: 'panel', title: 'Open shape lab', description: 'Calculate Conv2d and pooling output shapes', target: 'lab', keywords: 'cnn shape convolution pooling calculator' },
  { id: 'go-saved', kind: 'panel', title: 'Saved topics', description: 'Return to your bookmarked references', target: 'saved', keywords: 'bookmark favorites saved' },
  { id: 'go-setup', kind: 'panel', title: 'Installation & setup', description: 'Choose a supported PyTorch environment', target: 'setup', keywords: 'install cuda cpu pip conda' },
  { id: 'go-roadmap', kind: 'panel', title: 'Learning path', description: 'Track progress through the reference', target: 'roadmap', keywords: 'study progress roadmap' },
];

// Build the search corpus lazily on first search interaction to keep boot time minimal.
let cachedSearchIndex = null;
function getSearchIndex() {
  if (!cachedSearchIndex) {
    cachedSearchIndex = [
      ...topics.filter((topic) => topic.id !== 'overview').map((topic) => ({
        id: `topic-${topic.id}`, kind: 'topic', title: topic.title, description: `${topic.category} · ${topic.summary}`, target: topic.id,
        keywords: `${topic.title} ${topic.summary} ${topic.category} ${topic.intro || ''} ${(topic.sections || []).map((section) => `${section.heading || ''} ${(section.bullets || []).join(' ')} ${(section.paragraphs || []).join(' ')} ${JSON.stringify(section.table || '')}`).join(' ')} ${(topic.examples || []).map((example) => `${example.title} ${example.code}`).join(' ')} ${(topic.gotchas || []).join(' ')}`,
      })),
      ...apiEntries.map((entry) => ({ id: `api-${entry.name}`, kind: 'api', title: entry.name, description: `API · ${entry.description}`, target: entry.name, keywords: `${entry.name} ${entry.description} ${entry.example} ${entry.keywords}` })),
      ...cheatCategories.flatMap((category) => category.items.map(([label, code]) => ({ id: `cheat-${label}`, kind: 'cheat', title: label, description: `Cheatsheet · ${category.label} · ${code}`, target: label, keywords: `${label} ${code} ${category.label}` }))),
      ...quickSearchActions,
    ].map((item) => ({ ...item, normalizedTitle: normalizeSearchText(item.title), normalizedText: normalizeSearchText(`${item.title} ${item.description} ${item.keywords}`), normalizedKeywords: normalizeSearchText(item.keywords) }));
  }
  return cachedSearchIndex;
}

function App() {
  const [activeTopicId, setActiveTopicId] = useState('overview');
  const [panel, setPanel] = useState('guide');
  const [search, setSearch] = useState('');
  const [cheatSearch, setCheatSearch] = useState('');
  const [apiSearch, setApiSearch] = useState('');
  const [apiGroup, setApiGroup] = useState('All APIs');
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('tensor-atlas-theme') || localStorage.getItem('pytorch-atlas-theme') || 'light');
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('pytorch-atlas-saved') || '[]'));
  const [copiedId, setCopiedId] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandActiveIndex, setCommandActiveIndex] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('tensor-atlas-theme', theme);
    localStorage.setItem('pytorch-atlas-theme', theme);
  }, [theme]);

  useEffect(() => {
    const openPanel = (event) => goTo(event.detail);
    const openTopic = (event) => selectTopic(event.detail);
    const openSearch = () => { setCommandOpen(true); setSearch(''); setCommandActiveIndex(0); };
    window.addEventListener('atlas-open-panel', openPanel);
    window.addEventListener('atlas-open-topic', openTopic);
    window.addEventListener('atlas-open-search', openSearch);
    return () => { window.removeEventListener('atlas-open-panel', openPanel); window.removeEventListener('atlas-open-topic', openTopic); window.removeEventListener('atlas-open-search', openSearch); };
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
        setSearch('');
        setCommandActiveIndex(0);
      }
      if (event.key === 'Escape') {
        if (commandOpen) {
          setCommandOpen(false);
          setSearch('');
        }
        setMobileNav(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandOpen]);

  useEffect(() => localStorage.setItem('pytorch-atlas-saved', JSON.stringify(saved)), [saved]);

  const activeTopic = topicById[activeTopicId] || topics[0];
  const filteredGroups = useMemo(() => topicGroups.map((group) => ({
    ...group,
    topics: group.ids.map((id) => topicById[id]).filter(Boolean),
  })), []);

  const commandResults = useMemo(() => {
    const query = normalizeSearchText(search);
    if (!query) return quickSearchActions;
    const tokens = query.split(/\s+/).filter(Boolean);
    return getSearchIndex().map((item) => {
      if (!tokens.every((token) => item.normalizedText.includes(token))) return null;
      let score = item.normalizedTitle === query ? 150 : item.normalizedTitle.startsWith(query) ? 105 : item.normalizedTitle.includes(query) ? 80 : 0;
      score += tokens.reduce((sum, token) => sum + (item.normalizedTitle.includes(token) ? 12 : 0) + (item.normalizedKeywords.includes(token) ? 2 : 0), 0);
      if (item.kind === 'topic') score += 5;
      if (item.kind === 'api' && /torch|nn\.|tensor/i.test(item.title)) score += 4;
      return { ...item, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 14);
  }, [search]);

  const selectTopic = (id) => {
    setActiveTopicId(id);
    setPanel('guide');
    setMobileNav(false);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goTo = (nextPanel) => {
    setPanel(nextPanel);
    setMobileNav(false);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => current === id ? '' : current), 1600);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      setCopiedId(ok ? id : '');
      window.setTimeout(() => setCopiedId(''), 1600);
    }
  };

  const toggleSaved = (id) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const openSearch = () => { setCommandOpen(true); setSearch(''); setCommandActiveIndex(0); };
  const chooseSearchResult = (item) => {
    setCommandOpen(false);
    setSearch('');
    if (item.kind === 'topic') selectTopic(item.target);
    else if (item.kind === 'api') { setApiSearch(item.target); goTo('api'); }
    else if (item.kind === 'cheat') { setCheatSearch(item.target); goTo('cheatsheet'); }
    else if (item.kind === 'panel') goTo(item.target);
  };
  const dockItems = [
    { icon: BookOpen, label: 'Guide', onClick: () => goTo('guide'), active: panel === 'guide' },
    { icon: Braces, label: 'Cheatsheet', onClick: () => goTo('cheatsheet'), active: panel === 'cheatsheet' },
    { icon: Code2, label: 'API index', onClick: () => goTo('api'), active: panel === 'api' },
    { icon: Workflow, label: 'Recipes', onClick: () => goTo('recipes'), active: panel === 'recipes' },
    { icon: Gauge, label: 'Shape lab', onClick: () => goTo('lab'), active: panel === 'lab' },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-zone">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNav((v) => !v)}><Menu size={18} /></button>
          <button className="brand" onClick={() => { goTo('guide'); selectTopic('overview'); }} aria-label="Tensor Atlas home">
            <span className="brand-mark"><Zap size={18} strokeWidth={2.2} /></span>
            <span className="brand-word">Tensor Atlas<small>PYTORCH REFERENCE</small></span>
          </button>
        </div>
        <Dock items={dockItems} className="header-dock" aria-label="Reference sections" />
        <button className="global-search-trigger" type="button" onClick={openSearch} aria-label="Search the reference">
          <Search size={16} className="search-trigger-icon" />
          <span>Search reference, APIs, examples…</span>
          <kbd className="search-trigger-shortcut"><CommandIcon size={11} /> K</kbd>
        </button>
        <div className="top-actions">
          <button className={`icon-button saved-action ${panel === 'saved' ? 'is-current' : ''}`} onClick={() => goTo('saved')} aria-label="Open saved topics" title="Saved topics"><Bookmark size={16} fill={saved.length ? 'currentColor' : 'none'} /></button>
          <button className="icon-button theme-button" onClick={() => setTheme((v) => v === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
        </div>
      </header>

      <div className="app-layout">
        <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-topline">
            <span>DOCUMENTATION</span>
            <button className="icon-button collapse-sidebar" onClick={() => setSidebarCollapsed((v) => !v)} aria-label="Toggle sidebar width"><PanelLeftClose size={16} /></button>
          </div>
          <button className={`sidebar-overview ${panel === 'guide' && activeTopicId === 'overview' ? 'active' : ''}`} onClick={() => selectTopic('overview')}>
            <span className="side-ico"><BookOpen size={16} /></span><span>Overview</span><span className="side-pill">START</span>
          </button>
          {filteredGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.topics.filter((topic) => topic.id !== 'overview').map((topic) => (
                <button className={`side-link ${panel === 'guide' && activeTopicId === topic.id ? 'active' : ''}`} key={topic.id} onClick={() => selectTopic(topic.id)} title={topic.title}>
                  <span className="side-dot" />
                  <span className="side-link-text">{topic.title}</span>
                  {saved.includes(topic.id) && <Bookmark size={12} className="saved-mini" fill="currentColor" />}
                </button>
              ))}
            </div>
          ))}
          <div className="sidebar-bottom">
            <div className="sidebar-progress"><div className="progress-icon"><GraduationCap size={17} /></div><div><b>Your field guide</b><p>{saved.length} saved topic{saved.length === 1 ? '' : 's'} · {topics.length} chapters</p></div></div>
            <div className="sidebar-tool-grid">
              <button onClick={() => goTo('cheatsheet')}><Braces size={13} /> Cheatsheet</button>
              <button onClick={() => goTo('api')}><Code2 size={13} /> API index</button>
              <button onClick={() => goTo('lab')}><Gauge size={13} /> Shape lab</button>
              <button onClick={() => goTo('roadmap')}><GraduationCap size={13} /> Learning path</button>
              <button onClick={() => goTo('recipes')}><Workflow size={13} /> Recipes</button>
              <button onClick={() => goTo('setup')}><Cpu size={13} /> Setup</button>
              <button onClick={() => goTo('saved')}><Bookmark size={13} /> Saved topics</button>
              <button onClick={() => goTo('sources')}><ExternalLink size={13} /> Sources & sync</button>
            </div>
          </div>
        </aside>
        {mobileNav && <button aria-label="Close navigation overlay" className="nav-overlay" onClick={() => setMobileNav(false)} />}

        <main className="main-content" key={`${panel}-${activeTopicId}`}>
          {panel === 'guide' && <GuideView topic={activeTopic} onSelect={selectTopic} onCopy={copyText} copiedId={copiedId} saved={saved} toggleSaved={toggleSaved} />}
          {panel === 'cheatsheet' && <Cheatsheet search={cheatSearch} setSearch={setCheatSearch} onCopy={copyText} copiedId={copiedId} />}
          {panel === 'recipes' && <Recipes onSelect={selectTopic} onCopy={copyText} copiedId={copiedId} />}
          {panel === 'setup' && <Setup onCopy={copyText} copiedId={copiedId} />}
          {panel === 'api' && <ApiExplorer search={apiSearch} setSearch={setApiSearch} group={apiGroup} setGroup={setApiGroup} onCopy={copyText} copiedId={copiedId} />}
          {panel === 'lab' && <ShapeLab onCopy={copyText} copiedId={copiedId} />}
          {panel === 'roadmap' && <LearningPath onSelect={selectTopic} />}
          {panel === 'sources' && <SourcesView />}
          {panel === 'saved' && <SavedTopicsView saved={saved} onSelect={selectTopic} onToggleSaved={toggleSaved} />}
          <footer className="site-footer">
            <span><span className="footer-dot" /> Built for people who want to understand, not just copy.</span>
            <span>Tensor Atlas <span className="footer-sep">/</span> v2.1 · {topics.length} chapters · {apiEntries.length} API entries</span>
          </footer>
        </main>
      </div>
      <CommandPalette open={commandOpen} query={search} setQuery={(value) => { setSearch(value); setCommandActiveIndex(0); }} inputRef={searchRef} results={commandResults} activeIndex={commandActiveIndex} setActiveIndex={setCommandActiveIndex} onChoose={chooseSearchResult} onClose={() => { setCommandOpen(false); setSearch(''); }} />
    </div>
  );
}


function CommandPalette({ open, query, setQuery, inputRef, results, activeIndex, setActiveIndex, onChoose, onClose }) {
  const listRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    };
  }, [open, inputRef]);
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-result-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open, results.length]);

  const iconFor = (kind) => {
    if (kind === 'topic') return <BookOpen size={16}/>;
    if (kind === 'api') return <Code2 size={16}/>;
    if (kind === 'cheat') return <Braces size={16}/>;
    return <ArrowRight size={16}/>;
  };
  const kindLabel = (kind) => ({ topic: 'DOCS', api: 'API', cheat: 'CHEATSHEET', panel: 'OPEN' })[kind] || 'REFERENCE';

  return <AnimatePresence>
    {open && <motion.div className="command-overlay" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.section className="command-palette" role="dialog" aria-modal="true" aria-label="Search Tensor Atlas" initial={{ opacity: 0, y: 8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.995 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const focusable = Array.from(event.currentTarget.querySelectorAll('input, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}>
        <div className="command-search-row">
          <Search size={19} className="command-search-symbol"/>
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search docs, APIs, snippets, common errors…" aria-label="Search docs, APIs, snippets and errors" aria-controls="command-results" aria-activedescendant={results[activeIndex] ? `command-result-${activeIndex}` : undefined}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((value) => Math.min(Math.max(0, results.length - 1), value + 1)); }
              else if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((value) => Math.max(0, value - 1)); }
              else if (event.key === 'Enter' && results[activeIndex]) { event.preventDefault(); onChoose(results[activeIndex]); }
              else if (event.key === 'Escape') { event.preventDefault(); onClose(); }
            }} />
          {query && <button className="command-clear" onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}
          <kbd className="command-esc">ESC</kbd>
        </div>
        <div className="command-meta-row"><span>{query ? `MATCHES FOR “${query}”` : 'QUICK ACCESS'}</span><span>{results.length} {results.length === 1 ? 'result' : 'results'}</span></div>
        <div id="command-results" className="command-results-list" ref={listRef} role="listbox" aria-label="Search results">
          {results.map((item, index) => <button id={`command-result-${index}`} data-result-index={index} key={item.id} role="option" aria-selected={index === activeIndex} className={`command-result ${index === activeIndex ? 'is-active' : ''}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => onChoose(item)}>
            <span className={`command-result-icon type-${item.kind}`}>{iconFor(item.kind)}</span>
            <span className="command-result-copy"><b>{item.title}</b><small>{item.description}</small></span>
            <span className="command-result-type">{kindLabel(item.kind)}</span>
            {index === activeIndex && <CornerDownLeft size={14} className="command-result-enter"/>}
          </button>)}
          {!results.length && <div className="command-empty"><Search size={22}/><b>No exact matches</b><span>Try an API name like <code>torch.no_grad</code>, or search for a concept such as <code>gradient</code>.</span><button onClick={() => onChoose({ kind: 'panel', target: 'api' })}>Open full API index <ArrowRight size={13}/></button></div>}
        </div>
        <div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>esc</kbd> Close</span><span className="command-footer-brand"><span className="brand-mini-mark"><Zap size={10}/></span> Tensor Atlas</span></div>
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}

function SavedTopicsView({ saved, onSelect, onToggleSaved }) {
  const items = saved.map((id) => topicById[id]).filter(Boolean);
  return <div className="content-page saved-page">
    <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13}/><b>Saved references</b></div>
    <div className="article-eyebrow"><span className="eyebrow-dot"/> YOUR PERSONAL INDEX</div>
    <h1>Keep the useful things close.</h1>
    <p className="article-lede page-lede">Your saved chapters stay on this device, ready when you need them again.</p>
    {items.length ? <div className="saved-topic-list">{items.map((topic) => <article className="saved-topic-row" key={topic.id}>
      <button className="saved-topic-open" onClick={() => onSelect(topic.id)}><span className="saved-topic-icon"><BookOpen size={17}/></span><span><b>{topic.title}</b><small>{topic.category} · {topic.summary}</small></span><ArrowRight size={15}/></button>
      <button className="saved-topic-remove" onClick={() => onToggleSaved(topic.id)} aria-label={`Remove ${topic.title} from saved topics`} title="Remove saved topic"><Bookmark size={15} fill="currentColor"/></button>
    </article>)}</div> : <div className="saved-empty"><span className="saved-empty-icon"><Bookmark size={22}/></span><h2>No saved topics yet</h2><p>Save a chapter with its bookmark button. It will show up here for quick access.</p><button className="primary-button" onClick={() => onSelect('tensor-basics')}>Explore the guide <ArrowRight size={14}/></button></div>}
  </div>;
}

function SectionContent({ section, sectionId }) {
  return <section id={sectionId} className="article-section">
    <h2>{section.heading}</h2>
    {section.paragraphs?.map((paragraph, i) => <p key={i}>{formatInline(paragraph)}</p>)}
    {section.bullets && <ul className="content-bullets">{section.bullets.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ul>}
    {section.table && <div className="table-scroll"><table className="reference-table"><thead><tr>{section.table.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{section.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{formatInline(cell)}</td>)}</tr>)}</tbody></table></div>}
  </section>;
}

function formatInline(text) {
  const pieces = String(text).split(/(\*\*.*?\*\*|`.*?`)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith('**') && piece.endsWith('**')) return <strong key={index}>{piece.slice(2, -2)}</strong>;
    if (piece.startsWith('`') && piece.endsWith('`')) return <code className="inline-code" key={index}>{piece.slice(1, -1)}</code>;
    return piece;
  });
}

const CodeCard = React.memo(function CodeCard({ example, id, onCopy, copiedId, compact = false }) {
  const extension = /pip install|python -m venv|npm run|torchrun|CUDA_VISIBLE_DEVICES/.test(example.code) ? 'bash' : 'python';
  return <CodeBlock files={[{ title: example.title || 'example.py', code: example.code, language: extension }]} className={compact ? 'compact-code-card' : ''} />;
});

function GuideView({ topic, onSelect, onCopy, copiedId, saved, toggleSaved }) {
  const [expandedToc, setExpandedToc] = useState(true);
  const [showAllRelated, setShowAllRelated] = useState(false);
  const index = topics.findIndex((t) => t.id === topic.id);
  const previous = topics[index - 1];
  const next = topics[index + 1];
  const sections = topic.sections || [];
  const isSaved = saved.includes(topic.id);

  if (topic.id === 'overview') return <OverviewView onSelect={onSelect} onCopy={onCopy} copiedId={copiedId} />;

  return <div className="article-layout">
    <article className="article">
      <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13} /><span>{topic.category}</span><ChevronRight size={13} /><b>{topic.title}</b></div>
      <div className="article-eyebrow"><span className="eyebrow-dot" /> {topic.level} <span className="eyebrow-sep">/</span> {topic.time} read</div>
      <div className="article-title-row"><div><h1>{topic.title}</h1><p className="article-lede">{topic.summary}</p></div><button className={`bookmark-button ${isSaved ? 'is-saved' : ''}`} onClick={() => toggleSaved(topic.id)} aria-label={isSaved ? 'Remove saved topic' : 'Save topic'} title={isSaved ? 'Saved' : 'Save this topic'}>{isSaved ? <Bookmark size={17} fill="currentColor" /> : <Bookmark size={17} />}</button></div>
      <div className="article-intro">{topic.intro}</div>
      {sections.map((section, i) => <SectionContent section={section} sectionId={`section-${i}`} key={i} />)}
      {topic.examples?.length > 0 && <section className="examples-section"><div className="section-topline"><h2>In practice</h2><span><Code2 size={13} /> {topic.examples.length} snippet{topic.examples.length > 1 ? 's' : ''}</span></div><p className="section-description">Runnable patterns to adapt to your own project. Check the expected input shape and device before using them.</p>{topic.examples.map((example, i) => <CodeCard example={example} id={topic.id} onCopy={onCopy} copiedId={copiedId} key={i} />)}</section>}
      {topic.gotchas?.length > 0 && <section className="gotchas-card"><div className="gotcha-head"><span className="gotcha-icon"><CircleHelp size={16} /></span><div><h3>Watch out for these</h3><p>Small details that often cause big debugging sessions.</p></div></div><ul>{topic.gotchas.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ul></section>}
      {topic.docs?.length > 0 && <section className="further-reading"><h2>Official references</h2><p>Use these pages when you need the full API contract or version-specific details.</p><div className="docs-links">{topic.docs.map((doc) => <a href={doc.url} target="_blank" rel="noreferrer" key={doc.url}><span className="doc-link-icon"><ExternalLink size={14} /></span><span>{doc.label}<small>{new URL(doc.url).hostname}</small></span><ArrowUpRightIcon /></a>)}</div></section>}
      {topic.related?.length > 0 && <section className="related-topics"><h2>Keep learning</h2><div className="related-grid">{topic.related.slice(0, showAllRelated ? topic.related.length : 3).map((id) => topicById[id]).filter(Boolean).map((related) => <button key={related.id} className="related-card" onClick={() => onSelect(related.id)}><span>{related.category}</span><b>{related.title}</b><small>{related.summary}</small><ArrowRight size={14} /></button>)}</div></section>}
      <div className="article-pager"><button disabled={!previous} onClick={() => previous && onSelect(previous.id)}><ArrowLeft size={15} /><span><small>PREVIOUS</small><b>{previous?.title || '—'}</b></span></button><button disabled={!next} onClick={() => next && onSelect(next.id)}><span><small>NEXT CHAPTER</small><b>{next?.title || '—'}</b></span><ArrowRight size={15} /></button></div>
    </article>
    <aside className="article-rail">
      <div className="rail-sticky">
        <button className="rail-heading" onClick={() => setExpandedToc((v) => !v)}><span>ON THIS PAGE</span>{expandedToc ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>
        {expandedToc && <div className="toc-list">{sections.map((section, i) => <button key={i} onClick={() => document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{section.heading}</button>)}{topic.examples?.length > 0 && <button onClick={() => document.querySelector('.examples-section')?.scrollIntoView({ behavior: 'smooth' })}>In practice</button>}{topic.gotchas?.length > 0 && <button onClick={() => document.querySelector('.gotchas-card')?.scrollIntoView({ behavior: 'smooth' })}>Watch out for these</button>}</div>}
        <div className="rail-divider" />
        <div className="rail-note"><div className="rail-note-icon"><Sparkles size={15} /></div><b>Learning tip</b><p>Run a tiny example first. Print shapes and dtypes before training at scale.</p></div>
        <div className="rail-divider" />
        <div className="rail-mini-links"><span>QUICK ACCESS</span><button onClick={() => onSelect('training-loop')}><Activity size={13} /> Training loop</button><button onClick={() => onSelect('save-load')}><Bookmark size={13} /> Save & load</button></div>
      </div>
    </aside>
  </div>;
}

function ArrowUpRightIcon() { return <ArrowRight size={14} className="doc-link-arrow" />; }

function OverviewView({ onSelect, onCopy, copiedId }) {
  const [openFaq, setOpenFaq] = useState(0);
  const quickStart = `import torch\nfrom torch import nn\n\ndevice = torch.device("cuda" if torch.cuda.is_available() else "cpu")\nmodel = nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 3)).to(device)\nx = torch.randn(64, 10, device=device)\ntarget = torch.randint(0, 3, (64,), device=device)\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)\n\noptimizer.zero_grad(set_to_none=True)\nloss = loss_fn(model(x), target)\nloss.backward()\noptimizer.step()`;
  const featured = ['tensor-basics', 'autograd', 'datasets-loaders', 'training-loop', 'cnn', 'save-load'].map((id) => topicById[id]);
  const faqs = [
    ['Do I need to understand NumPy first?', 'It helps, but it is not a prerequisite. Many tensor concepts map naturally to NumPy arrays. Focus on tensor shape, dtype, device, and gradient tracking; remember that tensors can run on accelerators and participate in autograd.'],
    ['Should I use TensorDataset or write a Dataset class?', 'Use TensorDataset when X and y are already aligned tensors in memory. Write a custom Dataset when you need file reads, parsing, transforms, lazy loading, or more control over how each example is created.'],
    ['Do I have to initialize weights with Xavier or He?', 'No. PyTorch layers already have documented default initializations. Apply a custom initializer when it matches the activation/architecture or when you are reproducing a specific method—not as a ritual before every training run.'],
    ['Does model.eval() disable gradients?', 'No. It changes the behavior of modules such as Dropout and BatchNorm. Use torch.no_grad() or torch.inference_mode() separately when you want to avoid building an autograd graph.'],
  ];
  return <div className="overview-page">
    <div className="atlas-home-hero">
      <BackgroundPaths
        title="Find the PyTorch detail you need."
        eyebrow={
          <div className="hero-kicker-content">
            <span className="hero-kicker-tag"><Flame size={13} className="hero-flame-icon" /> PYTORCH 2.x FIELD GUIDE</span>
            <span className="hero-kicker-sep">/</span>
            <a
              href="https://docs.pytorch.org/docs/stable/index.html"
              target="_blank"
              rel="noreferrer"
              className="hero-official-doc-link"
              title="Open official PyTorch documentation (stable)"
            >
              <span>docs.pytorch.org</span>
              <ExternalLink size={11} />
            </a>
          </div>
        }
        className="hero-block"
      >
        <p className="hero-subtitle">
          An instant desk reference for tensors, autograd, and neural modules—linking directly to official PyTorch documentation for every concept and API.
        </p>
        <button className="hero-search-trigger" onClick={() => window.dispatchEvent(new CustomEvent('atlas-open-search'))}>
          <Search size={17} /><span>Search 90+ PyTorch APIs, tensor operations, error fixes or patterns…</span><kbd><CommandIcon size={11}/> K</kbd>
        </button>
        <div className="hero-quick-links">
          <span>Quick jumps</span>
          <button onClick={() => onSelect('tensor-basics')}>Tensor shapes <ArrowRight size={12}/></button>
          <button onClick={() => onSelect('autograd')}>Autograd & loop <ArrowRight size={12}/></button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('atlas-open-panel', { detail: 'api' }))}>API index <ArrowRight size={12}/></button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('atlas-open-panel', { detail: 'cheatsheet' }))}>Cheatsheet <ArrowRight size={12}/></button>
          <a
            href="https://docs.pytorch.org/docs/stable/index.html"
            target="_blank"
            rel="noreferrer"
            className="hero-doc-badge-link"
          >
            <span>Official Docs</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </BackgroundPaths>
    </div>

    <div className="overview-stats"><div><b>{topics.length}</b><span>Curated chapters</span></div><div><b>{topicGroups.length}</b><span>Reference tracks</span></div><div><b>{apiEntries.length}+</b><span>Indexed API patterns</span></div><div><b>01</b><span>Shape calculator lab</span></div></div>

    <section className="overview-section" id="quick-start">
      <div className="section-kicker">01 — THE FAST PATH</div><div className="section-heading-row"><div><h2>Your first PyTorch step</h2><p>One tiny example. One complete update. The essential loop in miniature.</p></div><button className="text-link" onClick={() => onSelect('training-loop')}>Understand the loop <ArrowRight size={14} /></button></div>
      <CodeCard id="overview-quick" example={{ title: 'One forward + backward + update', code: quickStart }} onCopy={onCopy} copiedId={copiedId} />
      <div className="quick-note"><span className="note-symbol"><CircleHelp size={15} /></span><p><b>What just happened?</b> A batch went through the model, a loss measured its error, autograd computed gradients, and AdamW updated trainable parameters. Repeat this with a DataLoader and validation phase to build a complete training workflow.</p></div>
    </section>

    <section className="overview-section chapters-section">
      <div className="section-kicker">02 — BUILD YOUR MENTAL MODEL</div><div className="section-heading-row"><div><h2>Start with the building blocks</h2><p>Move from tensors to complete training workflows, one concept at a time.</p></div></div>
      <div className="chapter-grid atlas-featured-grid">{featured.map((topic, i) => <FoldedCard className={`atlas-featured-card atlas-featured-card-${i + 1}`} key={topic.id}>
        <FoldedCardFold/>
        <FoldedCardLink href={`#${topic.id}`} aria-label={`Open ${topic.title}`} onClick={(event) => { event.preventDefault(); onSelect(topic.id); }}>
          <FoldedCardBorder/>
          <FoldedCardPreview className={`atlas-featured-preview preview-${i + 1}`}>
            <FoldedCardGrid rows={4} columns={7}/>
            <div className="featured-preview-content"><span className="featured-preview-kicker">REFERENCE / {String(i + 1).padStart(2, '0')}</span>
              <div className="featured-preview-diagram">
                {i === 0 ? <><span className="tensor-chip">B × F</span><ArrowRight size={16}/><span className="tensor-chip active-chip">[32, 128]</span></> : i === 1 ? <><span className="tensor-chip">forward</span><ArrowRight size={16}/><span className="tensor-chip active-chip">loss</span><ArrowRight size={16}/><span className="tensor-chip">backward</span></> : i === 2 ? <><span className="tensor-chip">Dataset</span><ArrowRight size={16}/><span className="tensor-chip active-chip">DataLoader</span></> : i === 3 ? <><span className="tensor-chip">model(x)</span><ArrowRight size={16}/><span className="tensor-chip active-chip">logits</span></> : i === 4 ? <><span className="tensor-chip">N × C × H × W</span><ArrowRight size={16}/><span className="tensor-chip active-chip">Conv2d</span></> : <><span className="tensor-chip">state_dict</span><ArrowRight size={16}/><span className="tensor-chip active-chip">checkpoint</span></>}
              </div>
              <div className="featured-preview-baseline"><span>{topic.level}</span><span>{topic.time}</span></div>
            </div>
          </FoldedCardPreview>
          <FoldedCardFooter>
            <FoldedCardHeading><FoldedCardTitle>{topic.title}</FoldedCardTitle><FoldedCardBadge>{topic.time}</FoldedCardBadge></FoldedCardHeading>
            <FoldedCardDescription>{topic.summary}</FoldedCardDescription>
          </FoldedCardFooter>
        </FoldedCardLink>
      </FoldedCard>)}</div>
    </section>

    <section className="overview-section faq-section">
      <div className="section-kicker">03 — BEFORE YOU TRAIN</div><div className="section-heading-row"><div><h2>Questions worth asking early</h2><p>Small decisions that save a lot of debugging later.</p></div></div>
      <div className="faq-list">{faqs.map(([question, answer], i) => <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={question}><button onClick={() => setOpenFaq((current) => current === i ? -1 : i)}><span>{question}</span>{openFaq === i ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>{openFaq === i && <p>{answer}</p>}</div>)}</div>
    </section>
    <div className="official-note"><span className="official-note-icon"><BookOpen size={17} /></span><div><b>Use this as a map—not a substitute for the API docs.</b><p>PyTorch evolves. Every chapter links to official references so you can confirm version-specific details.</p></div><a href="https://docs.pytorch.org/docs/stable/index.html" target="_blank" rel="noreferrer">Official docs <ExternalLink size={13} /></a></div>
  </div>;
}

function Cheatsheet({ search, setSearch, onCopy, copiedId }) {
  const q = search.trim().toLowerCase();
  const filtered = cheatCategories.map((category) => ({ ...category, items: category.items.filter(([label, code]) => `${label} ${code} ${category.label}`.toLowerCase().includes(q)) })).filter((category) => category.items.length);
  const total = filtered.reduce((sum, category) => sum + category.items.length, 0);
  return <div className="content-page cheatsheet-page">
    <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13} /><b>Quick reference</b></div>
    <div className="page-heading-with-icon"><div className="page-heading-icon purple-icon"><Braces size={23} /></div><div><div className="article-eyebrow"><span className="eyebrow-dot purple-dot" /> DESK REFERENCE</div><h1>The PyTorch cheatsheet</h1><p className="article-lede">The commands you'll reach for most often. Search, copy, keep moving.</p></div></div>
    <div className="cheat-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a command: zero_grad, reshape, device..." /><span>{total} snippets</span>{search && <button onClick={() => setSearch('')} aria-label="Clear cheatsheet search"><X size={14} /></button>}</div>
    <div className="cheat-callout"><Zap size={16} /><p><b>Remember the core cycle:</b> clear old gradients → forward pass → calculate loss → backward pass → optimizer step.</p></div>
    <div className="cheat-sections">{filtered.map((category) => <section className="cheat-category" key={category.label}><div className="cheat-category-heading"><span className={`cheat-category-dot ${category.color}`} /><h2>{category.label}</h2><span className="cheat-count">{category.items.length} items</span></div><div className="cheat-item-grid">{category.items.map(([label, code]) => { const key = `cheat-${label}`; return <div className="cheat-item" key={label}><div className="cheat-item-title">{label}<button className="mini-copy" onClick={() => onCopy(code, key)} aria-label={`Copy ${label}`}>{copiedId === key ? <Check size={13} /> : <Copy size={13} />}</button></div><pre><code>{code}</code></pre></div>; })}</div></section>)}{!filtered.length && <div className="empty-state"><Search size={22} /><h3>No snippets match that search</h3><p>Try a broader term like “tensor”, “loss”, or “model”.</p></div>}</div>
    <div className="cheat-bottom-note"><CircleHelp size={16} /><span>API details can vary by PyTorch version. Follow the official reference for exact arguments and edge cases.</span><a href="https://docs.pytorch.org/docs/stable/index.html" target="_blank" rel="noreferrer">Browse API <ExternalLink size={12} /></a></div>
  </div>;
}

function Recipes({ onSelect, onCopy, copiedId }) {
  const recipes = [
    { icon: Database, label: 'TABULAR CLASSIFICATION', title: 'Train a classifier', desc: 'TensorDataset → MLP → CrossEntropyLoss → AdamW → validation accuracy.', steps: ['Check X/y shape, missing data, feature scaling, and label encoding.', 'Create Dataset and DataLoader objects.', 'Return logits from the model; use class-index targets for cross entropy.', 'Track validation metrics and save the best checkpoint.'], topic: 'mlp', code: `dataset = TensorDataset(X.float(), y.long())\nloader = DataLoader(dataset, batch_size=64, shuffle=True)\nmodel = MLP(X.shape[1], n_classes).to(device)\nloss_fn = nn.CrossEntropyLoss()\noptimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)` },
    { icon: Layers3, label: 'COMPUTER VISION', title: 'Train an image model', desc: 'Transforms → NCHW batches → CNN → augmentations → checkpoint.', steps: ['Keep images in the channel layout expected by the model.', 'Apply training augmentation separately from validation preprocessing.', 'Start with a small CNN or fine-tune a pretrained torchvision model.', 'Track a class-sensitive metric if data are imbalanced.'], topic: 'cnn', code: `images = images.to(device)  # (N, C, H, W)\nlogits = model(images)      # (N, n_classes)\nloss = nn.CrossEntropyLoss()(logits, labels.long())` },
    { icon: Activity, label: 'REGRESSION', title: 'Predict a continuous value', desc: 'Numeric features → MLP head → regression objective → MAE/RMSE.', steps: ['Split data before fitting any preprocessing.', 'Align model output and target shapes (for example both [N, 1]).', 'Consider MSE, L1, or SmoothL1 based on the error distribution.', "Report metrics in the target's meaningful units."], topic: 'losses', code: `model = nn.Sequential(nn.Linear(n_features, 64), nn.ReLU(), nn.Linear(64, 1))\nloss_fn = nn.MSELoss()\nprediction = model(features.float())\nloss = loss_fn(prediction, target.float().reshape(-1, 1))` },
    { icon: Workflow, label: 'RESUME TRAINING', title: 'Checkpoint and continue', desc: 'Save model state, optimizer state, scheduler state, and epoch.', steps: ['Save only after a well-defined training step or epoch boundary.', 'Persist optimizer/scheduler states when you need to resume the same run.', 'Load to the intended map location.', 'Restore RNG and sampler state too when stronger reproducibility is needed.'], topic: 'save-load', code: `torch.save({\n    "epoch": epoch,\n    "model_state": model.state_dict(),\n    "optimizer_state": optimizer.state_dict(),\n}, "checkpoint.pth")` },
  ];
  return <div className="content-page recipes-page">
    <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13} /><b>Recipes</b></div>
    <div className="article-eyebrow"><span className="eyebrow-dot green-dot" /> TASK-ORIENTED WORKFLOWS</div><h1>From problem to pipeline</h1><p className="article-lede page-lede">Reusable starting points for common modeling jobs. These are patterns, not one-size-fits-all prescriptions.</p>
    <div className="recipe-grid">{recipes.map((recipe, i) => { const Icon = recipe.icon; return <article className="recipe-card" key={recipe.title}><div className="recipe-card-top"><span className={`recipe-icon recipe-icon-${i}`}><Icon size={19} /></span><span className="recipe-label">{recipe.label}</span></div><h2>{recipe.title}</h2><p>{recipe.desc}</p><div className="recipe-steps">{recipe.steps.map((step, si) => <div key={step}><span>{String(si + 1).padStart(2, '0')}</span><p>{step}</p></div>)}</div><CodeCard id={`recipe-${i}`} example={{ title: 'Starting point', code: recipe.code }} onCopy={onCopy} copiedId={copiedId} compact /><button className="recipe-learn-link" onClick={() => onSelect(recipe.topic)}>Read the full chapter <ArrowRight size={14} /></button></article>; })}</div>
    <div className="recipe-warning"><ShieldCheck size={17} /><div><b>Before a long training run</b><p>Fit one batch first, confirm the loss is finite, confirm gradients flow, and verify validation runs without optimizer updates.</p></div></div>
  </div>;
}

function Setup({ onCopy, copiedId }) {
  const windows = `py -3.12 -m venv .venv\n.\\.venv\\Scripts\\Activate.ps1\npython -m pip install --upgrade pip`;
  const unix = `python3 -m venv .venv\nsource .venv/bin/activate\npython -m pip install --upgrade pip`;
  const verify = `python -c "import torch; print('PyTorch:', torch.__version__); print('CUDA available:', torch.cuda.is_available()); print('Device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"`;
  return <div className="content-page setup-page">
    <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13} /><b>Environment setup</b></div>
    <div className="article-eyebrow"><span className="eyebrow-dot orange-dot" /> GET YOUR ENVIRONMENT READY</div><h1>Install once. Verify twice.</h1><p className="article-lede page-lede">A repeatable local setup for the examples in this guide. The website itself needs Node.js; Python examples need a separate Python environment.</p>
    <div className="setup-prereq-grid"><div><span className="prereq-icon"><Terminal size={18} /></span><b>Node.js 20+</b><p>Runs the reference website locally using Vite.</p></div><div><span className="prereq-icon"><Braces size={18} /></span><b>Python 3.10+</b><p>Use a supported Python release for your PyTorch build.</p></div><div><span className="prereq-icon"><Cpu size={18} /></span><b>CPU or accelerator</b><p>CUDA / ROCm / MPS depends on hardware and platform.</p></div></div>
    <section className="setup-section"><div className="setup-step"><span>01</span><div><h2>Run the website</h2><p>From the unzipped <code>pytorch-atlas</code> folder, install JavaScript dependencies and start Vite.</p></div></div><CodeCard id="setup-web" example={{ title: 'Terminal', code: `npm install\nnpm run dev` }} onCopy={onCopy} copiedId={copiedId} /><div className="setup-tip"><CircleHelp size={14} /> Open the local URL printed by Vite, usually <code>http://localhost:5173</code>. Use <code>npm run build</code> to create a production build in <code>dist/</code>.</div></section>
    <section className="setup-section"><div className="setup-step"><span>02</span><div><h2>Create a Python environment</h2><p>Pick the command for your operating system. Activate this environment before installing or running PyTorch.</p></div></div><div className="setup-code-grid"><CodeCard id="setup-win" example={{ title: 'Windows PowerShell', code: windows }} onCopy={onCopy} copiedId={copiedId} compact /><CodeCard id="setup-unix" example={{ title: 'Linux / macOS', code: unix }} onCopy={onCopy} copiedId={copiedId} compact /></div></section>
    <section className="setup-section"><div className="setup-step"><span>03</span><div><h2>Install the right PyTorch build</h2><p>Use the official selector to generate the exact command for your OS, package manager, compute platform, and supported accelerator version.</p></div></div><div className="install-choice"><div className="install-choice-icon"><Cpu size={19} /></div><div><b>Official PyTorch install selector</b><p>Choose Pip or Conda, your platform, Python package manager, and CPU/CUDA/ROCm option.</p><a href="https://pytorch.org/get-started/locally/" target="_blank" rel="noreferrer">Choose your install command <ExternalLink size={13} /></a></div></div><div className="setup-tip warning-tip"><ShieldCheck size={14} /> Don't choose a CUDA wheel based only on the installed CUDA toolkit number. Follow the current selector and check compatible driver requirements.</div></section>
    <section className="setup-section"><div className="setup-step"><span>04</span><div><h2>Verify the installation</h2><p>Run this inside the activated environment used by your editor or notebook kernel.</p></div></div><CodeCard id="setup-verify" example={{ title: 'Check version and GPU access', code: verify }} onCopy={onCopy} copiedId={copiedId} /><div className="setup-tip"><CircleHelp size={14} /> If CUDA returns <code>False</code>, start by checking that you installed a CUDA-enabled build and that your NVIDIA driver is compatible. CPU-only training remains available.</div></section>
    <section className="setup-section"><div className="setup-step"><span>05</span><div><h2>Optional packages</h2><p>Install extra packages only when a chapter or project needs them.</p></div></div><div className="optional-packages"><div><code>torchvision</code><span>Image datasets, transforms, and pretrained vision models.</span></div><div><code>torchaudio</code><span>Audio I/O and audio transforms.</span></div><div><code>jupyterlab</code><span>Interactive notebook workflow.</span></div><div><code>matplotlib</code><span>Plots for loss curves and data inspection.</span></div></div><CodeCard id="setup-extras" example={{ title: 'Optional utilities', code: `python -m pip install jupyterlab matplotlib` }} onCopy={onCopy} copiedId={copiedId} compact /></section>
    <div className="official-note setup-official"><span className="official-note-icon"><BookOpen size={17} /></span><div><b>Package versions evolve.</b><p>The installation selector and version-matched documentation are the source of truth for your machine.</p></div><a href="https://docs.pytorch.org/get-started/locally/" target="_blank" rel="noreferrer">Installation docs <ExternalLink size={13} /></a></div>
  </div>;
}


function ApiExplorer({ search, setSearch, group, setGroup, onCopy, copiedId }) {
  const q = search.trim().toLowerCase();
  const groups = ['All APIs', ...apiGroups.map((item) => item.label)];
  const visibleGroups = apiGroups.filter((item) => group === 'All APIs' || item.label === group).map((item) => ({
    ...item,
    entries: item.entries.map(([name, description, example, url, keywords]) => ({ name, description, example, url, keywords }))
      .filter((entry) => !q || `${entry.name} ${entry.description} ${entry.example} ${entry.keywords}`.toLowerCase().includes(q)),
  })).filter((item) => item.entries.length > 0);
  const resultCount = visibleGroups.reduce((sum, item) => sum + item.entries.length, 0);
  return <div className="content-page api-page">
    <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13} /><b>API index</b></div>
    <div className="article-eyebrow"><span className="eyebrow-dot purple-dot" /> SEARCHABLE QUICK REFERENCE</div>
    <h1>Find the right API.</h1>
    <p className="article-lede page-lede">A curated index of commonly used PyTorch classes, functions, and workflows. Each entry includes a practical pattern, task tags, and an official reference link.</p>
    <div className="api-toolbar">
      <div className="api-search"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try CrossEntropyLoss, view, CUDA, DataLoader…" aria-label="Search API entries"/><span>{resultCount} results</span>{search && <button onClick={() => setSearch('')} aria-label="Clear API search"><X size={14}/></button>}</div>
      <div className="api-filters" aria-label="API categories">{groups.map((item) => <button key={item} className={group === item ? 'active' : ''} onClick={() => setGroup(item)}>{item}</button>)}</div>
    </div>
    <div className="api-results-heading"><span>REFERENCE ENTRIES</span><b>{resultCount} / {apiEntries.length}</b></div>
    {visibleGroups.map((item) => <section className="api-group" key={item.label}>
      <div className="api-group-title"><span className="api-group-icon"><Code2 size={16}/></span><div><h2>{item.label}</h2><p>{item.entries.length} practical references</p></div></div>
      <div className="api-entry-grid">{item.entries.map((entry) => {
        const key = `api-${entry.name.replace(/[^a-z0-9]+/gi, '-')}`;
        return <article className="api-entry" key={entry.name}>
          <div className="api-entry-top"><code>{entry.name}</code><a href={entry.url} target="_blank" rel="noreferrer" title="Open official API documentation"><ExternalLink size={14}/></a></div>
          <p>{entry.description}</p>
          <div className="api-example"><pre><code>{entry.example}</code></pre><button onClick={() => onCopy(entry.example, key)} aria-label={`Copy ${entry.name} example`}>{copiedId === key ? <Check size={13}/> : <Copy size={13}/>}</button></div>
          <div className="api-entry-foot"><span>{entry.keywords.split(' ').slice(0, 4).join(' · ')}</span><a href={entry.url} target="_blank" rel="noreferrer">Official reference <ArrowRight size={12}/></a></div>
        </article>;
      })}</div>
    </section>)}
    {!resultCount && <div className="empty-state"><Search size={23}/><h3>No APIs found</h3><p>Try a class name, operation, task, or broad term such as “gradient”, “shape”, or “optimizer”.</p></div>}
    <div className="api-footer-note"><CircleHelp size={16}/><p>This is a curated index, not an exhaustive mirror of every signature. Follow official documentation for full parameters, version compatibility, edge cases, and deprecations.</p><a href="https://docs.pytorch.org/docs/stable/index.html" target="_blank" rel="noreferrer">Full API reference <ExternalLink size={12}/></a></div>
  </div>;
}

function ShapeLab({ onCopy, copiedId }) {
  const [batch, setBatch] = useState(8);
  const [channels, setChannels] = useState(3);
  const [height, setHeight] = useState(224);
  const [width, setWidth] = useState(224);
  const [outChannels, setOutChannels] = useState(32);
  const [layerType, setLayerType] = useState('conv');
  const [kernel, setKernel] = useState(3);
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(1);
  const [dilation, setDilation] = useState(1);
  const [classes, setClasses] = useState(10);
  const outH = Math.floor((Number(height) + 2 * Number(padding) - Number(dilation) * (Number(kernel) - 1) - 1) / Number(stride) + 1);
  const outW = Math.floor((Number(width) + 2 * Number(padding) - Number(dilation) * (Number(kernel) - 1) - 1) / Number(stride) + 1);
  const valid = [batch, channels, height, width, outChannels, kernel, stride, padding, dilation, classes].every((n) => Number.isFinite(Number(n)) && Number(n) >= 0) && Number(batch) > 0 && Number(channels) > 0 && Number(height) > 0 && Number(width) > 0 && Number(kernel) > 0 && Number(stride) > 0 && Number(dilation) > 0 && Number(outChannels) > 0 && Number(classes) > 0 && outH > 0 && outW > 0;
  const computedChannels = layerType === 'conv' ? Number(outChannels) : Number(channels);
  const flattened = valid ? computedChannels * outH * outW : 0;
  const snippet = layerType === 'conv'
    ? `nn.Conv2d(${channels}, ${outChannels}, kernel_size=${kernel}, stride=${stride}, padding=${padding}, dilation=${dilation})\n# input:  (${batch}, ${channels}, ${height}, ${width})\n# output: (${batch}, ${outChannels}, ${outH}, ${outW})\n# flattened features per sample: ${flattened.toLocaleString()}`
    : `nn.MaxPool2d(kernel_size=${kernel}, stride=${stride}, padding=${padding}, dilation=${dilation})\n# input:  (${batch}, ${channels}, ${height}, ${width})\n# output: (${batch}, ${channels}, ${outH}, ${outW})\n# flattened features per sample: ${flattened.toLocaleString()}`;
  const updateNumber = (setter) => (event) => setter(Math.max(0, Number(event.target.value)));
  return <div className="content-page lab-page">
    <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13}/><b>Interactive labs</b></div>
    <div className="article-eyebrow"><span className="eyebrow-dot green-dot"/> SHAPE EXPLORER / CNN CALCULATOR</div>
    <h1>Make tensor shapes visible.</h1>
    <p className="article-lede page-lede">Change input dimensions and layer arguments to see how an image tensor flows through convolution or pooling. The calculator uses PyTorch's 2-D spatial output convention.</p>
    <div className="lab-layout">
      <section className="lab-panel lab-controls">
        <div className="lab-panel-heading"><span className="lab-icon"><SlidersHorizontalIcon/></span><div><h2>Input tensor</h2><p>NCHW — batch, channels, height, width</p></div></div>
        <div className="lab-input-grid">
          <NumberField label="Batch (N)" value={batch} onChange={updateNumber(setBatch)} min={1}/>
          <NumberField label="Channels (C)" value={channels} onChange={updateNumber(setChannels)} min={1}/>
          <NumberField label="Height (H)" value={height} onChange={updateNumber(setHeight)} min={1}/>
          <NumberField label="Width (W)" value={width} onChange={updateNumber(setWidth)} min={1}/>
        </div>
        <div className="lab-separator"/>
        <div className="lab-panel-heading"><span className="lab-icon violet"><Layers3 size={17}/></span><div><h2>Spatial layer</h2><p>Adjust operation and hyperparameters</p></div></div>
        <div className="lab-toggle-row"><button className={layerType === 'conv' ? 'active' : ''} onClick={() => setLayerType('conv')}>Conv2d</button><button className={layerType === 'pool' ? 'active' : ''} onClick={() => setLayerType('pool')}>MaxPool2d</button></div>
        <div className="lab-input-grid">
          {layerType === 'conv' && <NumberField label="Output channels" value={outChannels} onChange={updateNumber(setOutChannels)} min={1}/>}
          <NumberField label="Kernel" value={kernel} onChange={updateNumber(setKernel)} min={1}/>
          <NumberField label="Stride" value={stride} onChange={updateNumber(setStride)} min={1}/>
          <NumberField label="Padding" value={padding} onChange={updateNumber(setPadding)} min={0}/>
          <NumberField label="Dilation" value={dilation} onChange={updateNumber(setDilation)} min={1}/>
        </div>
        <p className="lab-hint"><CircleHelp size={14}/> All dimensions and layer arguments must be positive integers, except padding which can be zero.</p>
      </section>
      <section className="lab-panel lab-output-panel">
        <div className="lab-panel-heading"><span className="lab-icon orange"><Workflow size={17}/></span><div><h2>Shape transformation</h2><p>Computed tensor dimensions</p></div></div>
        <div className="shape-flow">
          <div className="shape-node"><small>INPUT</small><b>[{batch}, {channels}, {height}, {width}]</b><span>{(Number(batch)*Number(channels)*Number(height)*Number(width)).toLocaleString()} values</span></div>
          <div className="shape-arrow"><span>{layerType === 'conv' ? 'CONVOLUTION' : 'POOLING'}</span><ArrowDownRight size={19}/></div>
          <div className={`shape-node shape-node-result ${!valid ? 'invalid' : ''}`}><small>OUTPUT</small><b>{valid ? `[${batch}, ${computedChannels}, ${outH}, ${outW}]` : 'Invalid dimensions'}</b><span>{valid ? `${flattened.toLocaleString()} features / sample` : 'Increase input size or reduce kernel/padding settings'}</span></div>
          {valid && <><div className="shape-arrow"><span>FLATTEN (START_DIM=1)</span><ArrowDownRight size={19}/></div><div className="shape-node shape-node-flat"><small>DENSE INPUT</small><b>[{batch}, {flattened}]</b><span>One feature vector per sample</span></div><div className="dense-preview"><span>OPTIONAL CLASSIFIER HEAD</span><div><b>{flattened.toLocaleString()}</b><i/><b>{classes}</b></div><small>nn.Linear({flattened}, {classes}) → logits shape [{batch}, {classes}]</small><div className="class-field"><label htmlFor="class-count">Output classes</label><input id="class-count" type="number" min="1" max="100000" value={classes} onChange={updateNumber(setClasses)}/></div></div></>}
        </div>
        <div className="formula-box"><div><span>SPATIAL OUTPUT FORMULA</span><code>floor((L + 2P − D(K − 1) − 1) / S + 1)</code></div><p>Applied independently to height and width. For pooling, the channel count stays the same.</p></div>
        <div className="lab-code-heading"><span><Code2 size={14}/> Matching PyTorch layer</span><button className="copy-button" onClick={() => onCopy(snippet, 'shape-lab-snippet')}>{copiedId === 'shape-lab-snippet' ? <Check size={13}/> : <Copy size={13}/>} {copiedId === 'shape-lab-snippet' ? 'Copied' : 'Copy code'}</button></div>
        <pre className="lab-code"><code>{snippet}</code></pre>
      </section>
    </div>
    <div className="lab-bottom-note"><BookOpen size={16}/><div><b>Why this lab matters</b><p>Shape errors often surface at the first dense layer after a convolutional stack. Compute the exact flattened feature count from your actual input and spatial operations, rather than guessing.</p></div><button onClick={() => { window.dispatchEvent(new CustomEvent('atlas-open-topic', { detail: 'cnn' })); }}>Read the CNN chapter <ArrowRight size={14}/></button></div>
  </div>;
}

function SlidersHorizontalIcon() { return <Activity size={17}/>; }
function NumberField({ label, value, onChange, min = 0 }) {
  return <label className="lab-field"><span>{label}</span><input type="number" value={value} min={min} step={1} onChange={onChange} /></label>;
}

function LearningPath({ onSelect }) {
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pytorch-atlas-roadmap') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('pytorch-atlas-roadmap', JSON.stringify(completed)); }, [completed]);
  const tracks = [
    { name: '01 / Foundations', subtitle: 'Build reliable tensor intuition.', accent: 'orange', ids: ['installation', 'tensor-basics', 'shapes-dtypes', 'tensor-ops', 'devices', 'linear-algebra', 'memory-layout', 'interop'] },
    { name: '02 / Training practice', subtitle: 'Build a complete training pipeline.', accent: 'green', ids: ['models-modules', 'datasets-loaders', 'advanced-data', 'transforms', 'losses', 'optimizers', 'schedulers-clipping', 'training-loop', 'evaluation', 'save-load', 'initialization', 'regularization', 'randomness', 'reproducibility'] },
    { name: '03 / Deep learning', subtitle: 'Learn architectures and gradient mechanics.', accent: 'purple', ids: ['autograd', 'custom-autograd', 'torch-func', 'advanced-nn', 'mlp', 'cnn', 'sequence-models', 'transformers', 'mixed-precision'] },
    { name: '04 / Systems & scale', subtitle: 'Optimize, ship, and scale responsibly.', accent: 'blue', ids: ['debugging', 'testing-profiling', 'performance', 'cuda-engineering', 'compile', 'distributed', 'distributed-patterns', 'distributed-fsdp', 'quantization-torchao', 'fx-graphs', 'onnx-export', 'cpp-extensions', 'deployment', 'torchvision-ecosystem', 'audio-text-ecosystem', 'rl-rec-systems'] },
  ].map((track) => ({ ...track, topics: track.ids.map((id) => topicById[id]).filter(Boolean) }));
  const total = tracks.reduce((sum, track) => sum + track.topics.length, 0);
  const count = completed.filter((id) => topics.some((topic) => topic.id === id)).length;
  const toggle = (id) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <div className="content-page roadmap-page">
    <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13}/><b>Learning path</b></div>
    <div className="article-eyebrow"><span className="eyebrow-dot orange-dot"/> A SELF-PACED CURRICULUM</div><h1>From first tensor to systems engineer.</h1><p className="article-lede page-lede">A flexible path through the reference. Mark chapters as you finish them; your progress is stored locally in this browser.</p>
    <div className="roadmap-progress"><div className="roadmap-progress-head"><div><span>YOUR LEARNING PROGRESS</span><h2>{count} <small>/ {total} topics completed</small></h2></div><b>{Math.round((count / Math.max(total, 1)) * 100)}%</b></div><div className="roadmap-bar"><i style={{ width: `${(count / Math.max(total, 1)) * 100}%` }}/></div><div className="roadmap-progress-foot"><span>Check a chapter to track completion</span><button onClick={() => setCompleted([])}>Reset progress</button></div></div>
    <div className="roadmap-tracks">{tracks.map((track) => { const done = track.topics.filter((topic) => completed.includes(topic.id)).length; return <section className={`roadmap-track track-${track.accent}`} key={track.name}><div className="roadmap-track-head"><div><span>{track.name}</span><h2>{track.subtitle}</h2></div><b>{done}/{track.topics.length}</b></div><div className="roadmap-topic-list">{track.topics.map((topic, index) => <div className={`roadmap-topic ${completed.includes(topic.id) ? 'is-complete' : ''}`} key={topic.id}><label><input type="checkbox" checked={completed.includes(topic.id)} onChange={() => toggle(topic.id)} aria-label={`Mark ${topic.title} complete`}/><span className="roadmap-topic-number">{String(index + 1).padStart(2, '0')}</span><span className="roadmap-topic-copy"><b>{topic.title}</b><small>{topic.level} · {topic.time}</small></span></label><button aria-label={`Read ${topic.title}`} onClick={() => onSelect(topic.id)}><ArrowRight size={14}/></button></div>)}</div></section>; })}</div>
    <div className="roadmap-note"><CircleHelp size={16}/><p><b>Suggested rhythm:</b> read the chapter, run its snippet, alter one input or parameter, and explain the output in your own words. For systems topics, make a small reproducible experiment before adopting a technique.</p></div>
  </div>;
}

function SourcesView() {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const entries = docsSnapshots.filter((item) => `${item.title} ${item.topic} ${item.summary}`.toLowerCase().includes(query));
  return <div className="content-page sources-page">
    <div className="breadcrumb"><span>Tensor Atlas</span><ChevronRight size={13}/><b>Sources & documentation sync</b></div>
    <div className="article-eyebrow"><span className="eyebrow-dot blue-dot"/> RESEARCH PROVENANCE / DOCS PIPELINE</div><h1>Ground the guide in primary sources.</h1><p className="article-lede page-lede">This build uses Firecrawl-assisted research of official PyTorch documentation and 21st.dev UI patterns. Use the optional server-side sync command to refresh source snapshots using your own Firecrawl API key.</p>
    <div className="sources-hero-strip"><div className="source-metric"><b>{docsSnapshots.length}</b><span>Curated source pages</span></div><div className="source-metric"><b>{new Set(docsSnapshots.map((item) => new URL(item.url).hostname)).size}</b><span>Primary documentation hosts</span></div><div className="source-metric"><b>16 OCT 2026</b><span>Research baseline for this bundle</span></div></div>
    <section className="source-sync-card"><div className="source-sync-heading"><span className="source-sync-icon"><Zap size={18}/></span><div><h2>Refresh with Firecrawl</h2><p>API keys stay on your local server-side script; they are never bundled into browser JavaScript.</p></div></div><ol><li>Copy <code>.env.example</code> to <code>.env</code> and put your own Firecrawl key in <code>FIRECRAWL_API_KEY</code>.</li><li>Run <code>npm run docs:sync</code> from the project folder with Node.js 20.6+ (for <code>--env-file</code> support).</li><li>The script scrapes a curated list of official docs into <code>src/docs-snapshots.json</code>. Review the result before rebuilding or publishing.</li></ol><div className="source-command"><code>npm run docs:sync</code><span>Optional · API usage may consume Firecrawl credits</span></div><div className="source-links"><a href="https://docs.firecrawl.dev/api-reference/endpoint/scrape" target="_blank" rel="noreferrer">Firecrawl scrape API <ExternalLink size={13}/></a><a href="https://docs.pytorch.org/docs/stable/" target="_blank" rel="noreferrer">PyTorch stable docs <ExternalLink size={13}/></a><a href="https://21st.dev/" target="_blank" rel="noreferrer">21st.dev component library <ExternalLink size={13}/></a></div></section>
    <div className="source-search"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search source topics…" aria-label="Search documentation sources"/>{search && <button onClick={() => setSearch('')}><X size={14}/></button>}<span>{entries.length} pages</span></div>
    <div className="sources-grid">{entries.map((item) => <article className="source-card" key={item.url}><div className="source-card-top"><span><BookOpen size={15}/>{item.topic}</span><small>{item.checkedAt || 'Refreshable'}</small></div><h2>{item.title}</h2><p>{item.summary}</p><a href={item.url} target="_blank" rel="noreferrer">Read official page <ArrowRight size={13}/></a></article>)}</div>
    <div className="source-disclaimer"><ShieldCheck size={16}/><p><b>Source-of-truth policy:</b> this site paraphrases technical documentation and links to original sources. Snapshot summaries can become stale; confirm version-sensitive behavior in the current official documentation. The Firecrawl sync refreshes snapshots, it does not automatically certify every tutorial/example as correct.</p></div>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
