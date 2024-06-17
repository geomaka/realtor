import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {

  return (
    <>
    <Router>
        <Routes>
          <Route path = '/' element = {< AdminSignupForm />}/>
          <Route path='/:landlordID/tenants' element = {< Tenants />} />
          <Route path='/:landlordID/utilities' element = {< Utilities />} />
          <Route path='/:landlordID/delete-utility/:utilityID' element ={< Utilities />} />
          <Route path='/:landlordID/account' element = {<Account/>}/>
          <Route path='/:landlordID/payments-received' element = {<PaymentsReceived/>}/>
          <Route path='/:landlordID/tenant-info/:tenantID' element = {< TenantInfo />}/>
          <Route path='/signup' element = {< SignUp />} />
          <Route path='/:tenantID' element ={< Tenant />} />
          <Route path='/:tenantID/payments' element = {< Payments />} />
          <Route path='/:tenantID/my-account' element = {< TenantAccount />} />
          <Route path='/login' element = {< Login />} />
        </Routes>
    </Router>

    </>
  )
}

export default App
