import './App.css';
import { Kanjiwriter } from '@/components';

function App() {
  return (
    <>
      <Kanjiwriter value="日" />
      <Kanjiwriter value="日" size={200} />
      <Kanjiwriter value="日本語" />
    </>
  );
}

export default App;
