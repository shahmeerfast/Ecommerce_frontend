import React from 'react'
import { assets } from '../assets/assets'
import mylogo from '../assets/mylogo.png'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <img src={mylogo} className='mb-5 w-32' alt="Logo" />
            <p className='w-full md:w-2/3 text-gray-600'>
            GBOGO MARKETPLACE is your one-stop destination for the latest trends in fashion. Discover a wide range of stylish clothing and accessories at unbeatable prices. Enjoy a seamless shopping experience, fast delivery, and top-notch customer support. Shop smart, shop easy!
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+92-212-456-7890</li>
                <li>contact@GBOGO MARKETPLACE.com</li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2024@ GBOGO MARKETPLACE - All Rights Reserved.</p>
        </div>

    </div>
  )
}

export default Footer
