import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import './App.css'
import AppBar from './components/AppBar'
import { Button } from './components/ui/button'

function App() {

  return (
    <div className="">
      <AppBar />
      <section className='flex flex-col items-center justify-center h-[90vh]'>
        <h1 className='text-6xl font-bold'>Code, Create, Conquer</h1>
        <p className='text-pretty w-[40rem] text-center mt-3 text-gray-400 text-xl'>Your browser-based IDE for Python and JavaScript. Write, run, and share code in seconds. Experience the future of coding today.</p>
        <div className='flex mt-3'>
          <SignInButton>
            <Button className='bg-gray-800 hover:bg-gray-900 mx-3'>
              Get Started <span className='ml-2 text-xl mb-1'>&rarr;</span></Button>
          </SignInButton>
          <Button className='bg-gray-300 hover:bg-gray-400 text-gray-800 mx-3'>Learn More</Button>
        </div>
        <div className='flex items-center mt-2'>
          <p>4.9</p>
          <span className='text-yellow-400 text-lg mx-1'>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span className='text-gray-400 mx-1'>&#40;xk+ reviews&#41;</span>
          <div className='w-[1px] h-4 bg-gray-400 mx-2 mt-1' />
          <span className='text-gray-400 mx-1'>Used by xx,xxx+ developers</span>
        </div>
      </section>
      <section className='bg-gray-900 flex flex-col justify-center items-center py-24 px-20'>
        <h1 className='text-5xl text-blue-400 font-bold'>Features</h1>
        <div className='flex justify-between mt-14'>
          <span className='w-3/12'>
            <img src="/browser.png" className='h-10 mx-auto' alt="" />
            <h3 className='text-2xl font-bold text-center mt-2'>Browser-based IDE</h3>
            <p className='text-gray-400 text-center mt-1'>Code from anywhere, anytime. No installation required.</p>
          </span>
          <span className='w-3/12'>
            <img src="/laptop.png" className='h-10 mx-auto' alt="" />
            <h3 className='text-2xl font-bold text-center mt-2'>Python & JavaScript Support</h3>
            <p className='text-gray-400 text-center mt-1'>Write and run code in two of the most popular programming languages.</p>
          </span>
          <span className='w-3/12'>
            <img src="/bolt.png" className='h-10 mx-auto' alt="" />
            <h3 className='text-2xl font-bold text-center mt-2'>Instant Execution</h3>
            <p className='text-gray-400 text-center mt-1'>See your code come to life instantly with our lightning-fast execution engine.</p>
          </span>
        </div>
      </section>
      <section className='py-24 px-20'>
        <h1 className='text-5xl mx-auto text-blue-400 font-bold text-center'>Powerful Dashboard</h1>
        <p className='text-gray-400 text-center mt-5 text-xl'>Manage all your projects, track your progress, and access powerful tools<br />from a single, intuitive interface.</p>
        <img src="/laptop.png" className='h-60 mx-auto mt-4' alt="" />
      </section>
      <section className='py-24 px-20 bg-gray-900'>
        <h1 className='text-5xl mx-auto text-blue-400 font-bold text-center'>Pricing</h1>
        <div className='flex flex-wrap justify-between mt-10'>
          <div className='bg-gray-800 rounded-lg py-5 px-6 w-96'>
            <h3 className='text-2xl font-bold'>Free</h3>
            <p className='mt-4'><span className='text-blue-400 text-4xl font-bold'>$0</span>/month</p>
            <p className='mt-4'>Python & JavaScript support</p>
            <p className='mt-2'>5 projects</p>
            <Button className='mt-4 w-full'>Get Started<span className='ml-2 text-xl mb-1'>&rarr;</span></Button>
          </div>
          <div className='bg-gray-800 rounded-lg py-5 px-6 w-96 border-2 border-blue-400'>
            <h3 className='text-2xl font-bold'>Pro</h3>
            <p className='mt-4'><span className='text-blue-400 text-4xl font-bold'>$9</span>/month</p>
            <p className='mt-4'>Python & JavaScript support</p>
            <p className='mt-2'>15 projects</p>
            <Button className='mt-4 w-full'>Get Started<span className='ml-2 text-xl mb-1'>&rarr;</span></Button>
          </div>
          <div className='bg-gray-800 rounded-lg py-5 px-6 w-96'>
            <h3 className='text-2xl font-bold'>Enterprise</h3>
            <p className='mt-4'><span className='text-blue-400 text-4xl font-bold'>Custom</span></p>
            <p className='mt-4'>Python & JavaScript support</p>
            <p className='mt-2'>Unlimited projects</p>
            <Button className='mt-4 w-full'>Get Started<span className='ml-2 text-xl mb-1'>&rarr;</span></Button>
          </div>
        </div>
      </section>
      <footer className='py-36 flex flex-col'>
        <h1 className='text-5xl text-blue-400 mx-auto text-center font-bold'>Ready to Start Coding?</h1>
        <p className='text-gray-400 text-center mt-5 text-xl'>Join thousands of developers who are already using our platform<br />to bring their ideas to life.</p>
        <Button className='mx-auto mt-3 bg-gray-800 hover:bg-gray-900'>SignIn</Button>
      </footer>
    </div>
  )
}

export default App
