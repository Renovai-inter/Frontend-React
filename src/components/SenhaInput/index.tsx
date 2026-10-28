import "./style.css"
import { useState } from "react"
import type { SenhaInputProps } from "../../types/SenhaInputProps/SenhaInputProps"

function SenhaInput(props: SenhaInputProps) {
  const [mostrar, setMostrar] = useState(false)

  return (
    <div className="senha-input">
      <input {...props} type={mostrar ? "text" : "password"} className="senha-input__campo" />
      <button
        type="button"
        onClick={() => setMostrar((atual) => !atual)}
        className="senha-input__toggle"
        aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
      >
        {mostrar ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.6-7 10-7c2.2 0 4.1.8 5.7 1.9" />
            <path d="M22 12s-1.4 2.7-4.2 4.7C16.2 17.8 14.2 19 12 19c-6.4 0-10-7-10-7" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            <path d="M3 3l18 18" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default SenhaInput
