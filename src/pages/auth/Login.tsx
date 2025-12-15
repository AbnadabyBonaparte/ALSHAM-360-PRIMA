export const Login: React.FC = () => {
  const [email, setEmail] = useState('alsham.admin@alshamglobal.com.br') // pré-preenchido para teste rápido
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      // erro tratado pelo store
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-10 border border-gray-700">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            ALSHAM 360° PRIMA
          </h1>
          <p className="text-gray-400 text-lg">
            Entre com sua conta admin
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            placeholder="Senha"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-70"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={signInWithGoogle}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            Ou entrar com Google
          </button>
        </div>
      </div>
    </div>
  )
}
