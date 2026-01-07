import { useEffect, useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";
import "../styles/BestellCockpitPage.css";

type Product = {
  id: string;
  title: string;
  sku: string;
  ean: string;
  image: string;
  price: number;
  description: string;
};

type ProductOption = {
  value: string;
  label: string;
  sku: string;
  ean: string;
  image: string;
  price: number;
  description: string;
};

type Address = {
  salutation: string;
  firstName: string;
  lastName: string;
  company: string;
  street: string;
  number: string;
  zip: string;
  city: string;
  country: "de" | "at";
  email: string;
  phone: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export default function BestellCockpitPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  // react-select (nur Suchtext)
  const [selectInputValue, setSelectInputValue] = useState("");

  // Dropdown Optionen + Pagination
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Start: initiales Default-Produkt laden (optional)
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [address, setAddress] = useState<Address>({
    salutation: "",
    firstName: "",
    lastName: "",
    company: "",
    street: "",
    number: "",
    zip: "",
    city: "",
    country: "de",
    email: "",
    phone: "",
  });

  const [addressErrors, setAddressErrors] = useState<Record<keyof Address, string | undefined>>(
    {} as Record<keyof Address, string | undefined>
  );

  // Initial: ein Produkt zum Anzeigen holen (erste 20 -> nimm erstes)
  useEffect(() => {
    (async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);

        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const items: Product[] = data.items ?? [];

        setSelectedProduct(items[0] ?? null);
      } catch (err) {
        setProductsError(err instanceof Error ? err.message : "Unbekannter Fehler");
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  const loadOptions = async (q: string, after?: string | null, append?: boolean) => {
    setLoadingOptions(true);
    try {
      const url = new URL(`${API_BASE}/api/products/search`);
      url.searchParams.set("q", q);
      url.searchParams.set("first", "20");
      if (after) url.searchParams.set("after", after);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const newOptions: ProductOption[] = (data.items ?? []).map((p: Product) => ({
        value: p.id,
        label: p.title,
        sku: p.sku,
        ean: p.ean,
        image: p.image,
        price: p.price,
        description: p.description,
      }));

      setOptions((prev) => (append ? [...prev, ...newOptions] : newOptions));
      setHasNextPage(Boolean(data.pageInfo?.hasNextPage));
      setNextCursor(data.pageInfo?.endCursor ?? null);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Debounce: Backend Suche über alle Produkte
  useEffect(() => {
    const t = setTimeout(() => {
      loadOptions(selectInputValue, null, false);
    }, 250);
    return () => clearTimeout(t);
  }, [selectInputValue]);

  const totalPrice = useMemo(() => {
    if (!selectedProduct) return "0.00";
    return (selectedProduct.price * quantity).toFixed(2);
  }, [selectedProduct, quantity]);

  const setAddressError = (name: keyof Address, message?: string) => {
    setAddressErrors((prev) => ({ ...prev, [name]: message }));
  };

  const deriveCountryFromZip = (zip: string) => {
    if (/^\d{4}$/.test(zip)) return "at";
    if (/^\d{5}$/.test(zip)) return "de";
    return undefined;
  };

  const validateAddressField = (name: keyof Address, value: string) => {
    if (["firstName", "lastName"].includes(name) && address.salutation !== "Firma" && !value.trim()) {
      return "Pflichtfeld";
    }
    if (name === "lastName" && !value.trim()) return "Pflichtfeld";
    if (name === "street" && !value.trim()) return "Pflichtfeld";
    if (name === "number") {
      if (!value.trim()) return "Pflichtfeld";
      if (!/^\d{1,4}[a-zA-Z]?(?:[-/]\d{1,3}[a-zA-Z]?)?$/.test(value.trim())) {
        return "Bitte gültige Hausnummer angeben.";
      }
    }
    if (name === "zip") {
      if (!value.trim()) return "Pflichtfeld";
      if (!/^\d{4,5}$/.test(value.trim())) return "Ungültige PLZ";
      const inferred = deriveCountryFromZip(value.trim());
      if (inferred && inferred !== address.country) {
        setAddress((prev) => ({ ...prev, country: inferred }));
      }
    }
    if (name === "city" && !value.trim()) return "Pflichtfeld";
    if (name === "email") {
      if (!value.trim()) return "Pflichtfeld";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Ungültige E-Mail";
    }
    if (name === "phone" && value.trim() && !/^[\d\s/+-]+$/.test(value.trim())) {
      return "Nur Ziffern und +-/, erlaubt";
    }
    if (name === "salutation" && !value.trim()) return "Pflichtfeld";
    return undefined;
  };

  const handleAddressChange = (name: keyof Address, value: string, opts?: { validate?: boolean }) => {
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (opts?.validate) {
      const error = validateAddressField(name, value);
      setAddressError(name, error);
    }
  };

  const validateAddress = () => {
    const nextErrors: typeof addressErrors = {} as typeof addressErrors;
    (Object.keys(address) as (keyof Address)[]).forEach((key) => {
      const message = validateAddressField(key, address[key] ?? "");
      if (message) nextErrors[key] = message;
    });
    setAddressErrors(nextErrors);
    return Object.values(nextErrors).every((msg) => !msg);
  };

  const handleSubmitOrder = () => {
    if (!validateAddress()) return;
    alert("Bestellung gesendet (Demo)");
  };

  // UI States
  if (loadingProducts) return <div style={{ padding: 24 }}>Lade Produkte…</div>;
  if (productsError) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ marginBottom: 8 }}>Produkte konnten nicht geladen werden.</p>
        <code>{productsError}</code>
      </div>
    );
  }
  if (!selectedProduct) return <div style={{ padding: 24 }}>Keine Produkte gefunden.</div>;

  return (
    <div className="cockpit-page">
      <header className="cockpit-hero">
        <div>
          <p className="cockpit-hero__eyebrow">Bestell Cockpit</p>
          <h2>Auftrag anlegen</h2>
          <p>
            Produkte suchen, Mengen kalkulieren und direkt eine Bestellung abschicken. Die Oberfläche
            ist speziell für die Fachberatung ausgelegt.
          </p>
        </div>
      </header>

      <section className="cockpit-panel">
        <div className="cockpit-panel__header">
          <h4>Produktsuche</h4>
        </div>

        <div className="cockpit-select">
          <label htmlFor="cockpit-select">EAN · SKU · Name</label>

          <Select
            inputId="cockpit-select"
            classNamePrefix="rs"
            options={options}
            isSearchable
            placeholder="Produkt suchen…"
            value={null}
            controlShouldRenderValue={false}
            inputValue={selectInputValue}
            isLoading={loadingOptions}
            noOptionsMessage={() => (selectInputValue ? "Keine Treffer" : "Tippe zum Suchen…")}
            onInputChange={(value, { action }) => {
              if (action === "input-change") setSelectInputValue(value);
              if (action === "menu-close") setSelectInputValue("");
            }}
            onMenuOpen={() => {
              if (options.length === 0) loadOptions("", null, false);
            }}
            onMenuScrollToBottom={() => {
              if (hasNextPage && !loadingOptions) {
                loadOptions(selectInputValue, nextCursor, true);
              }
            }}
            onChange={(option: SingleValue<ProductOption>) => {
              if (option) {
                // Ausgewähltes Produkt direkt aus Option bauen (keine extra API nötig)
                setSelectedProduct({
                  id: option.value,
                  title: option.label,
                  sku: option.sku,
                  ean: option.ean,
                  image: option.image,
                  price: option.price,
                  description: option.description,
                });
                setQuantity(1);
                setSelectInputValue(""); // Suchfeld wieder leer
              }
            }}
            filterOption={() => true} // Backend macht Suche, nicht react-select
            formatOptionLabel={(option) => (
              <div className="cockpit-select-option">
                <img src={option.image} alt="" aria-hidden="true" />
                <div>
                  <p className="cockpit-select-option__title">{option.label}</p>
                  <p className="cockpit-select-option__meta">
                    SKU {option.sku} · EAN {option.ean}
                  </p>
                  <p className="cockpit-select-option__description">{option.description}</p>
                </div>
                <strong>{option.price.toFixed(2)} €</strong>
              </div>
            )}
            components={{ IndicatorSeparator: () => null }}
          />
        </div>
      </section>

      <section className="cockpit-panel cockpit-layout">
        <div className="cockpit-product">
          <div className="cockpit-panel__header">
            <h4>Produkt</h4>
          </div>
          <div className="cockpit-product__preview">
            <img src={selectedProduct.image} alt="" className="cockpit-product__image" />
            <div>
              <p className="cockpit-product__title">{selectedProduct.title}</p>
              <p className="cockpit-product__meta">
                SKU {selectedProduct.sku} · EAN {selectedProduct.ean}
              </p>
              <p className="cockpit-product__description">{selectedProduct.description}</p>
            </div>
          </div>

          <div className="cockpit-product__form">
            <label htmlFor="cockpit-qty">Menge</label>
            <input
              id="cockpit-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            />

            <label htmlFor="cockpit-price">Einzelpreis</label>
            <input id="cockpit-price" type="text" value={`${selectedProduct.price.toFixed(2)} €`} readOnly />
          </div>
        </div>

        <div className="cockpit-costs">
          <div className="cockpit-panel__header">
            <h4>Kosten</h4>
          </div>
          <div className="cockpit-costs__row">
            <span>Zwischensumme</span>
            <strong>{(selectedProduct.price * quantity).toFixed(2)} €</strong>
          </div>
          <div className="cockpit-costs__row">
            <span>Versand</span>
            <strong>0,00 €</strong>
          </div>
          <div className="cockpit-costs__row is-total">
            <span>Gesamt</span>
            <strong>{totalPrice} €</strong>
          </div>
        </div>
      </section>

      {/* Adresse + Bestellung bleibt wie gehabt (du kannst den Rest aus deiner Datei übernehmen) */}
      {/* --- ab hier unverändert --- */}

      <section className="cockpit-panel cockpit-address">
        <div className="cockpit-panel__header">
          <h4>Adresse</h4>
        </div>
        <div className="cockpit-address-grid">
          <div className="cockpit-field">
            <label>Anrede*</label>
            <select
              value={address.salutation}
              onChange={(event) => handleAddressChange("salutation", event.target.value, { validate: true })}
            >
              <option value="">Bitte wählen</option>
              <option value="Frau">Frau</option>
              <option value="Herr">Herr</option>
              <option value="Firma">Firma</option>
              <option value="Divers">Divers</option>
            </select>
            {addressErrors.salutation && <p className="cockpit-error">{addressErrors.salutation}</p>}
          </div>

          <div className="cockpit-field-group">
            <div className="cockpit-field">
              <label>Vorname{address.salutation !== "Firma" && "*"}</label>
              <input
                value={address.firstName}
                onChange={(event) => handleAddressChange("firstName", event.target.value)}
                onBlur={(event) => handleAddressChange("firstName", event.target.value, { validate: true })}
              />
              {addressErrors.firstName && <p className="cockpit-error">{addressErrors.firstName}</p>}
            </div>
            <div className="cockpit-field">
              <label>Nachname*</label>
              <input
                value={address.lastName}
                onChange={(event) => handleAddressChange("lastName", event.target.value)}
                onBlur={(event) => handleAddressChange("lastName", event.target.value, { validate: true })}
              />
              {addressErrors.lastName && <p className="cockpit-error">{addressErrors.lastName}</p>}
            </div>
          </div>

          {address.salutation !== "Firma" && (
            <div className="cockpit-field">
              <label>Firma (optional)</label>
              <input value={address.company} onChange={(event) => handleAddressChange("company", event.target.value)} />
            </div>
          )}

          <div className="cockpit-field-group">
            <div className="cockpit-field">
              <label>Straße*</label>
              <input
                value={address.street}
                onChange={(event) => handleAddressChange("street", event.target.value)}
                onBlur={(event) => handleAddressChange("street", event.target.value, { validate: true })}
              />
              {addressErrors.street && <p className="cockpit-error">{addressErrors.street}</p>}
            </div>
            <div className="cockpit-field">
              <label>Nr.*</label>
              <input
                value={address.number}
                onChange={(event) => handleAddressChange("number", event.target.value)}
                onBlur={(event) => handleAddressChange("number", event.target.value, { validate: true })}
              />
              {addressErrors.number && <p className="cockpit-error">{addressErrors.number}</p>}
            </div>
          </div>

          <div className="cockpit-field-group">
            <div className="cockpit-field">
              <label>PLZ*</label>
              <input
                value={address.zip}
                onChange={(event) => handleAddressChange("zip", event.target.value)}
                onBlur={(event) => handleAddressChange("zip", event.target.value, { validate: true })}
              />
              {addressErrors.zip && <p className="cockpit-error">{addressErrors.zip}</p>}
            </div>
            <div className="cockpit-field">
              <label>Ort*</label>
              <input
                value={address.city}
                onChange={(event) => handleAddressChange("city", event.target.value)}
                onBlur={(event) => handleAddressChange("city", event.target.value, { validate: true })}
              />
              {addressErrors.city && <p className="cockpit-error">{addressErrors.city}</p>}
            </div>
          </div>

          <div className="cockpit-field">
            <label>Land*</label>
            <select
              value={address.country}
              onChange={(event) => handleAddressChange("country", event.target.value as "de" | "at", { validate: true })}
            >
              <option value="de">Deutschland</option>
              <option value="at">Österreich</option>
            </select>
            {addressErrors.country && <p className="cockpit-error">{addressErrors.country}</p>}
          </div>

          <div className="cockpit-field">
            <label>E-Mail*</label>
            <input
              type="email"
              value={address.email}
              onChange={(event) => handleAddressChange("email", event.target.value)}
              onBlur={(event) => handleAddressChange("email", event.target.value, { validate: true })}
            />
            {addressErrors.email && <p className="cockpit-error">{addressErrors.email}</p>}
          </div>

          <div className="cockpit-field">
            <label>Telefon</label>
            <input
              value={address.phone}
              onChange={(event) => handleAddressChange("phone", event.target.value)}
              onBlur={(event) => handleAddressChange("phone", event.target.value, { validate: true })}
            />
            {addressErrors.phone && <p className="cockpit-error">{addressErrors.phone}</p>}
          </div>
        </div>
      </section>

      <section className="cockpit-panel cockpit-submit">
        <div className="cockpit-panel__header">
          <h4>Bestellung</h4>
        </div>
        <div className="cockpit-submit__grid">
          <textarea placeholder="Notizen zur Beratung oder Sonderwünsche" rows={3} />
          <div className="cockpit-submit__actions">
            <button type="button" className="secondary">
              Entwurf sichern
            </button>
            <button type="button" onClick={handleSubmitOrder}>
              Abschicken
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
