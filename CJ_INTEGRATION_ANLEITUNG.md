# CJDropshipping Integration - Anleitung

## Übersicht

Die CJDropshipping-Integration ermöglicht es dir, Produkte direkt von CJDropshipping in deinen PrimePet-Shop zu importieren, Bestellungen automatisch weiterzuleiten und Lagerbestände zu synchronisieren.

---

## 📋 Voraussetzungen

1. **CJDropshipping Account**
   - Registriere dich auf [www.cjdropshipping.com](https://www.cjdropshipping.com)
   - Verifiziere deinen Account

2. **API-Zugang**
   - Logge dich in deinen CJDropshipping Account ein
   - Gehe zu: **Account → API Settings**
   - Klicke auf **"Generate API Key"**
   - Kopiere deinen API Key (Format: `CJUserNum@api@xxxxxxxxxxxxx`)

3. **Webserver mit PHP**
   - PHP 7.4 oder höher
   - cURL-Extension aktiviert
   - Schreibrechte für Verzeichnisse

---

## ⚙️ Einrichtung

### Schritt 1: API-Key konfigurieren

1. Öffne die Datei: `api/config.php`

2. Trage deinen API-Key ein:
   ```php
   define('CJ_API_KEY', 'CJUserNum@api@HIER_DEINEN_API_KEY_EINTRAGEN');
   ```

3. Speichere die Datei

### Schritt 2: Verzeichnisse prüfen

Das System erstellt automatisch folgende Verzeichnisse:
- `api/cache/` - Für Access Tokens
- `api/logs/` - Für Fehlerprotokolle
- `data/` - Für Bestellungen

Falls diese nicht automatisch erstellt werden, erstelle sie manuell und setze Schreibrechte (755).

### Schritt 3: Server-Upload

Lade alle Dateien auf deinen Webserver hoch:
- `/api/` Ordner komplett
- `/js/cj-integration.js`
- `admin-cj-integration.html`

---

## 🚀 Nutzung

### Produkte importieren

1. Logge dich im Admin-Panel ein: `admin.html`

2. Klicke auf **"CJ Import"** Button

3. Du siehst nun alle verfügbaren CJDropshipping-Produkte

4. Für jedes Produkt kannst du einstellen:
   - **Kategorie** (Hunde, Katzen, Vögel, Kleintiere)
   - **Gewinnaufschlag** (Standard: 50%)
   - **Badge** (NEU, Bestseller, Sale)

5. Klicke auf **"Produkt importieren"**

6. Das Produkt erscheint nun in deinem Shop!

### Automatische Bestellweiterleitung

Die Bestellweiterleitung erfolgt automatisch:

1. Kunde bestellt im Shop
2. PayPal-Zahlung wird abgeschlossen
3. System sendet Bestellung automatisch an CJDropshipping
4. Du erhältst eine Bestellnummer
5. CJDropshipping versendet das Produkt direkt an den Kunden

### Lagerbestand synchronisieren

**Manuelle Synchronisation:**
1. Gehe zur CJ Import Seite
2. Klicke auf **"Lagerbestand sync"**
3. Warte bis die Synchronisation abgeschlossen ist

**Automatische Synchronisation (Empfohlen):**
Richte einen Cronjob ein, der stündlich läuft:
```bash
0 * * * * php /pfad/zu/deiner/webseite/api/sync-stock.php
```

---

## 📊 Funktionen im Detail

### 1. Produktimport
- Automatischer Import von Produktdaten
- Bilder werden übernommen
- Preise mit einstellbarem Gewinnaufschlag
- Lagerbestands-Tracking

### 2. Bestellverwaltung
- Automatische Weiterleitung an CJDropshipping
- Bestellnummern-Tracking
- Versandstatus-Überwachung

### 3. Lagerbestand-Sync
- Regelmäßige Aktualisierung der Lagerbestände
- Automatische Preis-Updates
- Out-of-Stock Verwaltung

### 4. Tracking-Integration
- Sendungsverfolgung für Kunden
- Tracking-Nummern abrufen
- Versandstatus-Updates

---

## 🔧 API-Endpunkte

### Produktimport
```
GET api/import-products.php?action=list&page=1&pageSize=20
GET api/import-products.php?action=detail&pid=PRODUCT_ID
POST api/import-products.php?action=import
```

### Bestellverwaltung
```
POST api/create-order.php
```

### Tracking
```
GET api/tracking.php?orderNumber=ORDER_NUMBER
```

### Lagerbestand-Sync
```
GET api/sync-stock.php
```

---

## 🛡️ Sicherheit

1. **API-Key schützen**
   - Speichere `api/config.php` außerhalb des öffentlichen Webverzeichnisses (empfohlen)
   - Oder schütze das `/api/` Verzeichnis mit `.htaccess`

2. **Admin-Authentifizierung**
   - Die API-Endpunkte prüfen die Admin-Session
   - Nur eingeloggte Admins können importieren

3. **HTTPS verwenden**
   - Nutze immer HTTPS für deine Webseite
   - Die CJ-API erfordert HTTPS

---

## 📝 Logs & Debugging

### Logs anzeigen
Fehlerprotokolle findest du in: `api/logs/cj_api.log`

### Debug-Modus
In `api/config.php`:
```php
define('CJ_DEBUG_MODE', true);  // Debug einschalten
define('CJ_DEBUG_MODE', false); // Debug ausschalten (Produktion)
```

### Typische Probleme

**Problem: "Fehler bei der CJ API Authentifizierung"**
- Lösung: Prüfe ob dein API-Key korrekt ist
- Stelle sicher dass das `api/cache/` Verzeichnis beschreibbar ist

**Problem: "Keine Produkte gefunden"**
- Lösung: Prüfe die Logs in `api/logs/cj_api.log`
- Teste ob die CJ-API erreichbar ist

**Problem: "Verbindungsfehler"**
- Lösung: Prüfe ob PHP cURL aktiviert ist
- Teste die Firewall-Einstellungen

---

## 💰 Preiskalkulation

### Beispiel:
- **CJ Einkaufspreis**: €10.00
- **Gewinnaufschlag**: 50%
- **Verkaufspreis**: €15.00

### Gewinnaufschlag anpassen:
Im CJ Import Interface kannst du für jedes Produkt individuell einstellen:
- 30% = Faktor 1.3
- 50% = Faktor 1.5 (Standard)
- 100% = Faktor 2.0

---

## 🔄 Workflow

```
1. Produkt von CJ importieren
   ↓
2. Produkt erscheint im Shop
   ↓
3. Kunde bestellt & bezahlt
   ↓
4. Bestellung wird automatisch an CJ gesendet
   ↓
5. CJ versendet Produkt an Kunden
   ↓
6. Tracking-Nummer wird bereitgestellt
   ↓
7. Kunde erhält Tracking-Info
```

---

## 📞 Support

Bei Problemen mit der Integration:

1. **Logs prüfen**: `api/logs/cj_api.log`
2. **CJDropshipping Dokumentation**: [developers.cjdropshipping.com](https://developers.cjdropshipping.com/)
3. **CJDropshipping Support**: Kontaktiere den CJ-Support bei API-Problemen

---

## ✅ Checkliste nach Installation

- [ ] API-Key in `api/config.php` eingetragen
- [ ] Verzeichnisse `api/cache/` und `api/logs/` erstellt und beschreibbar
- [ ] Admin-Panel erreichbar und Login funktioniert
- [ ] CJ Import Button im Admin-Panel sichtbar
- [ ] Test-Produktimport erfolgreich
- [ ] Cronjob für Lagerbestand-Sync eingerichtet (optional)
- [ ] HTTPS aktiviert

---

## 🎉 Fertig!

Deine CJDropshipping-Integration ist nun einsatzbereit!

Du kannst jetzt:
- ✅ Tausende Produkte importieren
- ✅ Automatisch Bestellungen weiterleiten
- ✅ Lagerbestände synchronisieren
- ✅ Einen vollständig automatisierten Dropshipping-Shop betreiben

Viel Erfolg mit deinem PrimePet Dropshipping-Shop! 🐾
