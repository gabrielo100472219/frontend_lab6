import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { CoffeeCatalog } from './coffee-catalog';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CoffeeCatalog con MSW', () => {
  it('debería mostrar los 3 cafés que devuelve el servidor', async () => {
    // Arrange

    // Act
    render(<CoffeeCatalog />);

    // Assert
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
  });

  it('debería mostrar "Servicio no disponible" cuando el servidor responde 503', async () => {
    // Arrange
    server.use(http.get('/api/coffees', () => new HttpResponse(null, { status: 503 })));

    // Act
    render(<CoffeeCatalog />);

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Servicio no disponible');
  });

  it('debería sumar Etiopía y Brasil al carrito con los datos del servidor', async () => {
    // Arrange
    render(<CoffeeCatalog />);

    // Act
    await userEvent.click(
      await screen.findByRole('button', { name: 'Añadir Etiopía Yirgacheffe al carrito' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Añadir Brasil Cerrado al carrito' }));

    // Assert
    expect(screen.getByText('2 bolsas · 23.91 €')).toBeInTheDocument();
  });
});
