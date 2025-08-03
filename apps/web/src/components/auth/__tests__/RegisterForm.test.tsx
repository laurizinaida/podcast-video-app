/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../RegisterForm';
import * as authStore from '@/stores/authStore';
import { useRouter } from 'next/navigation';

// Mock the auth store
jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('RegisterForm', () => {
  const mockRegister = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (authStore.useAuthStore as jest.Mock).mockReturnValue({
      register: mockRegister,
      status: 'unauthenticated',
    });
    mockRegister.mockClear();
    mockPush.mockClear();
  });

  it('renders the registration form correctly', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('calls the register function on form submission with valid data', async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows an error message on failed registration', async () => {
    const errorMessage = 'Email already in use';
    mockRegister.mockRejectedValueOnce(new Error(errorMessage));
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});