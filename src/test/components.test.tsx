import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { ToastContainer } from '@/components/ToastContainer';
import { Footer } from '@/components/Footer';
import { AppProvider } from '@/context/AppContext';

describe('UI Components', () => {
  it('renders VirtualKeyboard and highlights keys', () => {
    const { container } = render(
      <VirtualKeyboard activeKey="f" focusKeys={['f', 'j']} showFingerGuide={true} />
    );

    // Should render letter keys
    expect(screen.getByText('f')).toBeInTheDocument();
    expect(screen.getByText('j')).toBeInTheDocument();
    expect(screen.getByTitle('Space')).toBeInTheDocument();

    // Check virtual keyboard wrapper
    const kb = container.querySelector('.virtual-keyboard');
    expect(kb).toBeInTheDocument();
  });

  it('renders Footer with links and branding', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText('TypeMaster')).toBeInTheDocument();
    expect(screen.getByText(/Beginner: Home Row/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Offline & Private/i)).toBeInTheDocument();
  });

  it('renders ToastContainer cleanly when toasts are empty', () => {
    const { container } = render(
      <AppProvider>
        <ToastContainer />
      </AppProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
