import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  Link as LucideLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const CLASSES = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    schoolCode: '',
    surname: '',
    firstName: '',
    otherName: '',
    gender: '',
    dob: '',
    stateOrigin: '',
    studentClass: '',
    homeAddress: '',
    email: '',
    parentPhone: '',
    password: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = async () => {
    if (formData.schoolCode && formData.surname && formData.firstName && formData.gender && formData.dob && formData.stateOrigin) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('school_name')
          .eq('school_code', formData.schoolCode)
          .single();

        if (error || !data) {
          alert("Invalid School Code. Please check with your school administrator.");
          return;
        }
        
        setStep(2);
      } catch (err: any) {
        alert("Error validating school code: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please fill in all required personal details including School Code.");
    }
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      await handleNext();
      return;
    }
    
    setLoading(true);

    const studentData = {
      school_code: formData.schoolCode,
      surname: formData.surname,
      first_name: formData.firstName,
      other_name: formData.otherName,
      gender: formData.gender,
      dob: formData.dob,
      state_origin: formData.stateOrigin,
      student_class: formData.studentClass,
      home_address: formData.homeAddress,
      email_address: formData.email,
      parent_phone: formData.parentPhone,
      password: formData.password
    };

    try {
      const { error } = await supabase
        .from('students')
        .insert([studentData]);

      if (error) throw error;
      
      setSuccess(true);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-emerald-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-12 rounded-[40px] card-shadow text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-emerald-100 text-emerald-600 mb-8">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 mb-4">Registration Successful!</h2>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Welcome to the elite community of Gateway Academy. You can now use your credentials to access the student dashboard.
          </p>
          <Link 
            to="/login"
            className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-emerald-200"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-emerald-50 overflow-hidden">
      {/* Background Accents */}
      <div className="accent-blob bg-emerald-400 w-[500px] h-[500px] -top-32 -left-32" />
      <div className="accent-blob bg-amber-300 w-[600px] h-[600px] -bottom-48 -right-32 opacity-20" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[40px] flex flex-col md:flex-row overflow-hidden card-shadow min-h-[700px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-[380px] bg-emerald-900 p-8 md:p-12 flex flex-col justify-between text-white relative">
          <div className="space-y-10">
            <div className="w-12 h-12 bg-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20">
              <div className="w-6 h-6 border-4 border-white rounded-full" />
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-[0.8] tracking-tighter uppercase">
                Student<br/>
                <span className="text-emerald-400">Portal</span>
                <span className="text-emerald-500">.</span>
              </h1>
              <p className="text-emerald-100/60 text-lg font-medium leading-relaxed max-w-[280px]">
                Join the elite community of Gateway Academy.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="space-y-8 pt-4">
              <div className={`flex items-center gap-5 transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step === 1 ? 'bg-emerald-500 border-emerald-400' : 'bg-white/10 border-white/20'}`}>
                  1
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider">Personal Details</p>
                  <p className="text-xs text-emerald-200/80">Identity & Bio</p>
                </div>
              </div>

              <div className={`flex items-center gap-5 transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step === 2 ? 'bg-emerald-500 border-emerald-400' : 'bg-white/10 border-white/20'}`}>
                  2
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider">School & Contact</p>
                  <p className="text-xs text-emerald-200/80">Address & Parents</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden md:flex items-center gap-2 text-emerald-300/50 text-xs font-medium py-4">
              <CheckCircle className="w-4 h-4" />
              <span>Secure Student Encryption</span>
            </div>
            <p className="text-emerald-200/60 text-sm">
              Already registered? <Link to="/login" className="text-white font-bold hover:underline">Login here</Link>
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 bg-white p-8 md:p-12">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-zinc-800">Registration Form</h2>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
              Step {step} of 2
            </span>
          </div>

          <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
                >
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">School Code (6-digits) *</label>
                    <input
                      id="schoolCode"
                      type="text"
                      required
                      maxLength={6}
                      value={formData.schoolCode}
                      onChange={handleChange}
                      placeholder="Enter your 6-digit school code"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Surname *</label>
                    <input
                      id="surname"
                      type="text"
                      required
                      value={formData.surname}
                      onChange={handleChange}
                      placeholder="e.g. Adeyemi"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">First Name *</label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Babatunde"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Other Name</label>
                    <input
                      id="otherName"
                      type="text"
                      value={formData.otherName}
                      onChange={handleChange}
                      placeholder="e.g. Ezekiel"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Gender *</label>
                    <select
                      id="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium appearance-none"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Date of Birth *</label>
                    <input
                      id="dob"
                      type="date"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">State of Origin *</label>
                    <select
                      id="stateOrigin"
                      required
                      value={formData.stateOrigin}
                      onChange={handleChange}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium appearance-none"
                    >
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s} State</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-2 mt-4">
                    <button
                      key="btn-next"
                      type="button"
                      onClick={handleNext}
                      className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-emerald-200 group"
                    >
                      Save and Continue
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
                >
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Class *</label>
                    <select
                      id="studentClass"
                      required
                      value={formData.studentClass}
                      onChange={handleChange}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium appearance-none"
                    >
                      <option value="">Select your class</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Home Address *</label>
                    <input
                      id="homeAddress"
                      type="text"
                      required
                      value={formData.homeAddress}
                      onChange={handleChange}
                      placeholder="Enter residential address"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Email (Optional)</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="user@example.com"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Parent Phone *</label>
                    <input
                      id="parentPhone"
                      type="tel"
                      required
                      value={formData.parentPhone}
                      onChange={handleChange}
                      placeholder="080 000 0000"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 px-1">Create Password *</label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-5 rounded-2xl transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-emerald-200 group"
                    >
                      {loading ? "Registering..." : (
                        <>
                          Complete Registration
                          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
