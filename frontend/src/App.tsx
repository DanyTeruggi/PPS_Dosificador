import useIsDesktop from "./hooks/useIsDesktop";

import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import DesktopHomePage from "./pages/DesktopHomePage"; // versión escritorio
import LoginPage from "./pages/LoginPage";


// function App() {
//   return <RegisterPage />;
// }

// export default App;


function App() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <DesktopHomePage /> : <HomePage />;
}

export default App;