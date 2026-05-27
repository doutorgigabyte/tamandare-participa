'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  type MapCameraChangedEvent,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

/**
 * Address picker com Places Autocomplete + mapa interativo.
 *
 * Comportamento:
 *   1. Usuário digita → Google Places sugere endereços em Tamandaré (bias bbox)
 *   2. Escolhe sugestão → input vira formatted_address, mapa pula pra coordenada
 *   3. Mapa: clica em qualquer lugar OU arrasta o pin → reverse-geocode → input atualiza
 *
 * Se NEXT_PUBLIC_GMAPS_FRONTEND_KEY não estiver setada, faz fallback gracioso pro
 * input simples (sem mapa nem autocomplete) — o usuário ainda consegue digitar.
 *
 * As lat/lng resolvidas ficam no state interno e são opcionalmente expostas via
 * `onLatLngChange` pra que o caller possa decidir enviar pro backend (e poupar
 * uma chamada de geocode no servidor).
 */

const TAMANDARE_CENTER = { lat: -8.7553, lng: -35.1031 };
const TAMANDARE_BOUNDS = {
  north: -8.65,
  south: -8.85,
  east: -35.0,
  west: -35.25,
};
const MAP_ID = process.env.NEXT_PUBLIC_GMAPS_MAP_ID ?? 'tamandare-dark-v1';

type LatLng = { lat: number; lng: number };

