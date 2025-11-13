import { useState, useEffect } from 'react';
import './App.css';
import { getKanjiSVG } from '@/data';

function App() {
  const [kanji, setKanji] = useState('日');

  useEffect(() => {
    getKanjiSVG('日').then(svg => {
      if (svg) setKanji(svg);
    });
  }, []);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: kanji }} />
    </>
  );
}

export default App;
