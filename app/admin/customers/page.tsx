import { getCustomers } from "@/actions/customers";
import CustomerList from "./customer-list";

export const dynamic = "force-dynamic";

const CustomersIndex = async () => {
  const { customers, total } = await getCustomers();

  return <CustomerList initialCustomers={customers} initialTotal={total} />;
};

export default CustomersIndex;
