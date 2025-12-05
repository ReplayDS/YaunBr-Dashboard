import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Order, OrderStatus, Transaction } from '../types';
import { DEFAULT_FEE_PERCENTAGE } from '../constants';

interface MockBackendContextType {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  transactions: Transaction[];
  login: (email: string, pass: string) => Promise<boolean>;
  register: (user: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  requestWithdrawal: (amount: number) => void;
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string) => void;
  getSupplierStats: (supplierId: string) => { pending: number; toRelease: number; receivedToday: number; receivedWeek: number; available: number };
}

const MockBackendContext = createContext<MockBackendContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_USERS: User[] = [
  { id: 'admin1', name: 'Master Admin', email: 'admin@test.com', password: '123', role: UserRole.ADMIN },
  { id: 'supp1', name: 'Wei Supplier', email: 'fornecedor@test.com', password: '123', role: UserRole.SUPPLIER, supplierId: '888888', isApproved: true, phone: '123456789' },
  { id: 'client1', name: 'João Silva', email: 'cliente@test.com', password: '123', role: UserRole.CLIENT, cpf: '123.456.789-00', feePercentage: 5, phone: '987654321' }
];

const INITIAL_ORDERS: Order[] = [
  { id: 'ord1', clientId: 'client1', clientName: 'João Silva', supplierId: 'supp1', description: 'Eletronics Batch A', valueYuan: 1000, status: OrderStatus.PENDING, createdAt: new Date().toISOString() },
  { id: 'ord2', clientId: 'client1', clientName: 'João Silva', supplierId: 'supp1', description: 'Clothes Bundle', valueYuan: 500, status: OrderStatus.SENT, trackingCode: 'CN123456789BR', createdAt: new Date(Date.now() - 86400000).toISOString() }
];

export const MockBackendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const login = async (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = async (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      role: userData.role || UserRole.CLIENT,
      // If supplier, generate random 6 digit ID
      supplierId: userData.role === UserRole.SUPPLIER ? Math.floor(100000 + Math.random() * 900000).toString() : undefined,
      isApproved: userData.role === UserRole.SUPPLIER ? false : true, // Suppliers need approval
      feePercentage: userData.role === UserRole.CLIENT ? DEFAULT_FEE_PERCENTAGE : undefined,
    } as User;
    setUsers([...users, newUser]);
    // Auto login after register for better UX (or redirect to login)
    // For supplier, if not approved, they will see waiting screen
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: OrderStatus.PENDING,
      ...orderData
    };
    setOrders([newOrder, ...orders]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const requestWithdrawal = (amount: number) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      supplierId: currentUser.id,
      supplierName: currentUser.name,
      amountYuan: amount,
      type: 'WITHDRAWAL',
      status: 'PENDING',
      date: new Date().toISOString()
    };
    setTransactions([newTx, ...transactions]);
  };

  const approveWithdrawal = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));
  };

  const rejectWithdrawal = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'REJECTED' } : t));
  };

  const getSupplierStats = (supplierUserId: string) => {
    // Note: In this data model, supplierId in User is the display code. 
    // But orders link to the User's primary ID (or we can map it).
    // Let's assume order.supplierId refers to User.id for simplicity in this logic
    const supplierOrders = orders.filter(o => o.supplierId === supplierUserId);
    
    const pending = supplierOrders.filter(o => o.status === OrderStatus.PENDING).length;
    
    // Total to release: Orders that are not finalized yet (money held)
    const toRelease = supplierOrders
      .filter(o => o.status !== OrderStatus.FINALIZED)
      .reduce((acc, curr) => acc + curr.valueYuan, 0);

    // Available: Orders finalized - withdrawals approved/pending
    const totalEarned = supplierOrders
      .filter(o => o.status === OrderStatus.FINALIZED)
      .reduce((acc, curr) => acc + curr.valueYuan, 0);
      
    const totalWithdrawn = transactions
      .filter(t => t.supplierId === supplierUserId && (t.status === 'APPROVED' || t.status === 'PENDING'))
      .reduce((acc, curr) => acc + curr.amountYuan, 0);
      
    const available = totalEarned - totalWithdrawn;

    const today = new Date().toISOString().split('T')[0];
    const receivedToday = supplierOrders
      .filter(o => o.createdAt.startsWith(today))
      .reduce((acc, curr) => acc + curr.valueYuan, 0);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const receivedWeek = supplierOrders
      .filter(o => new Date(o.createdAt) > oneWeekAgo)
      .reduce((acc, curr) => acc + curr.valueYuan, 0);

    return { pending, toRelease, receivedToday, receivedWeek, available };
  };

  return (
    <MockBackendContext.Provider value={{
      currentUser,
      users,
      orders,
      transactions,
      login,
      register,
      logout,
      updateUser,
      createOrder,
      updateOrder,
      requestWithdrawal,
      approveWithdrawal,
      rejectWithdrawal,
      getSupplierStats
    }}>
      {children}
    </MockBackendContext.Provider>
  );
};

export const useMockBackend = () => {
  const context = useContext(MockBackendContext);
  if (!context) throw new Error("useMockBackend must be used within MockBackendProvider");
  return context;
};