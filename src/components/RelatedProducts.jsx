import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import axios from '../config/axios';

const RelatedProducts = ({category,subCategory}) => {

    const [related, setRelated] = useState([]);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const response = await axios.get('/api/product/list');
                let products = response.data.products || [];
                products = products.filter((item) => category === item.category);
                products = products.filter((item) => subCategory === item.subCategory);
                setRelated(products.slice(0, 5));
            } catch (error) {
                setRelated([]);
            }
        };
        fetchRelated();
    }, [category, subCategory]);

  return (
    <div className='my-24'>
      <div className=' text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={"PRODUCTS"} />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item, index) => (
            <ProductItem
                key={index}
                id={item._id}
                name={item.name}
                price={item.price}
                image={item.images || item.image}
                sellerLevel={item.seller?.level}
                sellerName={item.seller?.fullName || item.seller?.name || item.seller?.email}
            />
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
