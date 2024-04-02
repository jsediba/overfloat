import 'react';
import { Routes, Route } from "react-router-dom";
import ModuleWindow from "./components/ModuleWindow/ModuleWindow";
import KeybindWindow from './components/KeybindWindow/KeybindWindow';


const ROUTES : Record<string, any> =  import.meta.glob('../overfloat_modules/*/[a-z[]*.tsx', { eager: true});
const SUB_ROUTES : Record<string, any>= import.meta.glob('../overfloat_modules/*/subpages/[a-z[]*.tsx', { eager: true});



const routes = Object.keys(ROUTES).map((route) => {
  const path = route.replace(/..\/overfloat_modules\/(.*)\/.*.tsx/g, '/module/$1');
  return { path, Element: ROUTES[route].default} 
})

const subroutes = Object.keys(SUB_ROUTES).map((route) => {
    const path = route.replace(/..\/overfloat_modules\/(.*)\/subpages\/(.*).tsx/g, '/module/$1/$2');
    return {path, Element: SUB_ROUTES[route].default}
})


const App = () => {
  return (
    <Routes>
      <Route path="/overfloat_modules" element={<ModuleWindow />} />
      <Route path="/overfloat_keybinds" element={<KeybindWindow />} />
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
