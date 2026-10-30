import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EdicionComponent } from "./edicion.component";

describe("EdicionComponent (formulario de alta de cafés)", () => {
  it("debería mostrar el error del nombre y no llamar a onSave cuando el nombre tiene un carácter", async () => {
    // Arrange
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EdicionComponent onSave={onSave} />);

    // Act
    await userEvent.type(screen.getByLabelText("Nombre"), "K");
    await userEvent.type(screen.getByLabelText("Origen"), "Kenia");
    await userEvent.type(screen.getByLabelText("Precio (€)"), "12.5");
    await userEvent.click(screen.getByRole("button", { name: "Guardar café" }));

    // Assert
    expect(
      await screen.findByText("El nombre necesita al menos dos caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("aria-invalid", "true");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("debería llamar a onSave con los valores del formulario cuando los datos son válidos", async () => {
    // Arrange
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EdicionComponent onSave={onSave} />);

    // Act
    await userEvent.type(screen.getByLabelText("Nombre"), "Kenia AA");
    await userEvent.type(screen.getByLabelText("Origen"), "Kenia");
    await userEvent.selectOptions(screen.getByLabelText("Tueste"), "Claro");
    await userEvent.type(screen.getByLabelText("Precio (€)"), "12.5");
    await userEvent.type(screen.getByLabelText("Notas de cata (opcional)"), "Grosella");
    await userEvent.click(screen.getByRole("button", { name: "Guardar café" }));

    // Assert
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      name: "Kenia AA",
      origin: "Kenia",
      roast: "light",
      price: 12.5,
      notes: "Grosella",
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("debería pedir un precio y no llamar a onSave cuando el precio está vacío", async () => {
    // Arrange
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EdicionComponent onSave={onSave} />);

    // Act
    await userEvent.type(screen.getByLabelText("Nombre"), "Kenia AA");
    await userEvent.type(screen.getByLabelText("Origen"), "Kenia");
    await userEvent.click(screen.getByRole("button", { name: "Guardar café" }));

    // Assert
    expect(await screen.findByText("Introduce un precio.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
