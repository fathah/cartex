import React from "react";
import { getAddresses } from "@/actions/addresses";
import AddressManager from "./AddressManager";

const AddressList = async () => {
  const addresses = await getAddresses();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Addresses</h1>
      <p className="text-gray-500 text-sm">
        Manage your saved addresses for fast and easy checkout across our
        marketplaces
      </p>

      <AddressManager addresses={addresses} />
    </div>
  );
};

export default AddressList;
