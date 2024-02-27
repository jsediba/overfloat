import 'react';
import { Routes, Route } from "react-router-dom";
import Overfloat from './Overfloat';

const ROUTES =  import.meta.glob('../overfloat_modules/*/[a-z[]*.tsx', { eager: true});
const SUB_ROUTES = import.meta.glob('../overfloat_modules/*/subpages/[a-z[]*.tsx', { eager: true});



const routes = Object.keys(ROUTES).map((route) => {
  const path = route.replace(/..\/overfloat_modules\/(.*)\/.*.tsx/g, '/$1');
  console.log(typeof(ROUTES[route]))
  return { path, Element: ROUTES[route].default} 
})

const subroutes = Object.keys(SUB_ROUTES).map((route) => {
    const path = route.replace(/..\/overfloat_modules\/(.*)\/subpages\/(.*).tsx/g, '/$1/$2');
    return {path, Element: SUB_ROUTES[route].default}
})

console.log(subroutes)

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Overfloat />} />
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
