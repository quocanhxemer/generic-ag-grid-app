import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {routes.map((route, index) => {
          const Page = route.element;
          return <Route key={index} path={route.path} element={Page} />;
        })}
      </Routes>
    </Router>
  );
}
