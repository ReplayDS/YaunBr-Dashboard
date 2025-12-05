import React, { useState } from 'react';
import { useMockBackend } from '../services/MockBackendContext';
import { UserRole } from '../types';
import { User, Lock, Mail, Phone, FileText, Upload, CreditCard } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register } = useMockBackend();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    cpf: '',
    qrCode: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const success = await login(formData.email, formData.password);
      if (!success) setError('Credenciais inválidas. Tente novamente.');
    } else {
      // Registration
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        setError('Preencha todos os campos obrigatórios.');
        return;
      }
      if (role === UserRole.CLIENT && !formData.cpf) {
        setError('CPF é obrigatório para clientes.');
        return;
      }
      if (role === UserRole.SUPPLIER && !formData.qrCode) {
        setError('Anexar o QRCode Alipay é obrigatório para fornecedores.');
        return;
      }

      await register({
        role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        cpf: role === UserRole.CLIENT ? formData.cpf : undefined,
        alipayQrCodeUrl: role === UserRole.SUPPLIER ? formData.qrCode : undefined,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, qrCode: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-red-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">YuanBR</h1>
          <p className="text-red-100">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</p>
        </div>

        <div className="p-8">
          {/* Role Toggle for Registration */}
          {!isLogin && (
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === UserRole.CLIENT ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setRole(UserRole.CLIENT)}
              >
                Cliente
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === UserRole.SUPPLIER ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setRole(UserRole.SUPPLIER)}
              >
                Fornecedor
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Nome Completo"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Telefone / WhatsApp"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            )}

            {!isLogin && role === UserRole.CLIENT && (
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="CPF"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
            )}

            {!isLogin && role === UserRole.SUPPLIER && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                <label className="cursor-pointer block">
                  <span className="block text-sm font-medium text-gray-700 mb-2">QRCode Alipay</span>
                  <div className="flex flex-col items-center justify-center">
                    {formData.qrCode ? (
                       <img src={formData.qrCode} alt="QR Preview" className="h-20 w-20 object-cover rounded mb-2" />
                    ) : (
                       <CreditCard className="text-gray-400 mb-1" size={32} />
                    )}
                    <span className="text-xs text-red-600">
                      {formData.qrCode ? 'Alterar foto' : 'Clique para enviar foto'}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Senha"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-red-200"
            >
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-red-600 hover:underline font-medium"
            >
              {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};