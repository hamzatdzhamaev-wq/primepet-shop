# 🚀 Vercel Deployment - Schritt-für-Schritt Anleitung

## 📋 Was du brauchst

- GitHub Account (kostenlos)
- Vercel Account (kostenlos)
- Dein CJDropshipping API-Key: `CJ5107361@api@afcb7d6a9f044986943ace354ab98858`

---

## Schritt 1: GitHub Repository erstellen

### A. Git initialisieren

Öffne die Kommandozeile im PrimePet-Ordner:

```bash
cd C:\Users\PC\PrimePet
git init
git add .
git commit -m "Initial commit: PrimePet Shop mit CJDropshipping"
```

### B. Auf GitHub pushen

1. Gehe zu [github.com](https://github.com) und logge dich ein
2. Klicke auf **"New repository"** (grüner Button)
3. Name: `primepet-shop`
4. Beschreibung: `Premium Dropshipping Pet Shop`
5. **Public** auswählen
6. Klicke **"Create repository"**

7. Führe folgende Befehle aus:

```bash
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/primepet-shop.git
git push -u origin main
```

Ersetze `DEIN-USERNAME` mit deinem GitHub-Benutzernamen!

---

## Schritt 2: Vercel Account erstellen

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke **"Sign Up"**
3. Wähle **"Continue with GitHub"**
4. Autorisiere Vercel für dein GitHub-Konto

---

## Schritt 3: Projekt auf Vercel deployen

### A. Projekt importieren

1. Klicke auf **"Add New..." → Project**
2. Wähle **"Import Git Repository"**
3. Suche nach `primepet-shop`
4. Klicke **"Import"**

### B. Project konfigurieren

**Framework Preset:** Other  
**Build Command:** (leer lassen)  
**Output Directory:** `.` (Punkt)  
**Install Command:** `npm install`

### C. Environment Variables setzen

**WICHTIG!** Klicke auf **"Environment Variables"**

Füge hinzu:
```
Name:  CJ_API_KEY
Value: CJ5107361@api@afcb7d6a9f044986943ace354ab98858
```

Klicke **"Add"**

### D. Deploy!

Klicke auf **"Deploy"**

Vercel baut jetzt deine Webseite... ⏳

---

## Schritt 4: Webseite ist live! 🎉

Nach 1-2 Minuten siehst du:

```
✅ Deployment successful!
🌐 Your site is live at: https://primepet-shop-xyz.vercel.app
```

### Teste deine Webseite:

1. **Hauptseite**: `https://dein-projekt.vercel.app`
2. **Login**: `https://dein-projekt.vercel.app/login.html`
   - Passwort: `admin`
3. **Admin**: Klicke auf "CJ Import"
4. **Produkte importieren**: Du siehst jetzt die CJDropshipping-Produkte!

---

## Schritt 5: Custom Domain (Optional)

### A. Domain verbinden

1. In Vercel: Klicke **"Settings" → "Domains"**
2. Gib deine Domain ein (z.B. `primepet.de`)
3. Folge den DNS-Anweisungen

### B. SSL-Zertifikat

- Vercel erstellt automatisch ein kostenloses SSL-Zertifikat
- Deine Seite läuft automatisch über HTTPS 🔒

---

## 🔧 Automatische Updates

Jedes Mal wenn du etwas änderst:

```bash
git add .
git commit -m "Update: ..."
git push
```

Vercel deployt automatisch neu! ✨

---

## ⚠️ Wichtig: Admin-Passwort ändern

**Vor dem Live-Gehen:**

Ändere das Admin-Passwort in `login.html`:
```javascript
const correctPassword = 'dein-sicheres-passwort';
```

---

## 📊 Monitoring & Analytics

In deinem Vercel Dashboard:
- **Analytics**: Sehe Besucher-Zahlen
- **Logs**: API-Aufrufe überwachen
- **Performance**: Ladezeiten prüfen

---

## 🆘 Troubleshooting

### Problem: "CJ API Authentifizierung fehlgeschlagen"

**Lösung:** Prüfe ob `CJ_API_KEY` in Vercel Environment Variables gesetzt ist

### Problem: "Serverless Function Error"

**Lösung:** 
1. Gehe zu Vercel → Functions → Logs
2. Siehe nach Fehler-Meldungen
3. Meist: API-Key fehlt oder falsch

### Problem: API-Calls funktionieren nicht

**Lösung:** Hard-Refresh im Browser (Ctrl+Shift+R)

---

## ✅ Deployment Checkliste

- [ ] Git Repository auf GitHub erstellt
- [ ] Vercel Account erstellt  
- [ ] Projekt auf Vercel importiert
- [ ] `CJ_API_KEY` Environment Variable gesetzt
- [ ] Deployment erfolgreich
- [ ] Webseite erreichbar
- [ ] Login funktioniert (Passwort: `admin`)
- [ ] CJ-Import funktioniert
- [ ] Admin-Passwort geändert
- [ ] (Optional) Custom Domain verbunden

---

## 🎉 Fertig!

Dein **PrimePet Dropshipping-Shop** ist jetzt live!

- ✅ Vollständig automatisiert
- ✅ CJDropshipping integriert
- ✅ Kostenlos gehostet auf Vercel
- ✅ Bereit für echte Kunden

**Viel Erfolg mit deinem Shop!** 🐾

---

Bei Fragen: Siehe `README.md` oder `CJ_INTEGRATION_ANLEITUNG.md`
