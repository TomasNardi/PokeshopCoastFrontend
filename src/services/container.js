/**
 * Composition root (Abstract Factory + Singleton).
 *
 * El ÚNICO lugar que decide si se usan mocks o el backend real, y que arma
 * las dependencias entre servicios. Páginas y componentes piden servicios
 * con getServices(); nunca importan un repositorio directamente.
 *
 *   NEXT_PUBLIC_USE_MOCKS=true  → repositorios en memoria (src/mocks)
 *   NEXT_PUBLIC_USE_MOCKS=false → repositorios HTTP contra NEXT_PUBLIC_API_URL
 *
 * Auth: Supabase si está configurado; si no, mock (en modo mocks) o apagado.
 */
import { env, isSupabaseConfigured } from '@/config/env';
import { createHttpClient } from './http/httpClient';
import { createHttpCatalogRepository } from './catalog/catalogRepository.http';
import { createMockCatalogRepository } from './catalog/catalogRepository.mock';
import { createCatalogService } from './catalog/catalogService';
import { createHttpOrderRepository } from './orders/orderRepository.http';
import { createMockOrderRepository } from './orders/orderRepository.mock';
import { createOrderService } from './orders/orderService';
import { createHttpCustomerRepository } from './customer/customerRepository.http';
import { createMockCustomerRepository } from './customer/customerRepository.mock';
import { createHttpEngagementRepository, createMockEngagementRepository } from './engagement/engagementRepository.http';
import { createEngagementService } from './engagement/engagementService';
import { createSupabaseAuthProvider } from './auth/providers/supabaseAuthProvider';
import { createMockAuthProvider } from './auth/providers/mockAuthProvider';
import { createDisabledAuthProvider } from './auth/providers/disabledAuthProvider';
import { createAuthService } from './auth/authService';
import { createPasswordRecoveryService } from './auth/passwordRecoveryService';

function pickAuthProvider({ useMocks, supabase }) {
  if (supabase) return createSupabaseAuthProvider(supabase);
  if (useMocks) return createMockAuthProvider();
  return createDisabledAuthProvider();
}

/**
 * @param {object} [options] todo inyectable para tests
 */
export function createServices({
  useMocks = env.useMocks,
  apiUrl = env.apiUrl,
  supabase = isSupabaseConfigured ? { url: env.supabaseUrl, key: env.supabaseKey } : null,
  authProvider = pickAuthProvider({ useMocks, supabase }),
} = {}) {
  const auth = createAuthService(authProvider);
  const passwordRecovery = createPasswordRecoveryService(authProvider);
  const getCustomerToken = () => auth.getAccessToken();

  const http = createHttpClient({ baseUrl: apiUrl });
  const repos = useMocks
    ? {
        catalog: createMockCatalogRepository(),
        orders: createMockOrderRepository(),
        customer: createMockCustomerRepository(),
        engagement: createMockEngagementRepository(),
      }
    : {
        catalog: createHttpCatalogRepository(http),
        orders: createHttpOrderRepository(http, { getCustomerToken }),
        customer: createHttpCustomerRepository(http, { getCustomerToken }),
        engagement: createHttpEngagementRepository(http),
      };

  return Object.freeze({
    mode: useMocks ? 'mock' : 'http',
    auth,
    passwordRecovery,
    catalog: createCatalogService(repos.catalog),
    orders: createOrderService(repos.orders),
    customer: repos.customer,
    engagement: createEngagementService(repos.engagement),
  });
}

let instance = null;

export function getServices() {
  instance ||= createServices();
  return instance;
}

/** Solo tests. */
export function setServicesForTesting(services) {
  instance = services;
}
