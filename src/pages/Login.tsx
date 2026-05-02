import { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  User, 
  ChevronRight, 
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    surname: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('surname', formData.surname.trim())
        .eq('password', formData.password)
        .single();

      if (error || !data) {
        throw new Error("Invalid surname or password.");
      }

      localStorage.setItem('currentStudent', JSON.stringify(data));
      navigate('/dashboard');
    } catch (error: any) {
      alert("Login Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-emerald-50 overflow-hidden">
      {/* Background Accents */}
      <div className="accent-blob bg-emerald-400 w-[500px] h-[500px] -top-32 -left-32" />
      <div className="accent-blob bg-amber-300 w-[600px] h-[600px] -bottom-48 -right-32 opacity-20" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[40px] flex flex-col md:flex-row overflow-hidden card-shadow min-h-[600px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-[350px] bg-emerald-900 p-8 md:p-12 flex flex-col justify-between text-white relative">
          <div className="space-y-10">
            <div className="w-12 h-12 bg-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black leading-tight tracking-tight">Student<br/>Login</h1>
              <p className="text-emerald-100/70 text-lg">Access your academic records and portal.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-300/50 text-xs font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Identity Verified Access</span>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-zinc-800">Welcome Back</h2>
            <p className="text-zinc-500 mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Surname</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="surname"
                  type="text"
                  required
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="Enter your surname"
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-emerald-200 group"
            >
              {loading ? "Authenticating..." : (
                <>
                  Login to Portal
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              Don't have an account? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Register your portal</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