export function AddressPicker({
  value,
  onChange,
  onLatLngChange,
  disabled,
  ariaDescribedBy,
  ariaInvalid,
  placeholder = 'Ex: Rua Praia dos Carneiros, 100',
  id = 'location_address',
}: {
  value: string;
  onChange: (address: string) => void;
  onLatLngChange?: (latLng: LatLng | null) => void;
  disabled?: boolean;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  placeholder?: string;
  id?: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GMAPS_FRONTEND_KEY;
  const hasKey = Boolean(apiKey && !apiKey.includes('REPLACE-ME'));

  // Sem key: input simples (graceful degradation)
  if (!hasKey) {
    return (
      <SimpleInput
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        ariaDescribedBy={ariaDescribedBy}
        ariaInvalid={ariaInvalid}
        placeholder={placeholder}
      />
    );
  }

  return (
    <APIProvider apiKey={apiKey!}>
      <PickerWithKey
        id={id}
        value={value}
        onChange={onChange}
        onLatLngChange={onLatLngChange}
        disabled={disabled}
        ariaDescribedBy={ariaDescribedBy}
        ariaInvalid={ariaInvalid}
        placeholder={placeholder}
      />
    </APIProvider>
  );
}

// ---------------------------------------------------------------------------
// Picker com key — usa Places lib + mapa
// ---------------------------------------------------------------------------

function PickerWithKey({
  id,
  value,
  onChange,
  onLatLngChange,
  disabled,
  ariaDescribedBy,
  ariaInvalid,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (address: string) => void;
  onLatLngChange?: (latLng: LatLng | null) => void;
  disabled?: boolean;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  placeholder: string;
}) {
  const [latLng, setLatLng] = useState<LatLng | null>(null);
  const [mapVisible, setMapVisible] = useState(false);

  const updateLatLng = useCallback(
    (next: LatLng | null) => {
      setLatLng(next);
      onLatLngChange?.(next);
      if (next && !mapVisible) setMapVisible(true);
    },
    [onLatLngChange, mapVisible],
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <AutocompleteInput
          id={id}
          value={value}
          onChange={onChange}
          onSelectPlace={(address, coords) => {
            onChange(address);
            updateLatLng(coords);
          }}
          disabled={disabled}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
          placeholder={placeholder}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setMapVisible((v) => !v)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline disabled:opacity-50"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          {mapVisible ? 'Ocultar mapa' : 'Ou marcar no mapa'}
        </button>
        {latLng && (
          <span className="text-xs text-muted-foreground">
            Localizado em {latLng.lat.toFixed(4)}, {latLng.lng.toFixed(4)}
          </span>
        )}
      </div>

      {mapVisible && (
        <PickerMap
          latLng={latLng}
          onPinChange={(coords) => updateLatLng(coords)}
          onAddressChange={onChange}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AutocompleteInput — usa google.maps.places.Autocomplete
// ---------------------------------------------------------------------------

function AutocompleteInput({
  id,
  value,
  onChange,
  onSelectPlace,
  disabled,
  ariaDescribedBy,
  ariaInvalid,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (address: string) => void;
  onSelectPlace: (address: string, coords: LatLng) => void;
  disabled?: boolean;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  placeholder: string;
}) {
  const placesLib = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const ac = new placesLib.Autocomplete(inputRef.current, {
      bounds: TAMANDARE_BOUNDS,
      strictBounds: false, // aceita endereços fora da bbox mas prioriza dentro
      componentRestrictions: { country: 'br' },
      fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      types: ['geocode'],
    });
    acRef.current = ac;

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place?.geometry?.location) return;
      const address =
        place.formatted_address
        ?? place.name
        ?? inputRef.current?.value
        ?? '';
      onSelectPlace(address, {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });

    return () => {
      listener.remove();
      acRef.current = null;
    };
  }, [placesLib, onSelectPlace]);

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="text"
      autoComplete="street-address"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className="block w-full min-h-[48px] rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground shadow-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

// ---------------------------------------------------------------------------
// PickerMap — mapa com pin draggable + click-to-move + reverse geocode
// ---------------------------------------------------------------------------

function PickerMap({
  latLng,
  onPinChange,
  onAddressChange,
}: {
  latLng: LatLng | null;
  onPinChange: (latLng: LatLng) => void;
  onAddressChange: (address: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-card">
      <div className="h-[280px] sm:h-[360px]">
        <Map
          mapId={MAP_ID}
          defaultCenter={latLng ?? TAMANDARE_CENTER}
          defaultZoom={latLng ? 16 : 13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
        >
          <PinController
            latLng={latLng}
            onPinChange={onPinChange}
            onAddressChange={onAddressChange}
          />
        </Map>
      </div>
      <p className="border-t border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
        Clique no mapa pra marcar a localização ou arraste o pino. O endereço é
        preenchido automaticamente.
      </p>
    </div>
  );
}

function PinController({
  latLng,
  onPinChange,
  onAddressChange,
}: {
  latLng: LatLng | null;
  onPinChange: (latLng: LatLng) => void;
  onAddressChange: (address: string) => void;
}) {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!geocodingLib) return;
    geocoderRef.current = new geocodingLib.Geocoder();
  }, [geocodingLib]);

  // Centraliza o mapa quando o lat/lng muda externamente (autocomplete)
  useEffect(() => {
    if (!map || !latLng) return;
    map.panTo(latLng);
    map.setZoom(16);
  }, [map, latLng]);

  const reverseGeocode = useCallback(
    (coords: LatLng) => {
      if (!geocoderRef.current) return;
      geocoderRef.current.geocode(
        { location: coords },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            onAddressChange(results[0].formatted_address);
          }
        },
      );
    },
    [onAddressChange],
  );

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!e.detail.latLng) return;
      const coords = {
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng,
      };
      onPinChange(coords);
      reverseGeocode(coords);
    },
    [onPinChange, reverseGeocode],
  );

  // Attach map click via map instance
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      onPinChange(coords);
      reverseGeocode(coords);
    });
    return () => listener.remove();
  }, [map, onPinChange, reverseGeocode]);

  if (!latLng) return null;

  return (
    <AdvancedMarker
      position={latLng}
      draggable
      onDragEnd={(e) => {
        if (!e.latLng) return;
        const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        onPinChange(coords);
        reverseGeocode(coords);
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-atlantico-terracota text-white shadow-hero">
        <MapPin className="h-5 w-5" aria-hidden />
      </div>
    </AdvancedMarker>
  );
}

// ---------------------------------------------------------------------------
// Fallback sem Maps key
// ---------------------------------------------------------------------------

function SimpleInput({
  id,
  value,
  onChange,
  disabled,
  ariaDescribedBy,
  ariaInvalid,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (address: string) => void;
  disabled?: boolean;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  placeholder: string;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="text"
      autoComplete="street-address"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className="block w-full min-h-[48px] rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground shadow-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
