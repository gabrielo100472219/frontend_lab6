import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { getCoffees } from './coffee.api';
import { coffees } from './test-data';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('coffee.api con MSW', () => {
  it('debería devolver los cafés cuando el servidor responde 200', async () => {
    // Arrange (el handler por defecto de src/mocks/handlers.ts)

    // Act
    const result = await getCoffees();

    // Assert
    expect(result).toEqual(coffees);
  });

  it('debería pedir JSON con la cabecera Accept', async () => {
    // Arrange
    let accept: string | null = null;
    server.use(
      http.get('/api/coffees', ({ request }) => {
        accept = request.headers.get('Accept');
        return HttpResponse.json({ data: coffees });
      })
    );

    // Act
    await getCoffees();

    // Assert
    expect(accept).toBe('application/json');
  });

  it.each([
    { status: 404, message: 'Catálogo no encontrado' },
    { status: 503, message: 'Servicio no disponible' },
    { status: 500, message: 'Error inesperado' },
  ])('debería rechazar con "$message" cuando el servidor responde $status', async ({ status, message }) => {
    // Arrange
    server.use(http.get('/api/coffees', () => new HttpResponse(null, { status })));

    // Act
    const promise = getCoffees();

    // Assert
    await expect(promise).rejects.toThrow(message);
  });

  it('debería rechazar con un TypeError cuando falla la red', async () => {
    // Arrange
    server.use(http.get('/api/coffees', () => HttpResponse.error()));

    // Act
    const promise = getCoffees();

    // Assert
    await expect(promise).rejects.toThrow(TypeError);
  });
});
