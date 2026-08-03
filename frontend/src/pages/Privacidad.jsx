import { usePageTitle } from '../utils/usePageTitle'

const SECCIONES = [
  {
    titulo: '1. Información que Recopilamos',
    texto: 'Para operar CourseHub recopilamos la siguiente información:',
    lista: [
      'Nombre de usuario (pseudónimo) que eliges al registrarte.',
      'Correo institucional @espol.edu.ec.',
      'Recursos que compartes y tus interacciones (calificaciones, guardados, reportes).',
      'Datos técnicos básicos como fecha de registro.',
    ],
  },
  {
    titulo: '2. Uso de la Información',
    texto:
      'Tu información se utiliza para gestionar tu cuenta, mostrar tu perfil y ranking de karma, moderar contenido y mejorar la experiencia de la plataforma.',
  },
  {
    titulo: '3. Protección de Datos',
    texto:
      'La contraseña se almacena de forma segura y cifrada. No vendemos ni compartimos tus datos personales con terceros con fines comerciales.',
  },
  {
    titulo: '4. Compartir Información con Terceros',
    texto:
      'Tu pseudónimo, karma y recursos publicados son visibles para la comunidad dentro de la plataforma. Tu correo y datos de cuenta no se exponen públicamente.',
  },
  {
    titulo: '5. Retención de Datos',
    texto:
      'Conservamos tu información mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta y de los datos asociados a ella.',
  },
  {
    titulo: '6. Tus Derechos',
    texto:
      'Puedes acceder, corregir o eliminar tu información personal contactando al equipo del proyecto. También puedes dejar de compartir recursos en cualquier momento.',
  },
  {
    titulo: '7. Cambios en esta Política',
    texto:
      'Podemos actualizar esta política de privacidad periódicamente. Los cambios serán publicados en esta página.',
  },
  {
    titulo: '8. Contacto',
    texto:
      'Para consultas sobre privacidad y datos personales, contacta al equipo de CourseHub a través de los canales oficiales de la ESPOL.',
  },
]

export default function Privacidad() {
  usePageTitle('Política de Privacidad')
  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: 800 }}>
        <h2 className="fw-bold">
          <i className="bi bi-shield-lock me-2" />
          Política de Privacidad
        </h2>
        <p className="text-muted">
          <strong>Última actualización:</strong> Junio 2026
        </p>
        {SECCIONES.map((s) => (
          <div key={s.titulo}>
            <h5 className="fw-bold mt-4">{s.titulo}</h5>
            {s.texto && <p>{s.texto}</p>}
            {s.lista && (
              <ul>
                {s.lista.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
