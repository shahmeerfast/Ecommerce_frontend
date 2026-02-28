import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const LEVEL_BADGES = {
  new: '🌱',
  trusted: '🤝',
  premium: '👑',
};
const LEVEL_LABELS = {
  new: 'New',
  trusted: 'Trusted',
  premium: 'Premium',
};

const ProductItem = ({id,image,name,price,sellerLevel,sellerName}) => {
    
    const {currency} = useContext(ShopContext);

    // Fallback to 'new' if sellerLevel is missing or invalid
    const levelKey = (sellerLevel && LEVEL_BADGES[sellerLevel.toLowerCase()]) ? sellerLevel.toLowerCase() : 'new';
    const badge = LEVEL_BADGES[levelKey];
    const label = LEVEL_LABELS[levelKey];

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer block' to={`/product/${id}`}>
      <div className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200'>
        <div className='overflow-hidden'>
          <img className='w-full h-48 object-cover hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
        </div>
        <div className='p-3'>
          <p className='pb-1 text-sm'>
            {name}
            <span style={{ marginLeft: 8, fontSize: 16 }} title={label}>
              {badge}
              </span>
              <span style={{ marginLeft: 4, fontSize: 12, color: '#888', fontWeight: 500 }}>
              {label}
              </span>
          </p>
          <p className='text-sm font-medium'>{currency}{price.toFixed(2)}</p>
          {sellerName && (
            <p className='text-xs text-gray-500 mt-1'>By {sellerName}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductItem
