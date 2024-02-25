import 'react';
import { Routes, Route } from "react-router-dom";
import Central from './components/central';
import Counter from './components/counter';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Central />} />
      <Route path="/counter" element={<Counter/>} />
    </Routes>
  );
}

export default App;
