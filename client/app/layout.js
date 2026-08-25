import './styles/globals.css'
import './styles/variables.css'
import './styles/glassmorphism.css'
import './styles/layout.css'
import './styles/buttons.css'
import './styles/cards.css'
import './styles/forms.css'
import './styles/animations.css'
import './styles/navbar.css'
import './styles/templates.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'ResumeMind AI',
  description: 'AI-powered resume analyzer platform'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.28)',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)'
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff'
              }
            }
          }}
        />

        {children}

      </body>
    </html>
  )
}