import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { APIErrorDisplay } from '../../src/components/APIErrorDisplay';
import { OfflineIndicator } from '../../src/components/OfflineIndicator';
import { LanguageProvider } from '../../src/contexts/LanguageContext';

// Component that throws an error for testing ErrorBoundary
function ThrowError() {
  throw new Error('Test error');
}

describe('Error Handling Components', () => {
  describe('ErrorBoundary', () => {
    it('catches errors and displays fallback UI', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/The application encountered an unexpected error/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('uses custom fallback when provided', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={<div>Custom fallback</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom fallback')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('APIErrorDisplay', () => {
    it('displays error message in English', () => {
      render(
        <LanguageProvider>
          <APIErrorDisplay error="Network error" />
        </LanguageProvider>
      );

      expect(screen.getByText('Unable to Load Data')).toBeInTheDocument();
      expect(screen.getByText(/We encountered an issue/)).toBeInTheDocument();
    });

    it('does not render when error is null', () => {
      const { container } = render(
        <LanguageProvider>
          <APIErrorDisplay error={null} />
        </LanguageProvider>
      );

      expect(container.firstChild).toBeNull();
    });

    it('displays retry button when onRetry is provided', () => {
      const onRetry = vi.fn();

      render(
        <LanguageProvider>
          <APIErrorDisplay error="Network error" onRetry={onRetry} />
        </LanguageProvider>
      );

      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });
  });

  describe('OfflineIndicator', () => {
    it('does not render when online', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const { container } = render(
        <LanguageProvider>
          <OfflineIndicator />
        </LanguageProvider>
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders offline message when offline', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(
        <LanguageProvider>
          <OfflineIndicator />
        </LanguageProvider>
      );

      expect(screen.getByText(/You are offline/)).toBeInTheDocument();
    });
  });
});
