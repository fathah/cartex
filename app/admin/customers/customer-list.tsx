"use client";

import React, { useState } from 'react';
import { Table, Input, Badge, Button, Tag, Space, Avatar } from 'antd';
import { Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CustomerListProps {
  initialCustomers: any[];
  initialTotal: number;
}

export default function CustomerList({ initialCustomers, initialTotal }: CustomerListProps) {
  const [customers] = useState(initialCustomers);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
             <Avatar icon={<User size={16} />} className="bg-emerald-100 text-emerald-700" />
             <div>
                <div className="font-medium">
                    {record.firstName || record.lastName ? `${record.firstName || ''} ${record.lastName || ''}`.trim() : 'Unknown'}
                </div>
                <div className="text-xs text-gray-400">{record.email || 'No email'}</div>
            </div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'isGuest',
      key: 'isGuest',
      render: (isGuest: boolean) => (
        isGuest ? <Tag>Guest</Tag> : <Tag color="blue">Member</Tag>
      ),
    },
    {
      title: 'Orders',
      key: 'orders',
      render: (_: any, record: any) => record._count?.orders || 0,
    },
    {
       title: 'Phone',
       dataIndex: 'phone',
       key: 'phone',
       render: (phone: string) => phone || '-',
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div >
      

         <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Customers</h2>
            <div className="flex gap-2">
                 <Input prefix={<Search size={16} />} placeholder="Search customers..." className="w-64" />
            </div>
         </div>
         <Table 
            columns={columns} 
            dataSource={customers} 
            rowKey="id"
            pagination={{ total: initialTotal, pageSize: 10 }}
            loading={loading}
         />
     
    </div>
  );
}
