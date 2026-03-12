import React from 'react';

const AddressForm = ({ formData, handleInputChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h3>
      
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
            <input 
              type="tel" 
              name="mobile"
              required
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
           <input 
             type="text" 
             name="address"
             required
             value={formData.address}
             onChange={handleInputChange}
             placeholder="123 Farm Lane, Apt 4B"
             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
           />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
            <input 
              type="text" 
              name="city"
              required
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
            <input 
              type="text" 
              name="state"
              required
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ZIP Code</label>
            <input 
              type="text" 
              name="zip"
              required
              value={formData.zip}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
