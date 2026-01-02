import { useState } from 'react';
import styles from './App.module.css';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');
    setCopied(false);

    try {
      const res = await fetch('http://localhost:3000/api/v1/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ long_url: longUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        // Check if error is array (zod)
        if (Array.isArray(data.error)) {
          throw new Error(data.error[0].message || 'Invalid URL');
        }
        throw new Error(data.error || 'Failed to shorten');
      }
      setShortUrl(data.short_url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>TinyURL</h1>
        <p>Shorten your links with style</p>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="url"
              placeholder="Enter your long URL here..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? '...' : 'Shorten'}
            </button>
          </form>

          {error && <div className={styles.error}>{error}</div>}

          {shortUrl && (
            <div className={styles.result}>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Your shiny new link:</p>
              <div className={styles.shortUrlWrapper}>
                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {shortUrl}
                </a>
                <button
                  onClick={handleCopy}
                  className={styles.copyButton}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
