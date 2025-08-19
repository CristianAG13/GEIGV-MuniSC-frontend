"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulación de envío de email (reemplazar con tu lógica real)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsSuccess(true)
    } catch (err) {
      setError("Error al enviar el correo. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
           
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Correo Enviado!</h2>

          <p className="text-gray-600 mb-6">
            Hemos enviado las instrucciones para restablecer tu contraseña a{" "}
            <span className="font-medium text-gray-800">{email}</span>
          </p>

          <p className="text-sm text-gray-500 mb-8">
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
          </p>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Volver al Login
            </Link>

            <button
              onClick={() => {
                setIsSuccess(false)
                setEmail("")
              }}
              className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
            >
              Enviar a otro correo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        
        <div className="text-center mb-8">
            
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Olvidaste tu contraseña?</h2>
          <p className="text-gray-600">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecerla.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? "Enviando..." : "Enviar Instrucciones"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
