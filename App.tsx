
import React, { useState, useCallback } from 'react';
import { parseEmailContent } from './services/geminiService';
import { Contact } from './types';
import CopyButton from './components/CopyButton';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error(err);
      setError("An error occurred while parsing the text. Please check your API key and input.");
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

  // Format 2: Name, Email, Title, Phone (one per line)
  const contactListFormat = contacts
    .map(c => {
      const parts = [c.name, c.email, c.title, c.phone].filter(p => p.trim() !== '');
      return parts.join(', ');
    })
    .join('\n');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-block p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Email Contact Extractor</h1>
          <p className="text-slate-500 mt-2">Paste email headers or signatures to extract clean contact details instantly.</p>
        </header>

        <main className="space-y-8">
          {/* Input Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="email-input" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Paste Content
              </label>
              <button 
                onClick={handleClear}
                className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Clear All
              </button>
            </div>
            <textarea
              id="email-input"
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm placeholder:italic"
              placeholder="Paste email header (From, To, Cc, Subject...) or signatures here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleParse}
              disabled={isLoading || !inputText.trim()}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
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
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
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
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Recipient Format
                  </h2>
                  <CopyButton textToCopy={emailListFormat} label="Copy for Email" />
                </div>
                <div className="p-6">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm break-all leading-relaxed min-h-[60px]">
                    {emailListFormat}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Useful for pasting into To/Cc fields of your email client.</p>
                </div>
              </section>

              {/* Output 2: Detailed List */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Member Details
                  </h2>
                  <CopyButton textToCopy={contactListFormat} label="Copy Details" />
                </div>
                <div className="p-6">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm whitespace-pre-wrap leading-relaxed min-h-[60px]">
                    {contactListFormat}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">One person per line: Name, Email, Title, Phone.</p>
                </div>
              </section>

              {/* Raw Table View (Optional extra polish) */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Structured View
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contacts.map((contact, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{contact.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{contact.email || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{contact.title || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{contact.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>Powered by Gemini AI • Structured Contact Extraction</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
