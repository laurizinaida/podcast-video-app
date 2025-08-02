import { render, screen } from '@testing-library/react'

// Simple test to verify the test setup works
describe('Auth Components', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should render a simple div', () => {
    render(<div data-testid="test-div">Test Content</div>)
    expect(screen.getByTestId('test-div')).toBeInTheDocument()
  })
})