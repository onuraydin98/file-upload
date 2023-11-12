// Imports
import { afterEach, describe, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'

// To Test
import App from '../App'

// Tests
describe('Renders main page correctly', async () => {
  /**
   * Resets all renders after each test
   */
  afterEach(() => {
    cleanup()
  })

  it('Should render the page correctly', async () => {
    // Setup
    render(<App />)
  })
})
