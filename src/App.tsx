/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Toaster } from 'sonner';
import Frame from '@app/layout/Frame';
import { UIRoutes } from './pages/ui-routes';
import { ThemeHandler } from './app/theme/ThemeHandler';
import Providers from '@app/Providers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <pre style={{ color: '#FF2E63', whiteSpace: 'pre-wrap' }}>{error instanceof Error ? error.message : String(error)}</pre>
      <button onClick={resetErrorBoundary} style={{ marginTop: 16, padding: '8px 24px' }}>
        Try again
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeHandler>
          <Toaster position="top-right" richColors closeButton theme="dark"
            toastOptions={{ style: { background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' } }} />
          <Providers>
            <Frame>
              <UIRoutes />
            </Frame>
          </Providers>
        </ThemeHandler>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
