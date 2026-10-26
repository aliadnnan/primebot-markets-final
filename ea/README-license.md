# PrimeBot Online License — Setup Guide / سیٹ اپ گائیڈ

The license system lives on the PrimeBot Markets website. The admin creates a
license (MT5 account + key + expiry) in **Admin → Licenses**, and the EA asks
the website every 15 minutes whether its license is still active. Disabling a
license — or its expiry date passing — stops the EA from opening new trades.
This is an online control **on top of** the compiled-in account-number lock,
not a replacement for it.

Admin's one pending step: run **sql/14_licenses.sql** once in the Supabase
SQL Editor, or the Licenses tab and the check API have no table to read.

---

## English — putting the check into an EA

1. **Allow the website in MT5 (one time, on every terminal/VPS the EA runs on):**
   MT5 → **Tools → Options → Expert Advisors** → tick
   **"Allow WebRequest for listed URL"** → add exactly:
   `https://primebot-markets-final.vercel.app`
   Without this, WebRequest fails with error 4060 and the EA prints the fix
   in the Experts log.

2. **Copy the include file:** put `PrimeBotLicense.mqh` in the terminal's
   `MQL5/Include` folder (MetaEditor → File → Open Data Folder).

3. **Include it** at the top of the EA source, after the existing includes:
   ```mql5
   #include <PrimeBotLicense.mqh>
   ```
   Two inputs appear in the EA's Inputs tab: `InpLicenseKey` (paste the key
   the admin generated for this buyer) and `InpLicenseCheckUrl` (leave the
   default).

4. **Wire the calls:**
   ```mql5
   int OnInit()
   {
      LicenseInit();          // first check
      // ... existing init code ...
   }

   void OnTick()
   {
      LicenseTick();          // re-checks every 15 minutes
      // ... existing tick code ...
   }
   ```

5. **Gate every new-trade entry** (grid opens, first trades, recovery/big
   trades — every place the EA would open a NEW position):
   ```mql5
   if(!LicenseOK()) return;   // license disabled/expired/not found
   ```
   Do **not** gate basket management or closing logic — open positions keep
   being managed; only new entries stop.

6. **Compile with F7** (0 errors) and re-attach. The Experts log prints
   `[PrimeBot License] OK - ... license is ACTIVE.` when the check passes.

Behaviour notes: a network failure never stops the EA — the last known state
is kept and the check retries in 15 minutes. Only an explicit server answer
(disabled / expired / not found) stops new trades. The check API itself is
`GET https://primebot-markets-final.vercel.app/api/license/check?account=<MT5 account>&key=<license key>`
and returns only `{"ok":true,"active":true,...}` or
`{"ok":false,"reason":"disabled"|"expired"|"not_found"}`.

---

## اردو — EA میں لائسنس چیک لگانا

۱۔ **MT5 میں ویب سائٹ کی اجازت (ایک بار، ہر ٹرمینل/VPS پر):**
MT5 ← Tools ← Options ← Expert Advisors ←
**"Allow WebRequest for listed URL"** پر ٹک لگائیں اور یہ پتہ شامل کریں:
`https://primebot-markets-final.vercel.app`
یہ نہ ہو تو WebRequest error 4060 دے گا اور EA Experts لاگ میں یہی حل لکھے گا۔

۲۔ **فائل رکھیں:** `PrimeBotLicense.mqh` کو ٹرمینل کے `MQL5/Include` فولڈر میں کاپی کریں۔

۳۔ **EA سورس میں شامل کریں:**
```mql5
#include <PrimeBotLicense.mqh>
```
Inputs میں دو خانے آئیں گے: `InpLicenseKey` (ایڈمن کی بنائی ہوئی کلید یہاں ڈالیں) اور `InpLicenseCheckUrl` (ڈیفالٹ ہی رہنے دیں)۔

۴۔ **کالز لگائیں:** `OnInit()` میں `LicenseInit();` اور `OnTick()` میں `LicenseTick();` (یہ ہر ۱۵ منٹ بعد خود دوبارہ چیک کرتی ہے)۔

۵۔ **ہر نئی ٹریڈ سے پہلے گیٹ لگائیں** (گرڈ، پہلی ٹریڈ، ریکوری — جہاں بھی EA نئی پوزیشن کھولتا ہے):
```mql5
if(!LicenseOK()) return;
```
باسکٹ مینجمنٹ اور کلوزنگ پر یہ گیٹ **نہیں** لگانا — کھلی پوزیشنز چلتی رہیں گی، صرف نئی انٹریاں رکیں گی۔

۶۔ **F7 سے compile** کریں (Errors 0) اور EA دوبارہ لگائیں۔ Experts لاگ میں
`[PrimeBot License] OK` آئے تو لائسنس فعال ہے۔

نوٹ: انٹرنیٹ فیل ہونے سے EA **نہیں** رکتا — آخری حالت برقرار رہتی ہے اور ۱۵ منٹ بعد دوبارہ چیک ہوتا ہے۔ ٹریڈ صرف تب رکتی ہے جب سرور واضح جواب دے (disabled / expired / not found) — یعنی جب آپ ایڈمن پینل سے ID بند کریں یا اس کی مدت ختم ہو جائے۔
