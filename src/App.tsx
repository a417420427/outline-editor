import { ModalProvider } from './components/Modal/ModalContext';
import Layout from './layout';
import './styles/index.scss'



function App() {
 

 

 

  return (
   <ModalProvider>
   <Layout />
   </ModalProvider>
  );
}

export default App;
