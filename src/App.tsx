import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { Dados } from './pages/Dados'
import { Mapa } from './pages/Mapa'
import { Graficos } from './pages/Graficos'

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dados" element={<Dados />} />
          <Route path="/graficos" element={<Graficos />} />
          <Route path="/mapa" element={<Mapa />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}