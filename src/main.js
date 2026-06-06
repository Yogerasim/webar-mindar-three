import './style.css'
import { startAR } from './core/arApp.js'

const startButton = document.querySelector('#startButton')
const statusText = document.querySelector('#status')

startButton.addEventListener('click', async () => {
  try {
    statusText.textContent = 'Starting camera...'
    startButton.style.display = 'none'

    await startAR({
      container: document.body,
      statusText,
    })
  } catch (error) {
    console.error(error)
    statusText.textContent = `Error: ${error.message}`
    startButton.style.display = 'block'
  }
})
