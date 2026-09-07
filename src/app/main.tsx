import { createRoot } from 'react-dom/client'
import Main from '@/pages/main/ui/Main'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root not found')
createRoot(root).render(<Main />)
