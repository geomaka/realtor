import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import AdminSignupForm from './adminSignup'
import Tenants from './tenants'
import Utilities from './utilities';
import SignUp from './signUp';
import Tenant from './tenant';
import Payments from './payments';
import Login from './login';
import Account from './account';
import PaymentsReceived from './paymentsRecieved';
import TenantAccount from './tenantAccount';
import TenantInfo from './tenantsInfo';
import HomePage from './homePage';
import ForgotPassword from './forgotPassword';
import ResetPassword from './resetPassword';


function App() {
  const isauthenticated = localStorage.getItem('accessToken')
  
  return (
    <>
    <Router>
        <Routes>
          <Route path='/' element = {< HomePage />} />
          <Route path = '/admin-signup' element = {< AdminSignupForm />}/>
          <Route path='/:landlordID/tenants' element = {isauthenticated ? < Tenants /> : <Navigate to={'/login'} replace />} />
          <Route path='/:landlordID/utilities' element = { isauthenticated ? < Utilities />: <Navigate to={'/login'} replace />} />
          <Route path='/:landlordID/delete-utility/:utilityID' element ={isauthenticated ?< Utilities /> : <Navigate to={'/login'} replace />} />
          <Route path='/:landlordID/account' element = {isauthenticated ? <Account/> : <Navigate to={'/login'} replace />}/>
          <Route path='/:landlordID/payments-received' element = {isauthenticated ? <PaymentsReceived/> : <Navigate to={'/login'} replace />}/>
          <Route path='/:landlordID/tenant-info/:tenantID' element = {isauthenticated ? < TenantInfo /> : <Navigate to={'/login'} replace />}/>
          <Route path='/signup' element = {< SignUp />} />
          <Route path='/:tenantID' element ={isauthenticated ? < Tenant /> : <Navigate to={'/login'} replace />} />
          <Route path='/:tenantID/payments' element = {isauthenticated ? < Payments /> : <Navigate to={'/login'} replace /> } />
          <Route path='/:tenantID/my-account' element = {isauthenticated ? < TenantAccount /> : <Navigate to={'/login'} replace />} />
          <Route path='/login' element = {< Login />} />
          <Route path='/login/forgot-password' element = {< ForgotPassword />} />
          <Route path='/login/reset-password/:uid/:token' element = {< ResetPassword />} />
        </Routes>
    </Router>

    </>
  )
}

export default App
