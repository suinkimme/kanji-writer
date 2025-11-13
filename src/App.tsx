import './App.css';
import { KanjiWriter } from '@/components';

function App() {
  return (
    <>
      <KanjiWriter value="日" />
      <KanjiWriter value="日" size={200} />
    </>
  );
}

export default App;
