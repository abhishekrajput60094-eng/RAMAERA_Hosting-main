import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Server } from 'lucide-react';
import { useUserStore } from '../store/authStore'; // Import useUserStore

export function Login() {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useUserStore((state) => state.login); // Get the login action from the store
  const user = useUserStore((state) => state.user); // Get the user from the store
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password }); // Call the login action with email and password
      // After successful login, the user state in the store will be updated
      // We can then check the user's role for navigation
      const loggedInUser = useUserStore.getState().user; // Get the updated user state
      if (loggedInUser?.role === 'admin' || loggedInUser?.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white mb-6">
            <Server className="h-10 w-10 text-cyan-400" />
            <span className="text-2xl font-bold">Ramaera Hosting</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-cyan-200">Sign in to access your account</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-cyan-500/30">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Email
              </label>
              <input
                type="email" // Changed type to email
                value={email} // Changed from username to email
                onChange={(e) => setEmail(e.target.value)} // Changed from setUsername to setEmail
                required
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                placeholder="Enter your email" // Changed placeholder
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-cyan-500 border-cyan-500/30 rounded focus:ring-cyan-500 bg-slate-800"
                />
                <span className="ml-2 text-sm text-slate-300">Remember me</span>
              </label>
              <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold">
                Forgot password?
              </a>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Sign up
              </Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}
