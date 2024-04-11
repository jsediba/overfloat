import 'react';
import { Routes, Route } from "react-router-dom";
import OverfloatWindow from "./components/OverfloatWindow/OverfloatWindow";


const ROUTES : Record<string, any> =  import.meta.glob('../overfloat_modules/*/*.tsx', { eager: true});
const SUB_ROUTES : Record<string, any>= import.meta.glob('../overfloat_modules/*/subwindows/*.tsx', { eager: true});



const routes = Object.keys(ROUTES).map((route) => {
  const path = route.replace(/..\/overfloat_modules\/([^/]*)\/.*.tsx/g, '/module/$1');
  console.log(path);
  return { path, Element: ROUTES[route].default} 
})

const subroutes = Object.keys(SUB_ROUTES).map((route) => {
    const path = route.replace(/..\/overfloat_modules\/([^/]*)\/subwindows\/([^/]*).tsx/g, '/module/$1/$2');
    console.log(path);
    return {path, Element: SUB_ROUTES[route].default}
})


const App = () => {
  return (
    <Routes>
      <Route path="/overfloat" element={<OverfloatWindow />} />
      {routes.map(({path, Element}) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
      {subroutes.map(({path, Element}) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
    </Routes>
  );
}

export default App;
