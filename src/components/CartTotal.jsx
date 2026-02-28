import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = ({ deliveryFeeOverride }) => {
    const { currency, getCartAmount, getShippingFee } = useContext(ShopContext);
    const shippingFee = deliveryFeeOverride !== undefined && deliveryFeeOverride !== null ? Number(deliveryFeeOverride) : getShippingFee();
    const subtotal = getCartAmount();

    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text1={'CART'} text2={'TOTALS'} />
            </div>

            <div className='flex flex-col gap-2 mt-2 text-sm'>
                <div className='flex justify-between'>
                    <p>Subtotal</p>
                    <p>{currency} {subtotal.toFixed(2)}</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <p>Shipping Fee</p>
                    <p>{currency} {shippingFee.toFixed(2)}</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <b>Total</b>
                    <b>{currency} {(subtotal === 0 ? 0 : subtotal + shippingFee).toFixed(2)}</b>
                </div>
            </div>
        </div>
    )
}

export default CartTotal
