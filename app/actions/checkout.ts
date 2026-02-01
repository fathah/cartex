"use server";

import AddressDB, { CreateAddressData } from "@/db/address";
import CustomerDB from "@/db/customer";
import { revalidatePath } from "next/cache";

// MOCK: Hardcoded Customer ID for testing "Logged In" state.
// Set to undefined to simulate Guest.
const TEST_CUSTOMER_EMAIL = "john.doe@example.com"; 

export async function getCheckoutData() {
    let customer = null;
    
    // 1. Try to get logged in user from cookies/auth service
    // For now we will check if there is a hardcoded test user until full auth is wired
    const email = TEST_CUSTOMER_EMAIL; 

    if (email) {
        // Try finding existing first
        const existing = await CustomerDB.findByEmail(email);
        
        if (existing) {
            customer = existing;
        } else {
            // Create new if not found, but we need to match the type or returning object
            const newCustomer = await CustomerDB.create({
                firstName: "John",
                lastName: "Doe",
                email: email,
                phone: "+1 555 0199",
                isGuest: false
            });
            // Assign to customer variable, but we know it has no addresses yet
            customer = { ...newCustomer, addresses: [] };
        }
    }

    return {
        customer,
        addresses: customer ? customer.addresses : [],
    };
}

export async function saveAddress(data: CreateAddressData) {
    if (!data.customerId) {
        throw new Error("Customer ID required to save address");
    }

    const address = await AddressDB.create(data);
    revalidatePath("/checkout");
    return address;
}
