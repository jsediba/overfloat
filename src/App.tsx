import 'react';
import { Routes, Route } from "react-router-dom";
import Central from './components/central';
import Counter from './components/counter';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Central />} />
      <Route path="/counter_a" element={<Counter keybind="a"/>} />
      <Route path="/counter_s" element={<Counter keybind="s"/>} />
      <Route path="/counter_d" element={<Counter keybind="d"/>} />
      <Route path="/counter_f" element={<Counter keybind="f"/>} />
    </Routes>
  );
}

export default App;
