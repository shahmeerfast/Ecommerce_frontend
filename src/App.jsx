import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import Profile from './pages/Profile'
import AddProduct from './pages/AddProduct'
import SellerDashboard from './pages/SellerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminRegister from './pages/AdminRegister'
import ProtectedRoute from './components/ProtectedRoute'
import Messages from './pages/Messages'
import SellerRegister from './pages/SellerRegister'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminPanelLayout from './components/adminpanel/AdminPanelLayout'
import AdminLogin from './pages/AdminLogin'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51QU6xbH9g4L5ebHEMCXVRSuHWfF9XfqcnvEfFfjEsNC4wiXZEf7uNZO2STqaGKj3kcLRxqIuGODhhhdS48dVtLwk00rJYUbZR3'); // Replace with your real Stripe publishable key

const App = () => {
  const location = useLocation();
  const adminPanelPaths = ['/admin/dashboard', '/admin/panel'];
  if (adminPanelPaths.includes(location.pathname)) {
    return <Routes>
      <Route path='/admin/dashboard' element={<ProtectedRoute role="admin"><AdminPanelLayout /></ProtectedRoute>} />
      <Route path='/admin/panel' element={<ProtectedRoute role="admin"><AdminPanelLayout /></ProtectedRoute>} />
    </Routes>;
  }
  return (
    <Elements stripe={stripePromise}>
      <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <ToastContainer />
        <Navbar />
        <SearchBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/seller/register' element={<SellerRegister />} />
          <Route path='/admin/register' element={<AdminRegister />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/register' element={<Register />} />
          <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path='/login' element={<Login />} />
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/add-product' element={<ProtectedRoute requireSeller={true}><AddProduct /></ProtectedRoute>} />
          <Route path='/seller/dashboard' element={<ProtectedRoute requireSeller={true}><SellerDashboard /></ProtectedRoute>} />
          <Route path='/messages' element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
        </Routes>
        <Footer />
      </div>
    </Elements>
  )
}

export default App
