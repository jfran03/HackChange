function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to HackChange
            </h1>
            <p className="text-xl text-gray-600">
              Your application is ready with React and Tailwind CSS
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-blue-500 text-4xl mb-4">⚛️</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                React
              </h2>
              <p className="text-gray-600">
                Fast, modern JavaScript library for building user interfaces with components.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-cyan-500 text-4xl mb-4">🎨</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Tailwind CSS
              </h2>
              <p className="text-gray-600">
                Utility-first CSS framework for rapid UI development with beautiful designs.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-purple-500 text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Vite
              </h2>
              <p className="text-gray-600">
                Lightning-fast build tool with instant hot module replacement for development.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-green-500 text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Ready to Build
              </h2>
              <p className="text-gray-600">
                Start creating amazing features with this modern development stack.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
