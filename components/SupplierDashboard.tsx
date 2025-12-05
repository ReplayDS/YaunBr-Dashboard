import React, { useState } from 'react';
import { useMockBackend } from '../services/MockBackendContext';
import { Layout } from './Layout';
import { DICTIONARY } from '../constants';
import { OrderStatus, Order } from '../types';
import { Clipboard, Truck, AlertCircle, Camera, CheckCircle, Wallet, Globe } from 'lucide-react';

export const SupplierDashboard: React.FC = () => {
  const { currentUser, orders, updateOrder, transactions, requestWithdrawal, getSupplierStats } = useMockBackend();
  const [lang, setLang] = useState<'pt' | 'zh'>('zh'); 
  const [activeTab, setActiveTab] = useState<'orders' | 'finance'>('orders');
  
  // States for uploading shipment info
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [shipmentPhotos, setShipmentPhotos] = useState<string[]>([]);
  
  const dict = DICTIONARY[lang];

  if (!currentUser?.isApproved) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} />
                </div>
                <h1 className="text-xl font-bold mb-2 text-gray-900">{dict.waitingApproval}</h1>
                <p className="text-gray-500">{dict.yourAccountPending}</p>
                <button onClick={() => setLang(l => l === 'pt' ? 'zh' : 'pt')} className="mt-6 text-red-600 font-medium flex items-center justify-center gap-2 mx-auto">
                    <Globe size={16} /> {lang === 'pt' ? 'Mudar para Chinês' : 'Switch to Portuguese'}
                </button>
            </div>
        </div>
    );
  }

  const stats = getSupplierStats(currentUser.id);
  const myOrders = orders.filter(o => o.supplierId === currentUser.id);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(dict.copied);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setShipmentPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const submitShipment = () => {
    if (selectedOrderForShipment && trackingCode && shipmentPhotos.length > 0) {
        updateOrder(selectedOrderForShipment, {
            status: OrderStatus.SENT,
            trackingCode,
            shippingPhotos: shipmentPhotos
        });
        setSelectedOrderForShipment(null);
        setTrackingCode('');
        setShipmentPhotos([]);
    }
  };

  return (
    <Layout title={dict.supplierPanel} lang={lang}>
      {/* Top Bar with Language Toggle & ID */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
         <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">{dict.myId}</span>
            <span className="text-lg font-bold text-gray-900 font-mono tracking-wider">{currentUser.supplierId}</span>
            <button onClick={() => copyToClipboard(currentUser.supplierId || '')} className="text-red-600 hover:text-red-800">
                <Clipboard size={18} />
            </button>
         </div>
         <button 
            onClick={() => setLang(l => l === 'pt' ? 'zh' : 'pt')} 
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
         >
            <Globe size={18} /> {lang === 'pt' ? '中文' : 'Português'}
         </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-600"><Truck size={48} /></div>
            <p className="text-gray-500 text-sm font-medium">{dict.pendingShipment}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-orange-600"><Wallet size={48} /></div>
             <p className="text-gray-500 text-sm font-medium">{dict.totalRelease}</p>
             <h3 className="text-3xl font-bold text-gray-900 mt-1">¥ {stats.toRelease.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-green-600"><CheckCircle size={48} /></div>
             <p className="text-gray-500 text-sm font-medium">{dict.receivedToday}</p>
             <h3 className="text-3xl font-bold text-green-600 mt-1">¥ {stats.receivedToday.toFixed(2)}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
         <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'orders' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
            {dict.orders}
         </button>
         <button 
            onClick={() => setActiveTab('finance')}
            className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'finance' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
            {dict.finance}
         </button>
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4">
            {myOrders.length === 0 ? <p className="text-center text-gray-500 py-10">{dict.noOrders}</p> : myOrders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {dict[order.status.toLowerCase() as keyof typeof dict] || order.status}
                                </span>
                                <span className="text-gray-400 text-sm">#{order.id}</span>
                            </div>
                            <h4 className="font-bold text-lg">{order.clientName}</h4>
                            <p className="text-sm text-gray-500">{order.description}</p>
                        </div>
                        <div className="text-right mt-2 md:mt-0">
                            <span className="block text-2xl font-bold text-gray-900">¥ {order.valueYuan}</span>
                            <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {order.status === OrderStatus.PENDING && (
                        <button 
                            onClick={() => setSelectedOrderForShipment(order.id)}
                            className="w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Truck size={18} /> {dict.pendingShipment} - {dict.uploadPhotos}
                        </button>
                    )}
                    
                    {order.status === OrderStatus.DISPUTE && (
                        <div className="bg-red-50 p-4 rounded-lg text-red-700 text-sm">
                            <strong>{dict.dispute}:</strong> {order.disputeReason}
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500 font-medium mb-1">{dict.available}</p>
                <h2 className="text-5xl font-bold text-gray-900 mb-6">¥ {stats.available.toFixed(2)}</h2>
                
                <button 
                    onClick={() => {
                        if (stats.available > 0) {
                            requestWithdrawal(stats.available);
                            alert(dict.requestSuccess);
                        }
                    }}
                    disabled={stats.available <= 0}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    {dict.withdraw}
                </button>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">{dict.history}</h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.filter(t => t.supplierId === currentUser.id).map(t => (
                                <tr key={t.id}>
                                    <td className="px-6 py-4">{t.type}</td>
                                    <td className={`px-6 py-4 font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'WITHDRAWAL' ? '-' : '+'} ¥ {t.amountYuan}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            t.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            t.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Shipment Modal */}
      {selectedOrderForShipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">{dict.uploadPhotos}</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{dict.trackingCode}</label>
                        <input 
                            type="text" 
                            className="w-full border rounded-lg p-2"
                            value={trackingCode}
                            onChange={e => setTrackingCode(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{dict.uploadPhotos}</label>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {shipmentPhotos.map((img, i) => (
                                <img key={i} src={img} className="w-16 h-16 object-cover rounded border" alt="" />
                            ))}
                            <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                <Camera size={20} className="text-gray-400" />
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setSelectedOrderForShipment(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{dict.cancel}</button>
                        <button onClick={submitShipment} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{dict.save}</button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </Layout>
  );
};