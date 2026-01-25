"use client"

export default function Politics() {
  return (
    <div className="bg-white py-24 sm:py-32 border-t border-gray-200">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-semibold text-base/8 text-indigo-600 mb-4">
            Privacidad y Seguridad
          </h2>
          <h1 className="text-4xl font-bold tracking-tight text-pretty text-gray-900 sm:text-5xl mb-6 leading-none">
            Política de Privacidad
          </h1>
          <p className="text-lg font-medium text-gray-600">
            Última actualización: Octubre 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Sección 1 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 via-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Información que recopilamos
              </h2>
            </div>
            <p className="text-gray-600 text-lg/8 font-medium leading-relaxed pl-13">
              Recopilamos información que el usuario proporciona directamente
              (nombre, correo electrónico, datos de empresa), así como datos
              técnicos derivados del uso del sistema (IP, navegador, tiempo de
              sesión).
            </p>
          </div>

          {/* Sección 2 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 via-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Finalidad del tratamiento
              </h2>
            </div>
            <div className="text-gray-600 text-lg/8 font-medium leading-relaxed pl-13">
              <p className="mb-4">Los datos se utilizan para:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Proveer y optimizar los servicios contratados.</li>
                <li>Mejorar la experiencia del usuario.</li>
                <li>
                  Enviar comunicaciones informativas o comerciales con
                  consentimiento.
                </li>
              </ul>
            </div>
          </div>

          {/* Sección 3 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 via-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Protección de datos
              </h2>
            </div>
            <p className="text-gray-600 text-lg/8 font-medium leading-relaxed pl-13">
              Alpadev adopta medidas de seguridad técnicas y organizativas para
              proteger la información de sus usuarios contra acceso no
              autorizado, alteración o pérdida.
            </p>
          </div>

          {/* Sección 4 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 via-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold">
                4
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Terceros y transferencias
              </h2>
            </div>
            <p className="text-gray-600 text-lg/8 font-medium leading-relaxed pl-13">
              No compartimos datos personales con terceros, salvo cuando sea
              necesario para la prestación de servicios (por ejemplo,
              plataformas de mensajería) y siempre bajo acuerdos de
              confidencialidad.
            </p>
          </div>

          {/* Sección 5 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 via-blue-700 to-indigo-900 flex items-center justify-center text-white font-bold">
                5
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Derechos del usuario
              </h2>
            </div>
            <p className="text-gray-600 text-lg/8 font-medium leading-relaxed pl-13">
              El usuario podrá acceder, rectificar o eliminar sus datos
              personales en cualquier momento, escribiendo a{" "}
              <a
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
                href="mailto:contacto@alpadev.com"
              >
                contacto@alpadev.com
              </a>{" "}
              o a través del panel de usuario.
            </p>
          </div>

          {/* Contacto */}
          <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📬 Contacto
            </h3>
            <p className="text-gray-600 text-lg/8 font-medium mb-4">
              Para cualquier duda sobre cómo tratamos tus datos, puedes
              escribirnos a:
            </p>
            <div className="space-y-2 text-gray-600 text-lg/8 font-medium">
              <p className="font-semibold text-gray-900">Alpadev</p>
              <p>
                ✉️{" "}
                <a
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                  href="mailto:contacto@alpadev.com"
                >
                  contacto@alpadev.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
