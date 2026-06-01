import './App.css';
import Routing from "./Routing/Routing";

import { SidebarProvider } from './Context/SidebarContext.js';

function App() {
  return (
    <SidebarProvider>
      <Routing />
    </SidebarProvider>
  );
}

export default App;
