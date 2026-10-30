import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from './coffee.api';
import { CoffeeCatalog } from './coffee-catalog';
import { coffees } from './test-data';

describe('CoffeeCatalog', () => {
  it('debería mostrar "Cargando…" y después los 3 cafés cuando getCoffees responde', async () => {
    // Arrange
    const getCoffeesSpy = vi.spyOn(api, 'getCoffees').mockResolvedValue(coffees);

    // Act
    render(<CoffeeCatalog />);

    // Assert
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    expect(getCoffeesSpy).toHaveBeenCalledTimes(1);
  });

  it('debería mostrar una alerta con el mensaje cuando getCoffees rechaza', async () => {
    // Arrange
    vi.spyOn(api, 'getCoffees').mockRejectedValue(new Error('Servicio no disponible'));

    // Act
    render(<CoffeeCatalog />);

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Servicio no disponible');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('debería dejar sólo Brasil Cerrado cuando se busca "bra"', async () => {
    // Arrange
    vi.spyOn(api, 'getCoffees').mockResolvedValue(coffees);
    render(<CoffeeCatalog />);
    const search = await screen.findByLabelText('Buscar');

    // Act
    await userEvent.type(search, 'bra');

    // Assert
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Brasil Cerrado');
  });

  it('no debería distinguir mayúsculas cuando se busca "BRA"', async () => {
    // Arrange
    vi.spyOn(api, 'getCoffees').mockResolvedValue(coffees);
    render(<CoffeeCatalog />);
    const search = await screen.findByLabelText('Buscar');

    // Act
    await userEvent.type(search, 'BRA');

    // Assert
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Brasil Cerrado');
  });

  it('debería mostrar "Sin resultados" y ningún café cuando se busca "zzz"', async () => {
    // Arrange
    vi.spyOn(api, 'getCoffees').mockResolvedValue(coffees);
    render(<CoffeeCatalog />);
    const search = await screen.findByLabelText('Buscar');
    await userEvent.type(search, 'bra');

    // Act
    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('debería sumar bolsas y precio al añadir cafés y vaciarlos con "Vaciar carrito"', async () => {
    // Arrange
    vi.spyOn(api, 'getCoffees').mockResolvedValue(coffees);
    render(<CoffeeCatalog />);
    const clearButton = await screen.findByRole('button', { name: 'Vaciar carrito' });
    expect(clearButton).toBeDisabled();

    // Act
    await userEvent.click(
      screen.getByRole('button', { name: 'Añadir Etiopía Yirgacheffe al carrito' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Añadir Brasil Cerrado al carrito' }));

    // Assert
    expect(screen.getByText('2 bolsas · 23.91 €')).toBeInTheDocument();
    expect(clearButton).toBeEnabled();

    // Act
    await userEvent.click(clearButton);

    // Assert
    expect(screen.getByText('0 bolsas · 0.00 €')).toBeInTheDocument();
    expect(clearButton).toBeDisabled();
  });
});
