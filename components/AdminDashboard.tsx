import React, { useState } from 'react';
import { useMockBackend } from '../services/MockBackendContext';
import { Layout } from './Layout';
import { UserRole, User, Order } from '../types';
import { DICTIONARY } from '../constants';
import { Users, DollarSign, Package, Check, X, Search, Shield, Edit2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, orders, transactions, updateUser, approveWithdrawal, rejectWithdrawal } = useMockBackend();
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'finance' | 'clients'>('overview');
  const [viewUserOrders, setViewUserOrders] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const [editingFee, setEditingFee] = useState<{ userId: string, fee: number } | null>(null);

  const dict = DICTIONARY.pt;

  // Stats
  const pendingSuppliers = users.filter(u => u.role === UserRole.SUPPLIER && !u.isApproved);
  const pendingWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');
  
  const today = new Date().toISOString().split('T')[0];
  const transferredToday = transactions
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && t.date.startsWith(today))
    .reduce((acc, curr) => acc + curr.amountYuan, 0);

  const handleApproveSupplier = (id: string) => {
    updateUser(id, { isApproved: true });
  };

  const handleBlockUser = (id: string) => {
     if(window.confirm('Tem certeza que deseja bloquear este usuário?')) {
        updateUser(id, { isApproved: false });
     }
  };

  return (
    <Layout title={dict.adminPanel}>
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
            {[
                { id: 'overview', label: 'Visão Geral', icon: <Shield size={18}/> },
                { id: 'suppliers', label: 'Fornecedores', icon: <Users size={18}/> },
                { id: 'finance', label: 'Financeiro', icon: <DollarSign size={18}/> },
                { id: 'clients', label: 'Clientes', icon: <Users size={18}/> },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors font-medium ${activeTab === tab.id ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h3 className="text-gray-500 font-medium text-sm">Transferido Hoje</h3>
                    <p className="text-3xl font-bold text-red-600 mt-1">¥ {transferredToday.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h3 className="text-gray-500 font-medium text-sm">Fornecedores Pendentes</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{pendingSuppliers.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h3 className="text-gray-500 font-medium text-sm">Saques Pendentes</h3>
                    <p className="text-3xl font-bold text-red-600 mt-1">{pendingWithdrawals.length}</p>
                </div>
            </div>
        )}

        {activeTab === 'suppliers' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Gestão de Fornecedores</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.filter(u => u.role === UserRole.SUPPLIER).map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-700">{user.supplierId}</td>
                                <td className="px-6 py-4">
                                    {user.isApproved ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold border border-green-200">Ativo</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-bold border border-yellow-200">Pendente</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {!user.isApproved && (
                                            <>
                                                <button onClick={() => setShowQrCode(user.alipayQrCodeUrl || '')} className="p-2 text-gray-600 hover:bg-white hover:shadow border border-transparent hover:border-gray-200 rounded transition-all" title="Ver QR"><Search size={16}/></button>
                                                <button onClick={() => handleApproveSupplier(user.id)} className="p-2 text-green-600 hover:bg-white hover:shadow border border-transparent hover:border-green-200 rounded transition-all" title="Aprovar"><Check size={16}/></button>
                                            </>
                                        )}
                                        {user.isApproved && (
                                            <button onClick={() => handleBlockUser(user.id)} className="p-2 text-red-600 hover:bg-white hover:shadow border border-transparent hover:border-red-200 rounded transition-all" title="Bloquear"><X size={16}/></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'finance' && (
             <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Solicitações de Saque</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {transactions.length === 0 && <p className="p-6 text-gray-500 text-center italic">Nenhuma transação encontrada.</p>}
                    {transactions.map(tx => (
                        <div key={tx.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
                             <div>
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase mb-2 inline-block border ${tx.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : tx.status === 'APPROVED' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                    {tx.status}
                                </span>
                                <h4 className="font-bold text-gray-900 text-lg">{tx.supplierName}</h4>
                                <p className="text-sm text-gray-600">Solicitou saque de <span className="text-gray-900 font-bold bg-gray-100 px-1 rounded">¥ {tx.amountYuan}</span></p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(tx.date).toLocaleString()}</p>
                             </div>

                             {tx.status === 'PENDING' && (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            const user = users.find(u => u.id === tx.supplierId);
                                            setShowQrCode(user?.alipayQrCodeUrl || null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 hover:shadow-sm transition-all text-gray-700"
                                    >
                                        Ver QR Alipay
                                    </button>
                                    <button onClick={() => rejectWithdrawal(tx.id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-all">Recusar</button>
                                    <button onClick={() => approveWithdrawal(tx.id)} className="px-4 py-2 bg-green-600 text-white border border-green-700 rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm transition-all">Pagar & Aprovar</button>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
             </div>
        )}

        {activeTab === 'clients' && (
             <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                 <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Base de Clientes</h2>
                </div>
                 <table className="w-full text-left">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Contato</th>
                            <th className="px-6 py-4">Taxa (%)</th>
                            <th className="px-6 py-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.filter(u => u.role === UserRole.CLIENT).map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-0.5">{user.cpf}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{user.phone}</td>
                                <td className="px-6 py-4">
                                    {editingFee?.userId === user.id ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                className="w-16 border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-red-500"
                                                value={editingFee.fee}
                                                onChange={e => setEditingFee({...editingFee, fee: Number(e.target.value)})}
                                            />
                                            <button onClick={() => {
                                                updateUser(user.id, { feePercentage: editingFee.fee });
                                                setEditingFee(null);
                                            }} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check size={18}/></button>
                                        </div>
                                    ) : (
                                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 border border-gray-200">{user.feePercentage || 5}%</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setEditingFee({ userId: user.id, fee: user.feePercentage || 5 })} className="text-gray-500 hover:text-red-600 hover:bg-gray-100 p-2 rounded transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
        )}

        {/* QR Code Modal */}
        {showQrCode && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowQrCode(null)}>
                <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold mb-4 text-gray-800">QR Code Alipay</h3>
                    <div className="p-2 border border-gray-200 rounded-lg mb-4 bg-gray-50">
                        <img src={showQrCode} alt="Alipay QR" className="w-full rounded" />
                    </div>
                    <button onClick={() => setShowQrCode(null)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors">Fechar</button>
                </div>
            </div>
        )}
    </Layout>
  );
};