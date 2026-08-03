import { Component } from 'react'

// Captura errores de renderizado para evitar pantallas en blanco.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="text-center py-5">
          <i
            className="bi bi-bug display-3 d-block mb-3 text-danger"
          />
          <h3 className="fw-bold">Algo salió mal</h3>
          <p className="text-muted">
            Ocurrió un error inesperado al mostrar esta sección.
          </p>
          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={() => this.setState({ error: null })}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
