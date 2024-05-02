/*****************************************************************************
 * @FilePath    : src/App.tsx                                                *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import 'react';
import { Routes, Route } from "react-router-dom";
import OverfloatWindow from "./components/OverfloatWindow/OverfloatWindow";

// Import all module windows based on the file structure
const ROUTES : Record<string, any> =  import.meta.glob('../overfloat_modules/*/*.tsx', { eager: true});
const SUB_ROUTES : Record<string, any>= import.meta.glob('../overfloat_modules/*/subwindows/*.tsx', { eager: true});

// Create routes for main windows of all modules based on the file structure
const routes = Object.keys(ROUTES).map((route) => {
  const path = route.replace(/..\/overfloat_modules\/([^/]*)\/.*.tsx/g, '/module/$1');
  return { path, Element: ROUTES[route].default} 
})

// Export module names so that the app can access them.
export const MODULE_NAMES = Object.keys(ROUTES).map((route) => {
  return route.replace(/..\/overfloat_modules\/([^/]*)\/.*.tsx/g, '$1');
});

// Create routes for subwindows of all modules based on the file structure
const subroutes = Object.keys(SUB_ROUTES).map((route) => {
    const path = route.replace(/..\/overfloat_modules\/([^/]*)\/subwindows\/([^/]*).tsx/g, '/module/$1/$2');
    return {path, Element: SUB_ROUTES[route].default}
})

/**
 * React component for the main application.
 */
const App = () => {
  return (
    <Routes>
      {/* Set up the route for the main application window */}
      <Route path="/overfloat" element={<OverfloatWindow />} />

      {/* Set up the routes for the module windows */}
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
