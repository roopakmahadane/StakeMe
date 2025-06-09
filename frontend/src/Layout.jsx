import './App.css';
import Header from './components/Header';
import { Outlet } from 'react-router-dom';


export default function Layout() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <Header />
      <Outlet />
    </div>
  );
}