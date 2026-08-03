import { useEffect } from 'react'

// Establece el título del documento por página.
export function usePageTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · CourseHub` : 'CourseHub'
  }, [titulo])
}
