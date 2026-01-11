
import React, { useState, useEffect } from 'react';
import { parseEmailContent } from './services/geminiService';
import { Contact } from './types';
import CopyButton from './components/CopyButton';

type ViewFormat = 'simple' | 'bullet' | 'number';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewFormat, setViewFormat] = useState<ViewFormat>('simple');
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseEmailContent(inputText);
      setContacts(result.contacts);
      if (result.contacts.length === 0) {
        setError("No contacts could be extracted from the provided text.");
      }
    } catch (err: any) {
      console.error(err);
      // Show specific error message if available
      const errorMessage = err.message || "An unknown error occurred.";
      setError(`Error: ${errorMessage}. Please check your API key and internet connection.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setContacts([]);
    setError(null);
  };

  // Format 1: Name <email>; Name <email>;
  const emailListFormat = contacts
    .map(c => `${c.name} <${c.email}>`)
    .join('; ') + (contacts.length > 0 ? '; ' : '');

  // Generate content for Member Details based on format
  const getMemberDetailsContent = () => {
    // Basic part generation
    const entries = contacts.map(c => {
      // Logic: Name in Bold, Then title in Parenthesis, then email and last the phone
      const name = c.name.trim();
      const title = c.title.trim() ? `(${c.title.trim()})` : '';
      const email = c.email.trim();
      const phone = c.phone.trim();
      
      // We filter empty strings to avoid double spaces
      const parts = [title, email, phone].filter(p => p !== '');
      const details = parts.join(' ');
      
      return { name, details };
    });

    let html = '';
    let text = '';

    if (viewFormat === 'simple') {
      // Simple List: Just lines separated by empty line
      html = entries.map(e => `<div><b>${e.name}</b> ${e.details}</div>`).join('<br/><br/>'); // Extra break for empty line
      text = entries.map(e => `${e.name} ${e.details}`).join('\n\n');
    } else if (viewFormat === 'bullet') {
      // Bulleted List
      html = `<ul>${entries.map(e => `<li style="margin-bottom: 1em;"><b>${e.name}</b> ${e.details}</li>`).join('')}</ul>`;
      text = entries.map(e => `• ${e.name} ${e.details}`).join('\n\n');
    } else if (viewFormat === 'number') {
      // Numbered List
      html = `<ol>${entries.map(e => `<li style="margin-bottom: 1em;"><b>${e.name}</b> ${e.details}</li>`).join('')}</ol>`;
      text = entries.map((e, i) => `${i + 1}. ${e.name} ${e.details}`).join('\n\n');
    }

    return { html, text };
  };

  const { html: memberHtml, text: memberText } = getMemberDetailsContent();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto relative">
        {/* Theme Toggle Button */}
        <div className="absolute top-0 right-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>

        <header className="mb-10 text-center">
          <div className="inline-block p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Email Contact Extractor</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Paste email headers or signatures to extract clean contact details instantly.</p>
        </header>

        <main className="space-y-8">
          {/* Input Section */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="email-input" className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Paste Content
              </label>
              <button 
                onClick={handleClear}
                className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Clear All
              </button>
            </div>
            <textarea
              id="email-input"
              className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm placeholder:italic placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
              placeholder="Paste email header (From, To, Cc, Subject...) or signatures here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleParse}
              disabled={isLoading || !inputText.trim()}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Parsing Content...
                </>
              ) : (
                'Extract Contacts'
              )}
            </button>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 break-all">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </section>

          {/* Results Section */}
          {contacts.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Output 1: Semicolon list */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Recipient Format
                  </h2>
                  <CopyButton textToCopy={emailListFormat} label="Copy for Email" />
                </div>
                <div className="p-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm break-all leading-relaxed min-h-[60px] text-slate-800 dark:text-slate-200">
                    {emailListFormat}
                  </div>
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Useful for pasting into To/Cc fields of your email client.</p>
                </div>
              </section>

              {/* Output 2: Detailed List with Toggles */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider self-start sm:self-center">
                    Member Details
                  </h2>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {/* View Toggles */}
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                      <button
                        onClick={() => setViewFormat('simple')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          viewFormat === 'simple' 
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title="Simple List"
                      >
                        Simple
                      </button>
                      <button
                        onClick={() => setViewFormat('bullet')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          viewFormat === 'bullet' 
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title="Bulleted List"
                      >
                        Bullet
                      </button>
                      <button
                        onClick={() => setViewFormat('number')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          viewFormat === 'number' 
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title="Numbered List"
                      >
                        Number
                      </button>
                    </div>

                    <CopyButton textToCopy={memberText} htmlToCopy={memberHtml} label="Copy Details" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm leading-relaxed min-h-[60px] text-slate-800 dark:text-slate-200">
                    {/* Render HTML content safely */}
                    <div 
                      className={`
                        ${viewFormat === 'bullet' ? 'list-disc pl-5' : ''}
                        ${viewFormat === 'number' ? 'list-decimal pl-5' : ''}
                      `}
                      dangerouslySetInnerHTML={{ __html: memberHtml }} 
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    Format: <b>Name</b> (Title) Email Phone. Copied text preserves bold formatting.
                  </p>
                </div>
              </section>

              {/* Raw Table View */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Structured View
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                        <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {contacts.map((contact, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200">{contact.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{contact.email || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{contact.title || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{contact.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-slate-400 dark:text-slate-600 text-sm">
          <p>Powered by Gemini AI • Structured Contact Extraction</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
