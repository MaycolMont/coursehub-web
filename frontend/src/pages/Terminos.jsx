import { usePageTitle } from '../utils/usePageTitle'

const SECCIONES = [
  {
    titulo: '1. Aceptación de los Términos',
    texto:
      'Al acceder y utilizar CourseHub aceptas cumplir estos Términos y Condiciones de Uso. Si no estás de acuerdo, no debes utilizar la plataforma.',
  },
  {
    titulo: '2. Descripción del Servicio',
    texto:
      'CourseHub es una plataforma colaborativa académica de la ESPOL donde los estudiantes comparten y consultan recursos de estudio como apuntes, pruebas resueltas, proyectos y guías.',
  },
  {
    titulo: '3. Registro y Cuenta de Usuario',
    texto:
      'Para utilizar las funciones de la plataforma debes registrarte con tu correo institucional @espol.edu.ec. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta.',
  },
  {
    titulo: '4. Uso Aceptable',
    texto: 'Te comprometes a no utilizar la plataforma para:',
    lista: [
      'Publicar contenido que infrinja derechos de autor o propiedad intelectual.',
      'Compartir información personal de terceros sin su consentimiento.',
      'Subir archivos maliciosos, virus o cualquier software dañino.',
      'Suplantar la identidad de otros usuarios.',
      'Realizar actividades que perturben el normal funcionamiento del servicio.',
    ],
  },
  {
    titulo: '5. Contenido Generado por el Usuario',
    texto:
      'Eres el único responsable del contenido que publicas. Al compartir un recurso garantizas que tienes el derecho a hacerlo. El contenido puede ser moderado, ocultado o eliminado por los administradores si incumple estas normas.',
  },
  {
    titulo: '6. Moderación',
    texto:
      'Los administradores y moderadores pueden revisar los recursos publicados, ocultar contenido inapropiado y atender reportes de la comunidad.',
  },
  {
    titulo: '7. Limitación de Responsabilidad',
    texto:
      'CourseHub es un proyecto académico. El contenido es aportado por los usuarios y no representa la posición oficial de la ESPOL. No garantizamos la exactitud ni la idoneidad del material compartido.',
  },
  {
    titulo: '8. Cambios en los Términos',
    texto:
      'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página.',
  },
  {
    titulo: '9. Contacto',
    texto:
      'Para consultas sobre estos términos, contacta al equipo del proyecto CourseHub a través de los canales oficiales de la ESPOL.',
  },
]

export default function Terminos() {
  usePageTitle('Términos y Condiciones')
  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: 800 }}>
        <h2 className="fw-bold">
          <i className="bi bi-file-earmark-text me-2" />
          Términos y Condiciones de Uso
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
