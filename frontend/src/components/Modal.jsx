import { useEffect } from 'react'

export default function Modal({ show, onClose, title, children, footer, size = 'lg' }) {
  useEffect(() => {
    if (!show) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [show, onClose])

  if (!show) return null

  const sizeClass = size === 'lg' ? 'modal-lg' : size === 'sm' ? 'modal-sm' : ''

  return (
    <div className="modal-coursehub" onClick={onClose}>
      <div
        className={`modal-dialog modal-dialog-scrollable ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow">
          <div className="modal-header modal-header-primary">
            <h5 className="modal-title d-flex align-items-center gap-2">
              {title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Cerrar"
            />
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

export function ConfirmModal({ show, onClose, onConfirm, mensaje, titulo, textoConfirmar = 'Confirmar', confirmarClase = 'btn-primary' }) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary px-4" onClick={onClose}>
            Cancelar
          </button>
          <button className={`btn ${confirmarClase} px-4`} onClick={onConfirm}>
            {textoConfirmar}
          </button>
        </>
      }
    >
      <div className="text-center py-2">
        <i
          className="bi bi-exclamation-triangle display-4 text-warning d-block mb-3"
        />
        <p className="mb-0">{mensaje}</p>
      </div>
    </Modal>
  )
}
