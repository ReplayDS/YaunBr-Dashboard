import React, { useState } from 'react';
import { useMockBackend } from '../services/MockBackendContext';
import { Layout } from './Layout';
import { MOCK_EXCHANGE_RATE, DEFAULT_FEE_PERCENTAGE, DICTIONARY } from '../constants';
import { OrderStatus, Order } from '../types';
import { Calculator, Package, AlertCircle, Eye, Search, ArrowRight, Wallet, User as UserIcon, Type } from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { currentUser, orders, updateOrder, users, createOrder } = useMockBackend();
  const [amountYuan, setAmountYuan] = useState<number>(0);
  const [supplierIdInput, setSupplierIdInput] = useState('');
  const [activeTab, setActiveTab] = useState<'calculator' | 'orders'>('calculator');
  const [disputeModalOpen, setDisputeModalOpen] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [viewImagesModal, setViewImagesModal] = useState<string[] | null>(null);
  const [orderDesc, setOrderDesc] = useState('');

  const dict = DICTIONARY.pt;
  
  const myOrders = orders.filter(o => o.clientId === currentUser?.id);
  
  // Calculate Fee
  const clientFee = currentUser?.feePercentage || DEFAULT_FEE_PERCENTAGE;
  const valueInReal = amountYuan * MOCK_EXCHANGE_RATE;
  const totalReal = valueInReal * (1 + clientFee / 100);

  const handleCreateOrder = () => {
    if (!amountYuan || amountYuan <= 0) {
        alert("Digite um valor válido em Yuan.");
        return;
    }
    if (!supplierIdInput) {
        alert("Digite o ID do Fornecedor.");
        return;
    }
    if (!orderDesc) {
        alert("Digite uma descrição para o pedido.");
        return;
    }

    // Find supplier by the 6 digit code
    const supplier = users.find(u => u.supplierId === supplierIdInput);
    if (!supplier) {
        alert('Fornecedor não encontrado com este ID.');
        return;
    }
    
    createOrder({
        clientId: currentUser!.id,
        clientName: currentUser!.name,
        supplierId: supplier.id, // Link to actual UUID
        description: orderDesc,
        valueYuan: Number(amountYuan)
    });
    setOrderDesc('');
    setAmountYuan(0);
    setSupplierIdInput('');
    setActiveTab('orders');
    alert('Pedido criado com sucesso!');
  };

  const submitDispute = () => {
    if (disputeModalOpen && disputeReason) {
        updateOrder(disputeModalOpen, { status: OrderStatus.DISPUTE, disputeReason });
        setDisputeModalOpen(null);
        setDisputeReason('');
    }
  };

  return (
    <Layout title={dict.clientPanel}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 space-y-2">
            <button 
                onClick={() => setActiveTab('calculator')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'calculator' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
                <Calculator size={20} />
                <span className="font-medium">{dict.calculator}</span>
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
                <Package size={20} />
                <span className="font-medium">{dict.orders}</span>
            </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9">
            {activeTab === 'calculator' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Wallet className="text-red-600" /> Nova Transação
                    </h2>
                    
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* LEFT SIDE: Inputs & Action */}
                        <div className="flex-1 space-y-6">
                             {/* 1. Value Yuan */}
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Valor em Yuan (¥)</label>
                                <input 
                                    type="number" 
                                    value={amountYuan} 
                                    onChange={(e) => setAmountYuan(Number(e.target.value))}
                                    className="w-full text-2xl p-2 bg-transparent border-b-2 border-gray-300 focus:border-red-600 outline-none font-mono text-gray-900 placeholder-gray-300"
                                    placeholder="0.00"
                                />
                             </div>

                             {/* 2. Conversion Display */}
                             <div className="flex items-center justify-between px-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">Cotação</p>
                                    <p className="font-medium text-gray-700">{MOCK_EXCHANGE_RATE}</p>
                                </div>
                                <ArrowRight className="text-gray-300" />
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">Valor em Real</p>
                                    <p className="font-bold text-gray-900">R$ {valueInReal.toFixed(2)}</p>
                                </div>
                             </div>

                             {/* 3. Total + Tax */}
                             <div className="bg-red-50 p-6 rounded-xl border border-red-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600">
                                    <Wallet size={64} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between text-red-800 mb-2 text-sm">
                                        <span>Taxa de Serviço ({clientFee}%)</span>
                                        <span>+ R$ {(totalReal - valueInReal).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-red-200">
                                        <p className="text-xs font-bold text-red-500 uppercase">Total a Pagar</p>
                                        <p className="text-4xl font-bold text-red-700">R$ {totalReal.toFixed(2)}</p>
                                    </div>
                                </div>
                             </div>

                             {/* 4. Supplier ID */}
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                    <UserIcon size={14} /> ID do Fornecedor (Quem recebe)
                                </label>
                                <input 
                                    type="text" 
                                    value={supplierIdInput}
                                    onChange={e => setSupplierIdInput(e.target.value)}
                                    placeholder="Digite o ID de 6 dígitos"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    maxLength={6}
                                />
                             </div>

                             {/* 5. Description & Button */}
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                    <Type size={14} /> Descrição do Pedido
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Ex: Lote de Eletrônicos #44"
                                    className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                    value={orderDesc}
                                    onChange={e => setOrderDesc(e.target.value)}
                                />
                                
                                <button 
                                    onClick={handleCreateOrder}
                                    disabled={!supplierIdInput || !amountYuan || !orderDesc}
                                    className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center items-center gap-2"
                                >
                                    Criar Pedido <ArrowRight size={20} />
                                </button>
                             </div>
                        </div>

                        {/* RIGHT SIDE: Tutorial Only */}
                        <div className="lg:w-1/3 bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                <Search size={20} className="text-red-600"/> Como funciona?
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">1</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">Insira o Valor</h4>
                                        <p className="text-xs text-gray-500 mt-1">Coloque o valor exato em Yuan que precisa ser enviado ao fornecedor.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">2</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">Visualize o Total</h4>
                                        <p className="text-xs text-gray-500 mt-1">O sistema calcula automaticamente a conversão para Real e adiciona a nossa taxa de serviço de 5%.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">3</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">Identifique o Recebedor</h4>
                                        <p className="text-xs text-gray-500 mt-1">Peça o <strong>ID de 6 dígitos</strong> ao seu fornecedor e insira no campo indicado.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">4</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">Finalize</h4>
                                        <p className="text-xs text-gray-500 mt-1">Adicione uma descrição para controle e clique em Criar Pedido. O fornecedor será notificado instantaneamente.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                <p className="text-xs text-gray-400">Dúvidas? Entre em contato com o suporte YuanBR.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{dict.orders}</h2>
                    
                    {myOrders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                            <Package className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500">{dict.noOrders}</p>
                        </div>
                    ) : (
                        myOrders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : ''}
                                            ${order.status === OrderStatus.SENT ? 'bg-blue-100 text-blue-700' : ''}
                                            ${order.status === OrderStatus.FINALIZED ? 'bg-green-100 text-green-700' : ''}
                                            ${order.status === OrderStatus.DISPUTE ? 'bg-red-100 text-red-700' : ''}
                                        `}>
                                            {dict[order.status.toLowerCase() as keyof typeof dict] || order.status}
                                        </span>
                                        <span className="text-sm text-gray-400">#{order.id.toUpperCase()}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900">{order.description}</h3>
                                    <p className="text-sm text-gray-500">Valor: <span className="text-gray-900 font-medium">¥ {order.valueYuan}</span></p>
                                    
                                    {order.trackingCode && (
                                        <p className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                                            Rastreio: {order.trackingCode}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    {order.shippingPhotos && order.shippingPhotos.length > 0 && (
                                        <button 
                                            onClick={() => setViewImagesModal(order.shippingPhotos!)}
                                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye size={16} /> Fotos
                                        </button>
                                    )}
                                    
                                    {order.status !== OrderStatus.DISPUTE && order.status !== OrderStatus.PENDING && (
                                        <button 
                                            onClick={() => setDisputeModalOpen(order.id)}
                                            className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <AlertCircle size={16} /> {dict.dispute}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">{dict.submitDispute}</h3>
                <textarea 
                    className="w-full border rounded-lg p-3 h-32 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Descreva o motivo da disputa..."
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setDisputeModalOpen(null)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        {dict.cancel}
                    </button>
                    <button 
                        onClick={submitDispute}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        {dict.confirm}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Images Modal */}
      {viewImagesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setViewImagesModal(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full p-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-4">
                    {viewImagesModal.map((img, idx) => (
                        <img key={idx} src={img} alt={`Proof ${idx}`} className="w-full rounded-lg object-cover" />
                    ))}
                </div>
                <button 
                    onClick={() => setViewImagesModal(null)}
                    className="mt-4 w-full py-2 bg-gray-100 rounded-lg font-medium"
                >
                    Fechar
                </button>
            </div>
        </div>
      )}

    </Layout>
  );
};