import React from 'react'

const CardView = ({ cardDetails }) => {
  return (
    <div className="flex items-center">
    <div className="w-12 h-8 bg-gray-200 rounded mr-4 flex items-center justify-center">
      <span className="text-xs font-medium text-black">{cardDetails.cardBrand}</span>
    </div>
    <div>
      <p className="font-medium">{cardDetails.cardBrand} ending in {cardDetails.last4}</p>
      <p className="text-sm text-gray-500">Expires {cardDetails.expMonth}/{cardDetails.expYear}</p>
    </div>
  </div>
  )
}

export default CardView