import { getCoffees, url } from './coffee.api';
import { coffees } from './test-data';

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status });

describe('coffee.api', () => {
  describe('getCoffees', () => {
    it('debería devolver los cafés cuando la API responde 200', async () => {
      // Arrange
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: coffees }, 200));

      // Act
      const result = await getCoffees();

      // Assert
      expect(result).toEqual(coffees);
    });

    it('debería llamar a fetch con "/api/coffees" y la cabecera Accept: application/json', async () => {
      // Arrange
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(jsonResponse({ data: coffees }, 200));

      // Act
      await getCoffees();

      // Assert
      expect(url).toBe('/api/coffees');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('/api/coffees', {
        headers: { Accept: 'application/json' },
      });
    });

    it.each([
      { status: 404, message: 'Catálogo no encontrado' },
      { status: 503, message: 'Servicio no disponible' },
      { status: 500, message: 'Error inesperado' },
    ])('debería rechazar con "$message" cuando la API responde $status', async ({ status, message }) => {
      // Arrange
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, status));

      // Act
      const promise = getCoffees();

      // Assert
      await expect(promise).rejects.toThrow(message);
    });

    it('debería propagar el error tal cual cuando fetch falla por red', async () => {
      // Arrange
      const networkError = new TypeError('Failed to fetch');
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(networkError);

      // Act
      const promise = getCoffees();

      // Assert
      await expect(promise).rejects.toBe(networkError);
    });
  });
});
