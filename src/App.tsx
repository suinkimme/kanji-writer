import './App.css';
import { Kanjiwriter } from '@/components';

function App() {
  return (
    <>
      <Kanjiwriter>日</Kanjiwriter>
      <Kanjiwriter size={200}>日</Kanjiwriter>
      <Kanjiwriter>日本語</Kanjiwriter>
    </>
  );
}

export default App;
