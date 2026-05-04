import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  User, 
  School, 
  MapPin, 
  Phone, 
  Calendar,
  GraduationCap,
  Mail,
  FileText,
  CreditCard,
  Key,
  ChevronRight,
  Save,
  CheckCircle,
  Menu,
  ShieldCheck,
  AlertCircle,
  Eye,
  ExternalLink,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Tab = 'info' | 'results' | 'fees' | 'password';

const CLASSES = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

export default function Dashboard() {
  const [student, setStudent] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    studentClass: '',
    homeAddress: ''
  });
  
  // Password state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedStudent = localStorage.getItem('currentStudent');
    if (savedStudent) {
      const data = JSON.parse(savedStudent);
      setStudent(data);
      setEditValues({
        studentClass: data.student_class,
        homeAddress: data.home_address
      });
      loadData(data);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadData = async (studentData: any) => {
    setLoading(true);
    try {
      // 1. Fetch Fees
      const { data: feesData } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentData.id);
      setFees(feesData || []);

      // 2. Fetch Results
      const { data: resultsData } = await supabase
        .from('results')
        .select('*')
        .eq('student_id', studentData.id);
      setResults(resultsData || []);

      // 3. Fetch Messages (Combined General + Specific)
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .or(`type.eq.general,student_id.eq.${studentData.id}`)
        .eq('school_code', studentData.school_code)
        .order('created_at', { ascending: false });
      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentStudent');
    navigate('/login');
  };

  const handleUpdate = async (column: string, value: string) => {
    setUpdating(column);
    try {
      const { error } = await supabase
        .from('students')
        .update({ [column]: value })
        .eq('id', student.id);

      if (error) throw error;

      // Update local state and storage
      const updatedStudent = { ...student, [column]: value };
      setStudent(updatedStudent);
      localStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
      alert("Field updated successfully!");
    } catch (error: any) {
      alert("Update failed: " + error.message);
    } finally {
      setUpdating(null);
    }
  };

  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const handlePasswordChange = async (e: any) => {
    e.preventDefault();
    if (passwordForm.oldPassword !== student.password) {
      alert("The current password you entered is incorrect.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({ password: passwordForm.newPassword })
        .eq('id', student.id);

      if (error) throw error;

      const updatedStudent = { ...student, password: passwordForm.newPassword };
      setStudent(updatedStudent);
      localStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
      
      alert("Password changed successfully!");
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert("Error updating password: " + error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-emerald-50 flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:relative z-50 h-full bg-emerald-900 text-white w-[300px] flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight">Student Portal</span>
          </div>

          <nav className="space-y-4">
            <NavItem 
              active={activeTab === 'info'} 
              onClick={() => { setActiveTab('info'); setIsSidebarOpen(false); }}
              icon={<User />} 
              label="Student Information" 
            />
            <NavItem 
              active={activeTab === 'results'} 
              onClick={() => { setActiveTab('results'); setIsSidebarOpen(false); }}
              icon={<FileText />} 
              label="Student Results" 
            />
            <NavItem 
              active={activeTab === 'fees'} 
              onClick={() => { setActiveTab('fees'); setIsSidebarOpen(false); }}
              icon={<CreditCard />} 
              label="Student Fees" 
            />
            <NavItem 
              active={activeTab === 'password'} 
              onClick={() => { setActiveTab('password'); setIsSidebarOpen(false); }}
              icon={<Key />} 
              label="Change Password" 
            />
          </nav>
        </div>

        <div className="mt-auto p-8 bg-emerald-950/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{student.first_name} {student.surname}</p>
              <p className="text-[10px] text-emerald-300/60 uppercase tracking-widest truncate">{student.student_class}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-emerald-50 rounded-lg text-emerald-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-black text-zinc-800 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Portal Version</p>
              <p className="text-xs font-bold text-emerald-600">v2024.1.2 GA</p>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-10 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Header Welcome */}
                <div className="bg-white p-10 rounded-[40px] card-shadow flex flex-col md:flex-row justify-between gap-8 border border-zinc-100">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-emerald-900 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-emerald-900/20">
                      <User className="w-10 h-10" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">Student Profile</span>
                      <h3 className="text-3xl font-black text-zinc-900 mt-2">
                        {student.first_name} {student.surname}
                      </h3>
                      <p className="text-zinc-400 font-medium mt-1 uppercase tracking-tighter">GATEWAY ID: GA-{student.id?.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[40px] card-shadow space-y-8 border border-zinc-100">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Personal Identity
                    </h4>
                    <div className="space-y-6">
                      <StaticItem label="Surname" value={student.surname} />
                      <StaticItem label="First Name" value={student.first_name} />
                      <StaticItem label="Other Name" value={student.other_name || 'N/A'} />
                      <StaticItem label="Gender" value={student.gender} />
                      <StaticItem label="Date of Birth" value={new Date(student.dob).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                      <StaticItem label="State of Origin" value={student.state_origin} />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[40px] card-shadow space-y-8 border border-zinc-100">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-4 flex items-center gap-2">
                      <School className="w-4 h-4 text-emerald-500" />
                      Portal Settings
                    </h4>
                    <div className="space-y-8">
                      <EditableItem 
                        label="Academic Class" 
                        icon={<School className="w-4 h-4" />}
                        value={
                          <select 
                            value={editValues.studentClass}
                            onChange={(e) => setEditValues(prev => ({ ...prev, studentClass: e.target.value }))}
                            className="w-full mt-2 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 outline-none focus:border-emerald-500 font-bold appearance-none transition-all"
                          >
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        }
                        onSave={() => handleUpdate('student_class', editValues.studentClass)}
                        loading={updating === 'student_class'}
                      />

                      <EditableItem 
                        label="Residential Address" 
                        icon={<MapPin className="w-4 h-4" />}
                        value={
                          <input 
                            type="text"
                            value={editValues.homeAddress}
                            onChange={(e) => setEditValues(prev => ({ ...prev, homeAddress: e.target.value }))}
                            className="w-full mt-2 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 outline-none focus:border-emerald-500 font-bold transition-all"
                          />
                        }
                        onSave={() => handleUpdate('home_address', editValues.homeAddress)}
                        loading={updating === 'home_address'}
                      />

                      <div className="p-6 bg-emerald-900 rounded-[32px] text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                           <Phone className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Phone className="w-4 h-4 text-emerald-400" />
                          </div>
                          <p className="text-sm font-bold">Contact Center</p>
                        </div>
                        <p className="text-2xl font-black relative z-10">{student.parent_phone}</p>
                        <p className="text-[10px] text-emerald-300 uppercase tracking-widest mt-1 opacity-60">Verified Guardian Account</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notice Board */}
                <div className="bg-white p-8 rounded-[40px] card-shadow border border-zinc-100">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-emerald-500" />
                    Notice Board
                  </h4>
                  <div className="mt-6 space-y-4">
                    {messages.length > 0 ? messages.map((msg: any) => (
                      <div key={msg.id} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${msg.type === 'general' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {msg.type}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold">{new Date(msg.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-bold text-zinc-800">{msg.content}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-zinc-400 font-medium italic">No new notices from the admin.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'results' ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white p-10 rounded-[40px] card-shadow border border-zinc-100">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-3xl font-black text-zinc-900">Academic Records</h3>
                      <p className="text-zinc-500 font-medium">Official performance reports for 2024 Session</p>
                    </div>
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {results.length > 0 ? results.map((res: any) => (
                      <div key={res.id} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center justify-between hover:border-emerald-200 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-800">{res.term} Result - {res.session}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{res.academic_class}</span>
                               <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                               <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Score: {res.final_score || 'N/A'}{res.final_score ? '%' : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={res.pdf_url ? () => setSelectedPdf({ url: res.pdf_url, title: `${res.term} Result` }) : () => alert("Digital copy pending...")}
                            className="bg-white hover:bg-emerald-500 hover:text-white text-zinc-600 font-bold py-3 px-6 rounded-xl transition-all border border-zinc-200 hover:border-emerald-500 flex items-center gap-2 text-xs shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Result
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20 px-10 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                        <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8" />
                        </div>
                        <p className="text-zinc-500 font-bold">No academic results published yet.</p>
                        <p className="text-xs text-zinc-400 mt-1">Please check back after the term examinations.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'password' ? (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white p-10 rounded-[40px] card-shadow border border-zinc-100">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center">
                      <Key className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-zinc-900">Security Settings</h3>
                      <p className="text-zinc-500 font-medium">Update your portal access credentials</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Current Password</label>
                       <input 
                         type="password"
                         required
                         value={passwordForm.oldPassword}
                         onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                         placeholder="Type current password"
                         className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">New Password</label>
                       <input 
                         type="password"
                         required
                         value={passwordForm.newPassword}
                         onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                         placeholder="Min. 6 characters"
                         className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Confirm New Password</label>
                       <input 
                         type="password"
                         required
                         value={passwordForm.confirmPassword}
                         onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                         placeholder="Repeat new password"
                         className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium"
                       />
                    </div>

                    <button 
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                    >
                      {passwordLoading ? 'Updating credentials...' : (
                        <>
                          Update Portal Password
                          <CheckCircle className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : activeTab === 'fees' ? (
              <motion.div
                key="fees"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Fee Status Card */}
                <div className="bg-white p-10 rounded-[40px] card-shadow border border-zinc-100 flex items-center justify-between overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">Account Status: {fees.reduce((sum, f) => sum + (f.items?.reduce((s: number, i: any) => s + i.price, 0) || 0), 0) > 0 ? 'Action Required' : 'Cleared'}</span>
                    <h3 className="text-3xl font-black text-zinc-900 mt-3">Portal Balance</h3>
                    <p className="text-5xl font-black text-zinc-900 mt-4">
                      ₦{fees.reduce((sum, f) => sum + (f.items?.reduce((s: number, i: any) => s + i.price, 0) || 0), 0).toLocaleString()}
                    </p>
                    <p className={`font-bold mt-2 flex items-center gap-2 ${fees.reduce((sum, f) => sum + (f.items?.reduce((s: number, i: any) => s + i.price, 0) || 0), 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {fees.reduce((sum, f) => sum + (f.items?.reduce((s: number, i: any) => s + i.price, 0) || 0), 0) > 0 ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Outstanding payments for 2024 Session
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          No outstanding payments for 2024 Session
                        </>
                      )}
                    </p>
                  </div>
                  <div className="hidden md:flex w-24 h-24 bg-emerald-100 rounded-[32px] items-center justify-center text-emerald-500 shrink-0">
                    <CreditCard className="w-10 h-10" />
                  </div>
                </div>

                {/* Document Hub */}
                <div className="bg-white p-8 rounded-[40px] card-shadow border border-zinc-100">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-black text-zinc-800">Fee Documentation</h4>
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Digital Vault</div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Dynamic Fees */}
                    {fees.length > 0 ? fees.map((fee, i) => {
                      const feeTotal = fee.items ? fee.items.reduce((sum: number, item: any) => sum + item.price, 0) : 0;
                      return (
                        <div 
                          key={fee.id || i} 
                          onClick={() => fee.pdf_url ? setSelectedPdf({ url: fee.pdf_url, title: fee.description }) : setSelectedReceipt(fee)}
                          className="flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100 hover:border-emerald-200 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                              {fee.pdf_url ? <FileText className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                                {fee.pdf_url ? 'PDF DOCUMENT' : 'DIGITAL RECEIPT'}
                              </div>
                              <p className="font-bold text-zinc-800">{fee.description || 'Fee Record'}</p>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
                                {feeTotal > 0 ? `₦${feeTotal.toLocaleString()}` : 'Click to View'}
                              </p>
                            </div>
                          </div>
                          <div className="text-zinc-300">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-20 px-10 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                        <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="w-8 h-8" />
                        </div>
                        <p className="text-zinc-500 font-bold">No fee records assigned to your portal yet.</p>
                        <p className="text-xs text-zinc-400 mt-1">Assignments will appear here once processed.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] card-shadow"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-300 mb-6">
                  {activeTab === 'results' && <FileText className="w-10 h-10" />}
                  {activeTab === 'fees' && <CreditCard className="w-10 h-10" />}
                  {activeTab === 'password' && <Key className="w-10 h-10" />}
                </div>
                <h3 className="text-2xl font-black text-zinc-800 capitalize">{activeTab} Hub</h3>
                <p className="text-zinc-500 mt-2 max-w-md mx-auto leading-relaxed">
                  The {activeTab} module is currently being synchronized with our academic servers. Please check back shortly for updates.
                </p>
                <button className="mt-8 bg-emerald-500 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-sm">
                  Refresh Module
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full h-full max-w-6xl rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 md:px-10 flex items-center justify-between border-b border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-zinc-900 truncate max-w-[200px] md:max-w-md">{selectedPdf.title}</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Official Portal Viewer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    href={selectedPdf.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hidden md:flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 px-6 rounded-xl transition-all text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Full Screen
                  </a>
                  <button 
                    onClick={() => setSelectedPdf(null)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-6 rounded-xl transition-all text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-zinc-900/5 p-4 md:p-8">
                <iframe 
                  id="pdfFrame"
                  src={`${selectedPdf.url}#toolbar=0`}
                  className="w-full h-full rounded-2xl border border-zinc-200/50 shadow-inner bg-white"
                  title="PDF Viewer"
                />
              </div>

              <div className="p-4 text-center md:hidden">
                <a 
                  href={selectedPdf.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-3 rounded-xl text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Full Screen
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Digital Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
            >
               <div className="p-6 md:px-10 bg-zinc-50 flex items-center justify-between border-b border-zinc-200">
                  <h3 className="text-lg font-black text-zinc-900 truncate">Document Viewer</h3>
                  <button 
                    onClick={() => setSelectedReceipt(null)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>
               
               <div className="p-8 md:p-12 overflow-y-auto">
                  <div className="max-w-sm mx-auto receipt-box p-8 border-2 border-dashed border-zinc-200 text-zinc-700 font-mono">
                     <div className="text-center mb-8 pb-6 border-b border-zinc-200">
                        <div className="text-xl font-black text-emerald-600 uppercase">School Receipt</div>
                        <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Date: {new Date(selectedReceipt.created_at).toLocaleDateString()}</p>
                     </div>

                     <div className="space-y-4 mb-10">
                        {selectedReceipt.items?.map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between border-b border-dashed border-zinc-200 pb-3">
                              <span className="text-xs truncate max-w-[200px]">{item.item}</span>
                              <span className="font-bold text-xs whitespace-nowrap">₦{item.price.toLocaleString()}</span>
                           </div>
                        ))}
                     </div>

                     <div className="pt-6 border-t-2 border-zinc-900 flex justify-between items-center text-lg font-black">
                        <span>TOTAL</span>
                        <span>₦{selectedReceipt.items?.reduce((s: number, i: any) => s + i.price, 0).toLocaleString()}</span>
                     </div>

                     <div className="mt-8 text-center">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Transaction Ref</p>
                        <p className="text-[10px] font-bold text-zinc-600 truncate">{selectedReceipt.id.substring(0, 16).toUpperCase()}</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm
        ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-emerald-100/40 hover:text-white hover:bg-white/5'}
      `}
    >
      <span className={`${active ? 'text-white' : 'text-emerald-400'}`}>
        {icon}
      </span>
      {label}
      {active && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
    </button>
  );
}

function StaticItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center group">
      <div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-lg font-bold text-zinc-900">{value}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <CheckCircle className="w-4 h-4 text-emerald-500" />
      </div>
    </div>
  );
}

function EditableItem({ label, icon, value, onSave, loading }: { label: string, icon: any, value: any, onSave: () => void, loading: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          {icon}
          {label}
        </p>
        <button 
          onClick={onSave}
          disabled={loading}
          className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1 cursor-pointer"
        >
          {loading ? 'Updating...' : (
            <span className="flex items-center gap-1">
              <Save className="w-3 h-3" />
              Update
            </span>
          )}
        </button>
      </div>
      {value}
    </div>
  );
}

